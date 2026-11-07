package com.fit.project.repository;

import com.fit.project.entity.CandidateProfileView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CandidateProfileViewRepository extends JpaRepository<CandidateProfileView, Integer> {

    /** Đếm số lượt xem hồ sơ ứng viên trong một chu kỳ gói đăng ký cụ thể. */
    long countBySubscriptionId(Integer subscriptionId);

    /** Kiểm tra xem ứng viên đã được mở xem trong kỳ gói này chưa. */
    boolean existsBySubscriptionIdAndCandidateUserId(Integer subscriptionId, Integer candidateUserId);

    /** Lấy bản ghi mở xem ứng viên trong kỳ gói nếu có. */
    Optional<CandidateProfileView> findBySubscriptionIdAndCandidateUserId(Integer subscriptionId, Integer candidateUserId);

    /** Đếm tổng số hồ sơ đã xem của nhà tuyển dụng. */
    long countByViewedById(Integer viewedById);

    /** Kiểm tra nhà tuyển dụng đã từng mở xem ứng viên này chưa. */
    boolean existsByViewedByIdAndCandidateUserId(Integer viewedById, Integer candidateUserId);
}

