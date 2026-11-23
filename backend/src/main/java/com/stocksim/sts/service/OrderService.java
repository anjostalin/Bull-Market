package com.stocksim.sts.service;

import com.stocksim.sts.dto.OrderDtos.*;
import com.stocksim.sts.entity.*;
import com.stocksim.sts.exception.ApiException;
import com.stocksim.sts.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final TradeRepository tradeRepository;
    private final HoldingRepository holdingRepository;
    private final StockRepository stockRepository;
    private final WalletService walletService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final MarketClock marketClock;

    public OrderService(OrderRepository orderRepository, TradeRepository tradeRepository,
                        HoldingRepository holdingRepository, StockRepository stockRepository,
                        WalletService walletService, NotificationService notificationService,
                        UserRepository userRepository, EmailService emailService,
                        MarketClock marketClock) {
        this.orderRepository = orderRepository;
        this.tradeRepository = tradeRepository;
        this.holdingRepository = holdingRepository;
        this.stockRepository = stockRepository;
        this.walletService = walletService;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.marketClock = marketClock;
    }

    @Transactional
    public OrderView place(Long userId, PlaceOrderRequest req, String ip) {
        Stock stock = stockRepository.findById(req.stockId())
                .orElseThrow(() -> ApiException.notFound("Stock not found"));

        if (req.quantity() == null || req.quantity() <= 0) {
            throw ApiException.badRequest("Quantity must be positive");
        }
        if (req.orderType() == Order.OrderType.LIMIT && req.limitPrice() == null) {
            throw ApiException.badRequest("Limit price required for LIMIT order");
        }
        if (req.orderType() == Order.OrderType.STOP_LOSS && req.stopPrice() == null) {
            throw ApiException.badRequest("Stop price required for STOP_LOSS order");
        }
        if (!marketClock.isOpen(stock.getMarket())) {
            throw ApiException.badRequest(stock.getMarket().name() + " market is closed. Trading is available during market hours.");
        }

        Order order = Order.builder()
                .userId(userId)
                .stock(stock)
                .orderType(req.orderType())
                .direction(req.direction())
                .quantity(req.quantity())
                .limitPrice(req.limitPrice())
                .stopPrice(req.stopPrice())
                .paper(req.paper())
                .status(Order.Status.PENDING)
                .ipAddress(ip)
                .build();
        order = orderRepository.save(order);

        // Market orders execute immediately; LIMIT/STOP_LOSS stay PENDING for the matcher (Sprint 2).
        if (req.orderType() == Order.OrderType.MARKET) {
            execute(order, stock.getCurrentPrice());
        }
        return toView(order);
    }

    /**
     * Executes an order atomically: records the trade, updates the holding (weighted-avg cost basis),
     * and debits/credits the wallet. Any failure rolls the whole thing back.
     */
    @Transactional
    public void execute(Order order, BigDecimal executionPrice) {
        int qty = order.getQuantity();
        BigDecimal total = executionPrice.multiply(BigDecimal.valueOf(qty)).setScale(2, RoundingMode.HALF_UP);
        String cur = order.getStock().getCurrency();
        String sym = cur != null && cur.equalsIgnoreCase("USD") ? "$" : "₹";

        if (order.getDirection() == Order.Direction.BUY) {
            if (!order.isPaper() && !walletService.hasBalance(order.getUserId(), total, cur)) {
                reject(order, "Insufficient " + cur + " wallet balance");
                return;
            }
            applyBuyHolding(order, executionPrice, qty);
            if (!order.isPaper()) {
                walletService.debit(order.getUserId(), total, cur, WalletTransaction.Type.BUY, order.getId(),
                        "BUY " + qty + " " + order.getStock().getSymbol());
            }
        } else { // SELL
            Holding holding = holdingRepository.findByUserIdAndStockId(order.getUserId(), order.getStock().getId())
                    .orElse(null);
            if (holding == null || holding.getQuantity() < qty) {
                reject(order, "Insufficient holdings to sell");
                return;
            }
            applySellHolding(holding, executionPrice, qty);
            if (!order.isPaper()) {
                walletService.credit(order.getUserId(), total, cur, WalletTransaction.Type.SELL, order.getId(),
                        "SELL " + qty + " " + order.getStock().getSymbol());
            }
        }

        order.setStatus(Order.Status.EXECUTED);
        order.setExecutedPrice(executionPrice);
        orderRepository.save(order);

        tradeRepository.save(Trade.builder()
                .orderId(order.getId())
                .userId(order.getUserId())
                .stock(order.getStock())
                .direction(order.getDirection())
                .quantity(qty)
                .price(executionPrice)
                .totalValue(total)
                .paper(order.isPaper())
                .build());

        if (!order.isPaper()) {
            String msg = String.format("%s %d %s @ %s%s executed (total %s%s)",
                    order.getDirection().name(), qty, order.getStock().getSymbol(), sym, executionPrice, sym, total);
            notificationService.create(order.getUserId(), Notification.Type.ORDER_EXECUTED, msg);
            userRepository.findById(order.getUserId())
                    .ifPresent(u -> emailService.sendOrderExecuted(u.getEmail(), msg));
        }
    }

    private void applyBuyHolding(Order order, BigDecimal price, int qty) {
        Holding holding = holdingRepository.findByUserIdAndStockId(order.getUserId(), order.getStock().getId())
                .orElse(null);
        if (holding == null) {
            holding = Holding.builder()
                    .userId(order.getUserId())
                    .stock(order.getStock())
                    .quantity(qty)
                    .avgBuyPrice(price)
                    .realizedPnl(BigDecimal.ZERO)
                    .build();
        } else {
            int newQty = holding.getQuantity() + qty;
            BigDecimal existingCost = holding.getAvgBuyPrice().multiply(BigDecimal.valueOf(holding.getQuantity()));
            BigDecimal addedCost = price.multiply(BigDecimal.valueOf(qty));
            BigDecimal newAvg = existingCost.add(addedCost)
                    .divide(BigDecimal.valueOf(newQty), 2, RoundingMode.HALF_UP);
            holding.setQuantity(newQty);
            holding.setAvgBuyPrice(newAvg);
        }
        holdingRepository.save(holding);
    }

    private void applySellHolding(Holding holding, BigDecimal price, int qty) {
        BigDecimal realized = price.subtract(holding.getAvgBuyPrice())
                .multiply(BigDecimal.valueOf(qty)).setScale(2, RoundingMode.HALF_UP);
        holding.setRealizedPnl(holding.getRealizedPnl().add(realized));
        int remaining = holding.getQuantity() - qty;
        holding.setQuantity(remaining);
        if (remaining == 0) {
            holdingRepository.delete(holding);
        } else {
            holdingRepository.save(holding);
        }
    }

    private void reject(Order order, String reason) {
        order.setStatus(Order.Status.REJECTED);
        order.setRejectReason(reason);
        orderRepository.save(order);
    }

    @Transactional
    public OrderView cancel(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> ApiException.notFound("Order not found"));
        if (!order.getUserId().equals(userId)) throw ApiException.forbidden("Not your order");
        if (order.getStatus() != Order.Status.PENDING) {
            throw ApiException.badRequest("Only PENDING orders can be cancelled");
        }
        order.setStatus(Order.Status.CANCELLED);
        orderRepository.save(order);
        return toView(order);
    }

    public Page<OrderView> listForUser(Long userId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable).map(this::toView);
    }

    public OrderView toView(Order o) {
        return new OrderView(o.getId(), o.getStock().getId(), o.getStock().getSymbol(),
                o.getOrderType().name(), o.getDirection().name(), o.getQuantity(),
                o.getLimitPrice(), o.getStopPrice(), o.getExecutedPrice(),
                o.getStatus().name(), o.isPaper(), o.getRejectReason(), o.getCreatedAt());
    }
}
