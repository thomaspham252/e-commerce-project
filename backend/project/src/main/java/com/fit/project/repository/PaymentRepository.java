package com.fit.project.repository;

import com.fit.project.entity.Payment;
import com.fit.project.enums.OrderType;
import com.fit.project.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    Optional<Payment> findByGatewayAndTransactionCode(String gateway, String transactionCode);

    boolean existsByGatewayAndTransactionCode(String gateway, String transactionCode);

    Page<Payment> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /** Admin tra cứu giao dịch: lọc trạng thái, loại đơn, khoảng thời gian [from, to) và từ khóa ngay trong DB. */
    @EntityGraph(attributePaths = {"order", "order.user", "order.packageEntity", "order.tokenPackage"})
    @Query("""
            select p from Payment p
            where (:status is null or p.status = :status)
              and (:type is null or p.order.orderType = :type)
              and (:from is null or p.createdAt >= :from)
              and (:to is null or p.createdAt < :to)
              and (:kw is null
                   or lower(p.order.orderCode) like :kw
                   or lower(p.order.user.email) like :kw
                   or lower(p.transactionCode) like :kw)
            """)
    Page<Payment> searchForAdmin(@Param("status") PaymentStatus status,
                                 @Param("type") OrderType type,
                                 @Param("from") LocalDateTime from,
                                 @Param("to") LocalDateTime to,
                                 @Param("kw") String keywordPattern,
                                 Pageable pageable);

    /** Số giao dịch theo trạng thái: mỗi dòng = {status, count}. */
    @Query("select p.status, count(p) from Payment p group by p.status")
    List<Object[]> countGroupByStatus();

    /** Giao dịch thành công nhưng số tiền nhận khác số tiền đơn hàng (cần đối soát). */
    @Query("select count(p) from Payment p where p.status = :status and p.amount <> p.order.totalAmount")
    long countAmountMismatch(@Param("status") PaymentStatus status);
}
