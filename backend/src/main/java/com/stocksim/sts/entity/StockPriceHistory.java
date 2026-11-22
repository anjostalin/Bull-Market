package com.stocksim.sts.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "stock_price_history",
        uniqueConstraints = @UniqueConstraint(name = "uq_stock_date", columnNames = {"stock_id", "date"}),
        indexes = @Index(name = "idx_sph_stock_date", columnList = "stock_id, date"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockPriceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal open;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal high;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal low;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal close;

    @Column(nullable = false)
    @Builder.Default
    private Long volume = 0L;
}
