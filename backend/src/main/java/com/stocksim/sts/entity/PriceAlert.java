package com.stocksim.sts.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "price_alerts", indexes = @Index(name = "idx_pa_active", columnList = "active"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PriceAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_condition", nullable = false, length = 6)
    private Condition condition;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal threshold;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    private LocalDateTime triggeredAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public enum Condition { ABOVE, BELOW }
}
