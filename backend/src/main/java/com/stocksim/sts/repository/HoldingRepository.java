package com.stocksim.sts.repository;

import com.stocksim.sts.entity.Holding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface HoldingRepository extends JpaRepository<Holding, Long> {

    @Query("SELECT h FROM Holding h JOIN FETCH h.stock WHERE h.userId = :userId")
    List<Holding> findByUserId(@Param("userId") Long userId);

    Optional<Holding> findByUserIdAndStockId(Long userId, Long stockId);
}
