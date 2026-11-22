package com.stocksim.sts.repository;

import com.stocksim.sts.entity.WatchlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WatchlistItemRepository extends JpaRepository<WatchlistItem, Long> {

    @Query("SELECT i FROM WatchlistItem i JOIN FETCH i.stock WHERE i.watchlistId = :watchlistId")
    List<WatchlistItem> findByWatchlistId(@Param("watchlistId") Long watchlistId);

    Optional<WatchlistItem> findByWatchlistIdAndStockId(Long watchlistId, Long stockId);
    long countByWatchlistId(Long watchlistId);
}
