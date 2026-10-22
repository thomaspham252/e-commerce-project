package com.fit.project.repository;

import com.fit.project.entity.Application;
import com.fit.project.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Integer> {

    @EntityGraph(attributePaths = {"job", "candidate", "candidate.user", "cv"})
    @Query("""
            select a from Application a
            where a.job.company.owner.id = :ownerId
              and (:jobId is null or a.job.id = :jobId)
              and (:status is null or a.status = :status)
              and (:kw is null or lower(a.candidate.fullName) like :kw or lower(a.candidate.user.email) like :kw)
            """)
    Page<Application> searchByOwner(@Param("ownerId") Integer ownerId,
                                    @Param("jobId") Integer jobId,
                                    @Param("status") ApplicationStatus status,
                                    @Param("kw") String keywordPattern,
                                    Pageable pageable);

    @EntityGraph(attributePaths = {"job", "candidate", "candidate.user", "cv"})
    @Query("select a from Application a where a.id = :id and a.job.company.owner.id = :ownerId")
    Optional<Application> findByIdAndOwner(@Param("id") Integer id, @Param("ownerId") Integer ownerId);

    @Query("select a.job.id, count(a) from Application a where a.job.id in :jobIds group by a.job.id")
    List<Object[]> countGroupByJob(@Param("jobIds") Collection<Integer> jobIds);

    /** Số hồ sơ theo từng tin: jobId → count (tin không có hồ sơ sẽ không có trong map). */
    default Map<Integer, Long> countByJobIds(Collection<Integer> jobIds) {
        if (jobIds.isEmpty()) return Map.of();
        Map<Integer, Long> result = new HashMap<>();
        for (Object[] row : countGroupByJob(jobIds)) {
            result.put((Integer) row[0], ((Number) row[1]).longValue());
        }
        return result;
    }

    boolean existsByJobId(Integer jobId);

    boolean existsByCvId(Integer cvId);

    long countByCandidateUserId(Integer candidateId);

    @Query("select a.cv.id, count(a) from Application a where a.cv.id in :cvIds group by a.cv.id")
    List<Object[]> countGroupByCv(@Param("cvIds") Collection<Integer> cvIds);

    /** Số đơn đã nộp bằng từng CV: cvId → count (CV chưa dùng sẽ không có trong map). */
    default Map<Integer, Long> countByCvIds(Collection<Integer> cvIds) {
        if (cvIds.isEmpty()) return Map.of();
        Map<Integer, Long> result = new HashMap<>();
        for (Object[] row : countGroupByCv(cvIds)) {
            result.put((Integer) row[0], ((Number) row[1]).longValue());
        }
        return result;
    }

    @Query("""
            select a.appliedAt from Application a
            where a.job.company.owner.id = :ownerId
              and a.appliedAt >= :from and a.appliedAt < :to
            """)
    List<LocalDateTime> findAppliedAtByOwner(@Param("ownerId") Integer ownerId,
                                             @Param("from") LocalDateTime from,
                                             @Param("to") LocalDateTime to);

    @Query("""
            select a.status, count(a) from Application a
            where a.job.company.owner.id = :ownerId
              and a.appliedAt >= :from and a.appliedAt < :to
            group by a.status
            """)
    List<Object[]> countStatusByOwner(@Param("ownerId") Integer ownerId,
                                      @Param("from") LocalDateTime from,
                                      @Param("to") LocalDateTime to);

    @Query("select a.appliedAt from Application a where a.appliedAt >= :from and a.appliedAt < :to")
    List<LocalDateTime> findAppliedAtBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
