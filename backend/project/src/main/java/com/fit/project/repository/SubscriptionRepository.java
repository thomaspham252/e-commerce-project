package com.fit.project.repository;

import com.fit.project.entity.Subscription;
import com.fit.project.enums.SubscriptionStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Integer> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Subscription s where s.id = :id")
    Optional<Subscription> findByIdForUpdate(@Param("id") Integer id);

    Optional<Subscription> findByOrderId(Integer orderId);

    List<Subscription> findByEmployerIdAndStatus(Integer employerId, SubscriptionStatus status);

    Optional<Subscription> findFirstByEmployerIdAndStatusOrderByEndAtDesc(Integer employerId, SubscriptionStatus status);

    @Modifying
    @Query("update Subscription s set s.status = :targetStatus where s.status = :currentStatus and s.endAt < :now")
    int updateStatusForExpiredSubscriptions(@Param("currentStatus") SubscriptionStatus currentStatus,
                                            @Param("targetStatus") SubscriptionStatus targetStatus,
                                            @Param("now") LocalDateTime now);

    /** Gói đang có hiệu lực tại thời điểm now (gói gia hạn nối tiếp chưa tới ngày bắt đầu thì không tính). */
    @EntityGraph(attributePaths = {"packageEntity", "order"})
    @Query("""
            select s from Subscription s
            where s.employer.id = :employerId and s.status = :status
              and s.startAt <= :now and s.endAt > :now
            order by s.startAt desc
            """)
    List<Subscription> findInEffect(@Param("employerId") Integer employerId,
                                    @Param("status") SubscriptionStatus status,
                                    @Param("now") LocalDateTime now);

    /** Lấy danh sách gói đang có hiệu lực của nhiều NTD cùng lúc để ánh xạ cờ ưu tiên/nổi bật không bị N+1. */
    @EntityGraph(attributePaths = {"packageEntity"})
    @Query("""
            select s from Subscription s
            where s.employer.id in :employerIds and s.status = :status
              and s.startAt <= :now and s.endAt > :now
            """)
    List<Subscription> findInEffectForEmployers(@Param("employerIds") java.util.Collection<Integer> employerIds,
                                                @Param("status") SubscriptionStatus status,
                                                @Param("now") LocalDateTime now);

    /** Gói gần nhất của NTD (kể cả đã hết hạn) để báo "gói đã hết hạn". */
    @EntityGraph(attributePaths = {"packageEntity", "order"})
    Optional<Subscription> findFirstByEmployerIdOrderByEndAtDesc(Integer employerId);

    /** Các gói gối đầu đã mua trước và có lịch bắt đầu trong tương lai. */
    @EntityGraph(attributePaths = {"packageEntity"})
    @Query("""
            select s from Subscription s
            where s.employer.id = :employerId and s.status = :status
              and s.startAt > :now
            order by s.startAt asc
            """)
    List<Subscription> findQueuedSubscriptions(@Param("employerId") Integer employerId,
                                               @Param("status") SubscriptionStatus status,
                                               @Param("now") LocalDateTime now);
}
