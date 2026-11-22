package com.stocksim.sts.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class PortfolioDtos {

    public record HoldingView(
            Long stockId,
            String symbol,
            String companyName,
            Integer quantity,
            BigDecimal avgBuyPrice,
            BigDecimal currentPrice,
            BigDecimal investedValue,
            BigDecimal currentValue,
            BigDecimal unrealizedPnl,
            BigDecimal unrealizedPnlPercent,
            BigDecimal realizedPnl
    ) {}

    public record AllocationSlice(
            String symbol,
            BigDecimal value,
            BigDecimal percent
    ) {}

    public record PortfolioSummary(
            BigDecimal totalInvested,
            BigDecimal totalCurrentValue,
            BigDecimal totalUnrealizedPnl,
            BigDecimal totalUnrealizedPnlPercent,
            BigDecimal totalRealizedPnl,
            BigDecimal walletBalance,
            BigDecimal netWorth,
            List<HoldingView> holdings,
            List<AllocationSlice> allocation
    ) {}

    public record SnapshotPoint(LocalDateTime time, BigDecimal value) {}
}
