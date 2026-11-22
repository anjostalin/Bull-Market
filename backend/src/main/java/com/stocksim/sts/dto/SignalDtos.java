package com.stocksim.sts.dto;

import java.math.BigDecimal;

public class SignalDtos {

    public record SignalView(
            Long stockId,
            String symbol,
            BigDecimal currentPrice,
            BigDecimal sma7,
            BigDecimal sma14,
            BigDecimal rsi14,
            String signal,       // STRONG_BUY, BUY, HOLD, SELL, STRONG_SELL
            int riskScore,       // 1..10
            String rationale
    ) {}
}
