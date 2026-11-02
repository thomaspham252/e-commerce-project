package com.fit.project.repository;

import com.fit.project.entity.Order;
import com.fit.project.enums.OrderStatus;
import com.fit.project.enums.OrderType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    Optional<Order> findByOrderCode(String orderCode);

    List<Order> findByUserIdOrderByCreatedAtDesc(Integer userId);

    List<Order> findByUserIdAndOrderTypeOrderByCreatedAtDesc(Integer userId, OrderType orderType);

    List<Order> findByStatusAndCreatedAtBefore(OrderStatus status, LocalDateTime expiryThreshold);

    Page<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);

    /** Các đơn đã thanh toán trong [from, to): mỗi dòng = {paidAt, orderType, totalAmount}. */
    @Query("select o.paidAt, o.orderType, o.totalAmount from Order o "
            + "where o.status in :statuses and o.paidAt >= :from and o.paidAt < :to")
    List<Object[]> findPaidRevenueRows(@Param("statuses") Collection<OrderStatus> statuses,
                                       @Param("from") LocalDateTime from,
                                       @Param("to") LocalDateTime to);

    /** Thời điểm thanh toán sớm nhất (dùng cho bộ lọc "Toàn bộ"). */
    @Query("select min(o.paidAt) from Order o where o.status in :statuses")
    LocalDateTime findFirstPaidAt(@Param("statuses") Collection<OrderStatus> statuses);
}
