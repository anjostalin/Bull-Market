package com.stocksim.sts.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "watchlist_items",
        uniqueConstraints = @UniqueConstraint(name = "uq_wl_stock", columnNames = {"watchlist_id", "stock_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WatchlistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "watchlist_id", nullable = false)
    private Long watchlistId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime addedAt;
}
