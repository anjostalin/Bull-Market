package com.stocksim.sts.dto;

import com.stocksim.sts.entity.Order;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderDtos {

    public record PlaceOrderRequest(
            @NotNull Long stockId,
            @NotNull Order.OrderType orderType,
            @NotNull Order.Direction direction,
            @NotNull @Positive Integer quantity,
            BigDecimal limitPrice,
            BigDecimal stopPrice,
            boolean paper
    ) {}

    public record OrderView(
            Long id,
            Long stockId,
            String symbol,
            String orderType,
            String direction,
            Integer quantity,
            BigDecimal limitPrice,
            BigDecimal stopPrice,
            BigDecimal executedPrice,
            String status,
            boolean paper,
            String rejectReason,
            LocalDateTime createdAt
    ) {}
}
