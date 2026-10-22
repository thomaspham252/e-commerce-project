package com.fit.project.repository;

import com.fit.project.entity.Cv;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CvRepository extends JpaRepository<Cv, Integer> {

    /** Tìm theo tên file, họ tên hoặc email ứng viên. */
    @EntityGraph(attributePaths = {"candidate", "candidate.user"})
    @Query("""
            select cv from Cv cv
            where (:kw is null
                   or lower(cv.fileName) like :kw
                   or lower(cv.candidate.fullName) like :kw
                   or lower(cv.candidate.user.email) like :kw)
            """)
    Page<Cv> search(@Param("kw") String keywordPattern, Pageable pageable);

    long countByCandidateUserId(Integer candidateId);
}
