package com.stocksim.sts.repository;

import com.stocksim.sts.entity.PaperHolding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PaperHoldingRepository extends JpaRepository<PaperHolding, Long> {

    @Query("SELECT h FROM PaperHolding h JOIN FETCH h.stock WHERE h.userId = :userId")
    List<PaperHolding> findByUserId(@Param("userId") Long userId);

    Optional<PaperHolding> findByUserIdAndStockId(Long userId, Long stockId);
}
