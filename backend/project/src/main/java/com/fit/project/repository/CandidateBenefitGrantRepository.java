package com.fit.project.repository;

import com.fit.project.entity.CandidateBenefitGrant;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * Repository quản lý quyền lợi tiện ích của ứng viên.
 */
@Repository
public interface CandidateBenefitGrantRepository extends JpaRepository<CandidateBenefitGrant, Long> {

    Optional<CandidateBenefitGrant> findByUserId(Integer userId);

    List<CandidateBenefitGrant> findByUserIdIn(Collection<Integer> userIds);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM CandidateBenefitGrant b WHERE b.userId = :userId")
    Optional<CandidateBenefitGrant> findByUserIdForUpdate(@Param("userId") Integer userId);
}

