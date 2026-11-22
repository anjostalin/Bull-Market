package com.stocksim.sts.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "holdings",
        uniqueConstraints = @UniqueConstraint(name = "uq_user_stock", columnNames = {"userId", "stock_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Holding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 0;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal avgBuyPrice;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal realizedPnl = BigDecimal.ZERO;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
