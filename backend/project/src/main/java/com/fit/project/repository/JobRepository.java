package com.fit.project.repository;

import com.fit.project.entity.Job;
import com.fit.project.enums.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface JobRepository extends JpaRepository<Job, Integer> {

    @EntityGraph(attributePaths = "company")
    @Query("""
            select j from Job j
            where (:status is null or j.status = :status)
              and (:kw is null or lower(j.title) like :kw or lower(j.company.name) like :kw)
            """)
    Page<Job> searchAll(@Param("kw") String keywordPattern,
                        @Param("status") JobStatus status,
                        Pageable pageable);

    @EntityGraph(attributePaths = {"company", "company.owner"})
    @Query("""
            select j from Job j
            where j.status = :status
              and (:kw is null or lower(j.title) like :kw or lower(j.company.name) like :kw)
              and (:location is null or lower(j.location) like :location)
              and (:jobType is null or lower(j.jobType) = lower(:jobType))
              and (:level is null or lower(j.level) = lower(:level))
              and (:minSalary is null or j.salaryMax is null or j.salaryMax >= :minSalary)
              and (:maxSalary is null or j.salaryMin is null or j.salaryMin <= :maxSalary)
            order by (case when j.isPrioritized = true and exists (
                select s from Subscription s
                where s.employer.id = j.company.owner.id
                  and s.status = :activeStatus
                  and s.startAt <= :now and s.endAt > :now
                  and s.packageEntity.canPrioritizeJobs = true
            ) then 1 else 0 end) desc
            """)
    Page<Job> searchPublicJobs(
            @Param("kw") String keywordPattern,
            @Param("location") String locationPattern,
            @Param("jobType") String jobType,
            @Param("level") String level,
            @Param("minSalary") BigDecimal minSalary,
            @Param("maxSalary") BigDecimal maxSalary,
            @Param("status") JobStatus status,
            @Param("activeStatus") com.fit.project.enums.SubscriptionStatus activeStatus,
            @Param("now") LocalDateTime now,
            Pageable pageable
    );

    default Page<Job> searchPublicJobs(
            String keywordPattern,
            String locationPattern,
            String jobType,
            String level,
            BigDecimal minSalary,
            BigDecimal maxSalary,
            JobStatus status,
            Pageable pageable
    ) {
        return searchPublicJobs(keywordPattern, locationPattern, jobType, level, minSalary, maxSalary,
                status, com.fit.project.enums.SubscriptionStatus.ACTIVE, LocalDateTime.now(), pageable);
    }

    @EntityGraph(attributePaths = "company")
    Optional<Job> findByIdAndStatus(Integer id, JobStatus status);

    @EntityGraph(attributePaths = "company")
    @Query("""
            select j from Job j
            where j.company.owner.id = :ownerId
              and (:status is null or j.status = :status)
              and (:kw is null or lower(j.title) like :kw)
            """)
    Page<Job> searchByOwner(@Param("ownerId") Integer ownerId,
                            @Param("kw") String keywordPattern,
                            @Param("status") JobStatus status,
                            Pageable pageable);

    @EntityGraph(attributePaths = "company")
    @Query("select j from Job j where j.id = :id and j.company.owner.id = :ownerId")
    Optional<Job> findByIdAndOwner(@Param("id") Integer id, @Param("ownerId") Integer ownerId);

    @Query("select j.status, count(j) from Job j group by j.status")
    List<Object[]> countGroupByStatus();

    long countByStatus(JobStatus status);

    long countByCompanyOwnerIdAndStatus(Integer ownerId, JobStatus status);

    long countByCompanyOwnerId(Integer ownerId);

    /** Đếm số tin đăng thuộc về một gói đăng ký cụ thể. */
    long countBySubscriptionId(Integer subscriptionId);

    /** Đếm số tin đăng miễn phí (chưa gán gói subscription) của nhà tuyển dụng. */
    long countByCompanyOwnerIdAndSubscriptionIsNull(Integer ownerId);

    /** Số tin NTD đã tạo kể từ một thời điểm (tính hạn mức tin của gói đang dùng). */
    long countByCompanyOwnerIdAndCreatedAtGreaterThanEqual(Integer ownerId, LocalDateTime from);

    @EntityGraph(attributePaths = "company")
    List<Job> findByCompanyIdAndStatus(Integer companyId, JobStatus status);

    long countByCompanyIdAndStatus(Integer companyId, JobStatus status);

    @Query("select j.createdAt from Job j where j.createdAt >= :from and j.createdAt < :to")
    List<LocalDateTime> findCreatedAtBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /** Tin đang mở đã quá hạn nộp → EXPIRED. */
    @Modifying
    @Query("update Job j set j.status = :expired, j.updatedAt = CURRENT_TIMESTAMP where j.status = :open and j.deadline < :today")
    int expireOverdue(@Param("today") LocalDate today,
                      @Param("open") JobStatus open,
                      @Param("expired") JobStatus expired);
}
