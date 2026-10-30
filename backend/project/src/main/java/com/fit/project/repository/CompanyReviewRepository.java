package com.fit.project.repository;

import com.fit.project.entity.CompanyReview;
import com.fit.project.enums.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CompanyReviewRepository extends JpaRepository<CompanyReview, Integer> {

    @EntityGraph(attributePaths = {"candidate", "reply", "reply.employer"})
    Page<CompanyReview> findByCompanyIdAndStatus(Integer companyId, ReviewStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"candidate", "reply", "reply.employer"})
    List<CompanyReview> findByCompanyIdAndStatusOrderByCreatedAtDesc(Integer companyId, ReviewStatus status);

    long countByCompanyIdAndStatus(Integer companyId, ReviewStatus status);

    @Query("select avg(r.rating) from CompanyReview r where r.company.id = :companyId and r.status = :status")
    Double calculateAverageRating(@Param("companyId") Integer companyId, @Param("status") ReviewStatus status);

    @Query("select r.rating, count(r) from CompanyReview r where r.company.id = :companyId and r.status = :status group by r.rating")
    List<Object[]> countGroupByRating(@Param("companyId") Integer companyId, @Param("status") ReviewStatus status);

    @Query("select count(r) from CompanyReview r where r.company.id = :companyId and r.status = :status and r.reply is not null")
    long countRepliedReviews(@Param("companyId") Integer companyId, @Param("status") ReviewStatus status);

    @EntityGraph(attributePaths = {"candidate", "reply", "reply.employer"})
    @Query("""
            select r from CompanyReview r
            where r.company.id = :companyId
              and (:status is null or r.status = :status)
              and (:rating is null or r.rating = :rating)
              and (:replyStatus is null
                   or (:replyStatus = 'replied' and r.reply is not null)
                   or (:replyStatus = 'unreplied' and r.reply is null))
              and (:kw is null
                   or lower(r.content) like :kw
                   or lower(r.candidate.fullName) like :kw)
            """)
    Page<CompanyReview> searchEmployerReviews(
            @Param("companyId") Integer companyId,
            @Param("status") ReviewStatus status,
            @Param("rating") Integer rating,
            @Param("replyStatus") String replyStatus,
            @Param("kw") String keywordPattern,
            Pageable pageable
    );
}
