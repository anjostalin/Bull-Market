package com.stocksim.sts.service;

import com.stocksim.sts.dto.PortfolioDtos.*;
import com.stocksim.sts.entity.Holding;
import com.stocksim.sts.entity.Wallet;
import com.stocksim.sts.repository.HoldingRepository;
import com.stocksim.sts.repository.PortfolioSnapshotRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class PortfolioService {

    private final HoldingRepository holdingRepository;
    private final WalletService walletService;
    private final PortfolioSnapshotRepository snapshotRepository;

    public PortfolioService(HoldingRepository holdingRepository, WalletService walletService,
                            PortfolioSnapshotRepository snapshotRepository) {
        this.holdingRepository = holdingRepository;
        this.walletService = walletService;
        this.snapshotRepository = snapshotRepository;
    }

    public PortfolioSummary summary(Long userId) {
        List<Holding> holdings = holdingRepository.findByUserId(userId);
        Wallet wallet = walletService.getByUser(userId);

        List<CurrencySummary> sections = new ArrayList<>();
        sections.add(buildSection("INR", holdings, wallet.getBalanceInr()));
        sections.add(buildSection("USD", holdings, wallet.getBalanceUsd()));
        return new PortfolioSummary(sections);
    }

    private CurrencySummary buildSection(String currency, List<Holding> allHoldings, BigDecimal cash) {
        List<HoldingView> views = new ArrayList<>();
        BigDecimal totalInvested = BigDecimal.ZERO;
        BigDecimal totalCurrent = BigDecimal.ZERO;
        BigDecimal totalRealized = BigDecimal.ZERO;

        for (Holding h : allHoldings) {
            if (!currency.equalsIgnoreCase(h.getStock().getCurrency())) continue;
            BigDecimal current = h.getStock().getCurrentPrice();
            BigDecimal qty = BigDecimal.valueOf(h.getQuantity());
            BigDecimal invested = h.getAvgBuyPrice().multiply(qty).setScale(2, RoundingMode.HALF_UP);
            BigDecimal curValue = current.multiply(qty).setScale(2, RoundingMode.HALF_UP);
            BigDecimal unrealized = curValue.subtract(invested);
            BigDecimal unrealizedPct = invested.signum() == 0 ? BigDecimal.ZERO
                    : unrealized.divide(invested, 6, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);

            views.add(new HoldingView(
                    h.getStock().getId(), h.getStock().getSymbol(), h.getStock().getCompanyName(),
                    h.getQuantity(), h.getAvgBuyPrice(), current, invested, curValue,
                    unrealized, unrealizedPct, h.getRealizedPnl(), currency));

            totalInvested = totalInvested.add(invested);
            totalCurrent = totalCurrent.add(curValue);
            totalRealized = totalRealized.add(h.getRealizedPnl());
        }

        List<AllocationSlice> allocation = new ArrayList<>();
        for (HoldingView v : views) {
            BigDecimal pct = totalCurrent.signum() == 0 ? BigDecimal.ZERO
                    : v.currentValue().divide(totalCurrent, 6, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);
            allocation.add(new AllocationSlice(v.symbol(), v.currentValue(), pct));
        }

        BigDecimal totalUnrealized = totalCurrent.subtract(totalInvested);
        BigDecimal totalUnrealizedPct = totalInvested.signum() == 0 ? BigDecimal.ZERO
                : totalUnrealized.divide(totalInvested, 6, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);

        return new CurrencySummary(currency, totalInvested, totalCurrent, totalUnrealized,
                totalUnrealizedPct, totalRealized, cash, views, allocation);
    }

    /**
     * INR-only net worth (INR holdings at market + INR cash). Feeds the portfolio-value snapshot/chart,
     * which stays single-currency by design (no cross-currency aggregation).
     */
    public BigDecimal netWorth(Long userId) {
        Wallet wallet = walletService.getByUser(userId);
        BigDecimal inrHoldings = holdingRepository.findByUserId(userId).stream()
                .filter(h -> "INR".equalsIgnoreCase(h.getStock().getCurrency()))
                .map(h -> h.getStock().getCurrentPrice().multiply(BigDecimal.valueOf(h.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
        return inrHoldings.add(wallet.getBalanceInr());
    }

    public List<SnapshotPoint> history(Long userId, int days) {
        LocalDateTime after = LocalDateTime.now().minusDays(days);
        return snapshotRepository.findByUserIdAndSnapshotAtAfterOrderBySnapshotAtAsc(userId, after).stream()
                .map(s -> new SnapshotPoint(s.getSnapshotAt(), s.getTotalValue()))
                .toList();
    }
}
