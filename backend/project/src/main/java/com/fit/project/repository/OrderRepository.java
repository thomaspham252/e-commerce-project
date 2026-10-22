package com.fit.project.repository;

import com.fit.project.entity.Order;
import com.fit.project.enums.OrderStatus;
import com.fit.project.enums.OrderType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    Optional<Order> findByOrderCode(String orderCode);

    List<Order> findByUserIdOrderByCreatedAtDesc(Integer userId);

    List<Order> findByUserIdAndOrderTypeOrderByCreatedAtDesc(Integer userId, OrderType orderType);

    List<Order> findByStatusAndCreatedAtBefore(OrderStatus status, LocalDateTime expiryThreshold);

    Page<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);
}
