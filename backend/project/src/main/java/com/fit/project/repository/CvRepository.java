package com.fit.project.repository;

import com.fit.project.entity.Cv;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CvRepository extends JpaRepository<Cv, Integer> {

    long countByCandidateUserId(Integer candidateId);

    /** CV của ứng viên, CV mặc định lên đầu rồi tới CV mới tải. */
    List<Cv> findByCandidateUserIdOrderByIsDefaultDescUploadedAtDesc(Integer candidateId);

    Optional<Cv> findByIdAndCandidateUserId(Integer id, Integer candidateId);
}
