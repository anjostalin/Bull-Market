package com.stocksim.sts.dto;

import com.stocksim.sts.entity.PriceAlert;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class WatchlistDtos {

    public record CreateWatchlistRequest(String name) {}

    public record AddItemRequest(Long stockId) {}

    public record WatchlistItemView(
            Long id, Long stockId, String symbol, String companyName,
            BigDecimal currentPrice, BigDecimal changePercent) {}

    public record WatchlistView(
            Long id, String name, List<WatchlistItemView> items) {}

    public record CreateAlertRequest(
            Long stockId, PriceAlert.Condition condition, BigDecimal threshold) {}

    public record AlertView(
            Long id, Long stockId, String symbol, String condition,
            BigDecimal threshold, boolean active, LocalDateTime triggeredAt, LocalDateTime createdAt) {}
}
