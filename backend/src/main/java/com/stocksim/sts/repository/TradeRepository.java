package com.stocksim.sts.repository;

import com.stocksim.sts.entity.Trade;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface TradeRepository extends JpaRepository<Trade, Long> {

    @Query(value = "SELECT t FROM Trade t JOIN FETCH t.stock WHERE t.userId = :userId ORDER BY t.executedAt DESC",
            countQuery = "SELECT COUNT(t) FROM Trade t WHERE t.userId = :userId")
    Page<Trade> findByUserIdOrderByExecutedAtDesc(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT t FROM Trade t JOIN FETCH t.stock WHERE t.userId = :userId AND t.paper = :paper ORDER BY t.executedAt DESC")
    List<Trade> findByUserIdAndPaperOrderByExecutedAtDesc(@Param("userId") Long userId, @Param("paper") boolean paper);

    @Query("SELECT COALESCE(SUM(t.totalValue), 0) FROM Trade t WHERE t.paper = false")
    BigDecimal totalRealTradeVolume();
}
