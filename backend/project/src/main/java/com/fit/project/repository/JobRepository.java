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

    @EntityGraph(attributePaths = "company")
    @Query("""
            select j from Job j
            where j.status = :status
              and (:kw is null or lower(j.title) like :kw or lower(j.company.name) like :kw)
              and (:location is null or lower(j.location) like :location)
              and (:jobType is null or lower(j.jobType) = lower(:jobType))
              and (:level is null or lower(j.level) = lower(:level))
              and (:minSalary is null or j.salaryMax is null or j.salaryMax >= :minSalary)
              and (:maxSalary is null or j.salaryMin is null or j.salaryMin <= :maxSalary)
            """)
    Page<Job> searchPublicJobs(
            @Param("kw") String keywordPattern,
            @Param("location") String locationPattern,
            @Param("jobType") String jobType,
            @Param("level") String level,
            @Param("minSalary") BigDecimal minSalary,
            @Param("maxSalary") BigDecimal maxSalary,
            @Param("status") JobStatus status,
            Pageable pageable
    );

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
