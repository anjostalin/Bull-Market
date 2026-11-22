package com.stocksim.sts.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class StockDtos {

    public record StockView(
            Long id,
            String symbol,
            String companyName,
            String sector,
            BigDecimal currentPrice,
            BigDecimal previousClose,
            BigDecimal dayHigh,
            BigDecimal dayLow,
            Long volume,
            BigDecimal changePercent
    ) {}

    public record CandleView(
            LocalDate date,
            BigDecimal open,
            BigDecimal high,
            BigDecimal low,
            BigDecimal close,
            Long volume
    ) {}

    public record PriceUpdate(
            Long stockId,
            String symbol,
            BigDecimal price,
            BigDecimal changePercent
    ) {}
}
