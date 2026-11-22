package com.stocksim.sts.repository;

import com.stocksim.sts.entity.PortfolioSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PortfolioSnapshotRepository extends JpaRepository<PortfolioSnapshot, Long> {
    List<PortfolioSnapshot> findByUserIdAndSnapshotAtAfterOrderBySnapshotAtAsc(Long userId, LocalDateTime after);
}
