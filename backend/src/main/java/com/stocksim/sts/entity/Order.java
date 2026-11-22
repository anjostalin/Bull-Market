package com.stocksim.sts.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders",
        indexes = {
                @Index(name = "idx_order_user", columnList = "userId"),
                @Index(name = "idx_order_status", columnList = "status"),
                @Index(name = "idx_order_stock", columnList = "stock_id")
        })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private OrderType orderType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 5)
    private Direction direction;

    @Column(nullable = false)
    private Integer quantity;

    @Column(precision = 12, scale = 2)
    private BigDecimal limitPrice;

    @Column(precision = 12, scale = 2)
    private BigDecimal stopPrice;

    @Column(precision = 12, scale = 2)
    private BigDecimal executedPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 12)
    @Builder.Default
    private Status status = Status.PENDING;

    @Column(nullable = false)
    @Builder.Default
    private boolean paper = false;

    @Column(length = 255)
    private String rejectReason;

    @Column(length = 45)
    private String ipAddress;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum OrderType { MARKET, LIMIT, STOP_LOSS }
    public enum Direction { BUY, SELL }
    public enum Status { PENDING, EXECUTED, CANCELLED, REJECTED }
}
