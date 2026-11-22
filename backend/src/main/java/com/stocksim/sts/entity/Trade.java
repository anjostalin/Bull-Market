package com.stocksim.sts.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "trades",
        indexes = {
                @Index(name = "idx_trade_user", columnList = "userId"),
                @Index(name = "idx_trade_stock", columnList = "stock_id"),
                @Index(name = "idx_trade_executed", columnList = "executedAt")
        })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Trade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long orderId;

    @Column(nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 5)
    private Order.Direction direction;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal totalValue;

    @Column(nullable = false)
    @Builder.Default
    private boolean paper = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime executedAt;
}
