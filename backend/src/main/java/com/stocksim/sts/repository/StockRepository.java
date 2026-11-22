package com.stocksim.sts.repository;

import com.stocksim.sts.entity.Stock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, Long> {
    Optional<Stock> findBySymbol(String symbol);
    boolean existsBySymbol(String symbol);
    Page<Stock> findByActiveTrueAndSymbolContainingIgnoreCaseOrActiveTrueAndCompanyNameContainingIgnoreCase(
            String symbol, String companyName, Pageable pageable);
    Page<Stock> findByActiveTrue(Pageable pageable);
}
