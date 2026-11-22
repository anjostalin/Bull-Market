package com.stocksim.sts.repository;

import com.stocksim.sts.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query(value = "SELECT o FROM Order o JOIN FETCH o.stock WHERE o.userId = :userId ORDER BY o.createdAt DESC",
            countQuery = "SELECT COUNT(o) FROM Order o WHERE o.userId = :userId")
    Page<Order> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT o FROM Order o JOIN FETCH o.stock WHERE o.status = :status")
    List<Order> findByStatus(@Param("status") Order.Status status);

    long countByStatus(Order.Status status);
}
