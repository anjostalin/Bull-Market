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

        List<HoldingView> views = new ArrayList<>();
        BigDecimal totalInvested = BigDecimal.ZERO;
        BigDecimal totalCurrent = BigDecimal.ZERO;
        BigDecimal totalRealized = BigDecimal.ZERO;

        for (Holding h : holdings) {
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
                    unrealized, unrealizedPct, h.getRealizedPnl()));

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

        Wallet wallet = walletService.getByUser(userId);
        BigDecimal netWorth = totalCurrent.add(wallet.getBalance());

        return new PortfolioSummary(totalInvested, totalCurrent, totalUnrealized, totalUnrealizedPct,
                totalRealized, wallet.getBalance(), netWorth, views, allocation);
    }

    /** Current total portfolio value (holdings at market + wallet cash). */
    public BigDecimal netWorth(Long userId) {
        return summary(userId).netWorth();
    }

    public List<SnapshotPoint> history(Long userId, int days) {
        LocalDateTime after = LocalDateTime.now().minusDays(days);
        return snapshotRepository.findByUserIdAndSnapshotAtAfterOrderBySnapshotAtAsc(userId, after).stream()
                .map(s -> new SnapshotPoint(s.getSnapshotAt(), s.getTotalValue()))
                .toList();
    }
}
