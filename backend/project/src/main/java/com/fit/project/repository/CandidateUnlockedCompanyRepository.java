package com.fit.project.repository;

import com.fit.project.entity.CandidateUnlockedCompany;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository theo dõi danh sách công ty NTD mà ứng viên đã mở khóa liên hệ.
 */
@Repository
public interface CandidateUnlockedCompanyRepository extends JpaRepository<CandidateUnlockedCompany, Long> {

    boolean existsByCandidateUserIdAndCompanyId(Integer candidateUserId, Long companyId);

    long countByCandidateUserId(Integer candidateUserId);

    List<CandidateUnlockedCompany> findByCandidateUserId(Integer candidateUserId);

    Optional<CandidateUnlockedCompany> findByCandidateUserIdAndCompanyId(Integer candidateUserId, Long companyId);
}

