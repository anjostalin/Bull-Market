package com.stocksim.sts.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class AdminDtos {

    public record AdminUserView(
            Long id, String fullName, String email, String role,
            boolean verified, boolean suspended, LocalDateTime createdAt) {}

    public record PriceOverrideRequest(Long stockId, BigDecimal price) {}

    public record PlatformMetrics(
            long totalUsers,
            long activeTraders,
            long totalOrders,
            long executedOrders,
            long pendingOrders,
            BigDecimal totalTradeVolume,
            List<SectorCount> stocksBySector) {}

    public record SectorCount(String sector, long count) {}
}
