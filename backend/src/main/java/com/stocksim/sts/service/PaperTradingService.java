package com.stocksim.sts.service;

import com.stocksim.sts.dto.PaperDtos.*;
import com.stocksim.sts.entity.*;
import com.stocksim.sts.exception.ApiException;
import com.stocksim.sts.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Isolated paper-trading sandbox (FR-12 / Section 10.7). Separate ₹10,00,000 wallet and holdings;
 * never touches the real wallet, holdings, or portfolio metrics. Market-order execution only.
 */
@Service
public class PaperTradingService {

    private static final BigDecimal INITIAL_CAPITAL = new BigDecimal("1000000.00");

    private final PaperWalletRepository walletRepository;
    private final PaperHoldingRepository holdingRepository;
    private final StockRepository stockRepository;
    private final UserRepository userRepository;

    public PaperTradingService(PaperWalletRepository walletRepository, PaperHoldingRepository holdingRepository,
                               StockRepository stockRepository, UserRepository userRepository) {
        this.walletRepository = walletRepository;
        this.holdingRepository = holdingRepository;
        this.stockRepository = stockRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public PaperWallet wallet(Long userId) {
        return walletRepository.findByUserId(userId)
                .orElseGet(() -> walletRepository.save(PaperWallet.builder()
                        .userId(userId).balance(INITIAL_CAPITAL).build()));
    }

    @Transactional
    public PaperPortfolio trade(Long userId, PaperOrderRequest req) {
        Stock stock = stockRepository.findById(req.stockId())
                .orElseThrow(() -> ApiException.notFound("Stock not found"));
        PaperWallet wallet = wallet(userId);
        BigDecimal price = stock.getCurrentPrice();
        int qty = req.quantity();
        BigDecimal total = price.multiply(BigDecimal.valueOf(qty)).setScale(2, RoundingMode.HALF_UP);

        if (req.direction() == Order.Direction.BUY) {
            if (wallet.getBalance().compareTo(total) < 0) {
                throw ApiException.badRequest("Insufficient paper balance");
            }
            wallet.setBalance(wallet.getBalance().subtract(total));
            applyBuy(userId, stock, price, qty);
        } else {
            PaperHolding h = holdingRepository.findByUserIdAndStockId(userId, stock.getId()).orElse(null);
            if (h == null || h.getQuantity() < qty) throw ApiException.badRequest("Insufficient paper holdings");
            wallet.setBalance(wallet.getBalance().add(total));
            applySell(h, qty);
        }
        walletRepository.save(wallet);
        return portfolio(userId);
    }

    private void applyBuy(Long userId, Stock stock, BigDecimal price, int qty) {
        PaperHolding h = holdingRepository.findByUserIdAndStockId(userId, stock.getId()).orElse(null);
        if (h == null) {
            h = PaperHolding.builder().userId(userId).stock(stock).quantity(qty).avgBuyPrice(price).build();
        } else {
            int newQty = h.getQuantity() + qty;
            BigDecimal existing = h.getAvgBuyPrice().multiply(BigDecimal.valueOf(h.getQuantity()));
            BigDecimal added = price.multiply(BigDecimal.valueOf(qty));
            h.setAvgBuyPrice(existing.add(added).divide(BigDecimal.valueOf(newQty), 2, RoundingMode.HALF_UP));
            h.setQuantity(newQty);
        }
        holdingRepository.save(h);
    }

    private void applySell(PaperHolding h, int qty) {
        int remaining = h.getQuantity() - qty;
        if (remaining == 0) holdingRepository.delete(h);
        else { h.setQuantity(remaining); holdingRepository.save(h); }
    }

    public PaperPortfolio portfolio(Long userId) {
        PaperWallet wallet = wallet(userId);
        List<PaperHolding> holdings = holdingRepository.findByUserId(userId);
        List<PaperHoldingView> views = new ArrayList<>();
        BigDecimal holdingsValue = BigDecimal.ZERO;
        for (PaperHolding h : holdings) {
            BigDecimal cur = h.getStock().getCurrentPrice();
            BigDecimal qty = BigDecimal.valueOf(h.getQuantity());
            BigDecimal value = cur.multiply(qty).setScale(2, RoundingMode.HALF_UP);
            BigDecimal pnl = cur.subtract(h.getAvgBuyPrice()).multiply(qty).setScale(2, RoundingMode.HALF_UP);
            views.add(new PaperHoldingView(h.getStock().getId(), h.getStock().getSymbol(),
                    h.getQuantity(), h.getAvgBuyPrice(), cur, value, pnl));
            holdingsValue = holdingsValue.add(value);
        }
        BigDecimal totalValue = wallet.getBalance().add(holdingsValue);
        BigDecimal returnPct = totalValue.subtract(INITIAL_CAPITAL)
                .divide(INITIAL_CAPITAL, 6, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);
        return new PaperPortfolio(wallet.getBalance(), holdingsValue, totalValue, returnPct, views);
    }

    public List<LeaderboardEntry> leaderboard() {
        List<PaperWallet> wallets = walletRepository.findAll();
        List<LeaderboardEntry> entries = new ArrayList<>();
        for (PaperWallet w : wallets) {
            PaperPortfolio p = portfolio(w.getUserId());
            String name = userRepository.findById(w.getUserId()).map(User::getFullName).orElse("Trader " + w.getUserId());
            entries.add(new LeaderboardEntry(0, name, p.totalValue(), p.returnPercent()));
        }
        entries.sort(Comparator.comparing(LeaderboardEntry::returnPercent).reversed());
        List<LeaderboardEntry> ranked = new ArrayList<>();
        for (int i = 0; i < entries.size(); i++) {
            LeaderboardEntry e = entries.get(i);
            ranked.add(new LeaderboardEntry(i + 1, e.trader(), e.totalValue(), e.returnPercent()));
        }
        return ranked;
    }
}
