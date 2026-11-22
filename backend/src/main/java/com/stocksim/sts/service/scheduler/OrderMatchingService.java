package com.stocksim.sts.service.scheduler;

import com.stocksim.sts.entity.Order;
import com.stocksim.sts.repository.OrderRepository;
import com.stocksim.sts.service.OrderService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Evaluates PENDING LIMIT and STOP_LOSS orders every tick and executes those whose
 * price condition is met (Section 12.3). Execution semantics:
 *   LIMIT  BUY  -> market price <= limit price
 *   LIMIT  SELL -> market price >= limit price
 *   STOP_LOSS BUY  -> market price >= stop price  (breakout stop)
 *   STOP_LOSS SELL -> market price <= stop price  (protective stop)
 * STOP_LOSS triggers execute at the current market price.
 */
@Component
public class OrderMatchingService {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    public OrderMatchingService(OrderRepository orderRepository, OrderService orderService) {
        this.orderRepository = orderRepository;
        this.orderService = orderService;
    }

    @Scheduled(fixedDelayString = "${sts.market.tick-interval-ms:5000}")
    @Transactional
    public void match() {
        List<Order> pending = orderRepository.findByStatus(Order.Status.PENDING);
        for (Order order : pending) {
            if (order.getOrderType() == Order.OrderType.MARKET) continue; // should already be executed
            BigDecimal price = order.getStock().getCurrentPrice();
            if (shouldExecute(order, price)) {
                orderService.execute(order, price);
            }
        }
    }

    private boolean shouldExecute(Order order, BigDecimal price) {
        return switch (order.getOrderType()) {
            case LIMIT -> order.getDirection() == Order.Direction.BUY
                    ? price.compareTo(order.getLimitPrice()) <= 0
                    : price.compareTo(order.getLimitPrice()) >= 0;
            case STOP_LOSS -> order.getDirection() == Order.Direction.BUY
                    ? price.compareTo(order.getStopPrice()) >= 0
                    : price.compareTo(order.getStopPrice()) <= 0;
            case MARKET -> false;
        };
    }
}
