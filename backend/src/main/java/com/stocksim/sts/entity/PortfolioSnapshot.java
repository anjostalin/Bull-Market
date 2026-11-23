package com.stocksim.sts.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "portfolio_snapshots",
        indexes = @Index(name = "idx_ps_user_time", columnList = "userId, snapshotAt"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PortfolioSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(length = 4)
    @Builder.Default
    private String currency = "INR";

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal totalValue;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime snapshotAt;
}
