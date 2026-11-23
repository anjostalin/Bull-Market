package com.stocksim.sts.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stocks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String symbol;

    @Column(nullable = false, length = 150)
    private String companyName;

    @Column(length = 80)
    private String sector;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal currentPrice;

    @Column(precision = 12, scale = 2)
    private BigDecimal previousClose;

    @Column(precision = 12, scale = 2)
    private BigDecimal dayHigh;

    @Column(precision = 12, scale = 2)
    private BigDecimal dayLow;

    @Builder.Default
    private Long volume = 0L;

    @Column(precision = 18, scale = 2)
    private BigDecimal marketCap;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 4)
    @Builder.Default
    private Market market = Market.IN;

    @Column(length = 4)
    @Builder.Default
    private String currency = "INR";

    /** Symbol used when fetching a live quote (e.g. "RELIANCE.NS" for NSE, "AAPL" for US). */
    @Column(length = 24)
    private String yahooSymbol;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum Market { IN, US }
}
