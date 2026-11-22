package com.stocksim.sts.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "news_articles", indexes = @Index(name = "idx_news_stock", columnList = "stock_id"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NewsArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;

    @Column(nullable = false, length = 300)
    private String headline;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private Sentiment sentiment = Sentiment.NEUTRAL;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime publishedAt;

    public enum Sentiment { POSITIVE, NEUTRAL, NEGATIVE }
}
