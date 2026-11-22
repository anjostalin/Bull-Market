package com.stocksim.sts.repository;

import com.stocksim.sts.entity.PriceAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PriceAlertRepository extends JpaRepository<PriceAlert, Long> {

    @Query("SELECT a FROM PriceAlert a JOIN FETCH a.stock WHERE a.userId = :userId ORDER BY a.createdAt DESC")
    List<PriceAlert> findByUserId(@Param("userId") Long userId);

    @Query("SELECT a FROM PriceAlert a JOIN FETCH a.stock WHERE a.active = true")
    List<PriceAlert> findAllActive();
}
