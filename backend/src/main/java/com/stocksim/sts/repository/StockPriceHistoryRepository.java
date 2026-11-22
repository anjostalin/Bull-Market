package com.stocksim.sts.repository;

import com.stocksim.sts.entity.StockPriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface StockPriceHistoryRepository extends JpaRepository<StockPriceHistory, Long> {
    List<StockPriceHistory> findByStockIdOrderByDateAsc(Long stockId);
    Optional<StockPriceHistory> findByStockIdAndDate(Long stockId, LocalDate date);
}
