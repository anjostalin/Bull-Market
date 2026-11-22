package com.stocksim.sts.repository;

import com.stocksim.sts.entity.NewsArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NewsArticleRepository extends JpaRepository<NewsArticle, Long> {

    @Query("SELECT n FROM NewsArticle n JOIN FETCH n.stock WHERE n.stock.id = :stockId ORDER BY n.publishedAt DESC")
    List<NewsArticle> findByStockId(@Param("stockId") Long stockId);
}
