package com.stocksim.sts.dto;

import com.stocksim.sts.entity.Order;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.List;

public class PaperDtos {

    public record PaperOrderRequest(
            @NotNull Long stockId,
            @NotNull Order.Direction direction,
            @NotNull @Positive Integer quantity
    ) {}

    public record PaperHoldingView(
            Long stockId, String symbol, Integer quantity,
            BigDecimal avgBuyPrice, BigDecimal currentPrice,
            BigDecimal currentValue, BigDecimal unrealizedPnl) {}

    public record PaperPortfolio(
            BigDecimal balance,
            BigDecimal holdingsValue,
            BigDecimal totalValue,
            BigDecimal returnPercent,
            List<PaperHoldingView> holdings) {}

    public record LeaderboardEntry(
            int rank, String trader, BigDecimal totalValue, BigDecimal returnPercent, BigDecimal profitLoss) {}
}
