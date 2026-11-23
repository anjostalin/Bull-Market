package com.stocksim.sts.repository;

import com.stocksim.sts.entity.Stock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, Long> {
    Optional<Stock> findBySymbol(String symbol);
    boolean existsBySymbol(String symbol);

    Page<Stock> findByActiveTrue(Pageable pageable);

    Page<Stock> findByActiveTrueAndSymbolContainingIgnoreCaseOrActiveTrueAndCompanyNameContainingIgnoreCase(
            String symbol, String companyName, Pageable pageable);

    @Query("""
            SELECT s FROM Stock s
            WHERE s.active = true AND s.market = :market
              AND (:search = '' OR LOWER(s.symbol) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(s.companyName) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<Stock> searchByMarket(@Param("market") Stock.Market market,
                               @Param("search") String search, Pageable pageable);
}
