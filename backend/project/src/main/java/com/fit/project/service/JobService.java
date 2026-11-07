package com.fit.project.service;

import com.fit.project.dto.JobResponse;
import com.fit.project.dto.common.PageResponse;
import com.fit.project.entity.Job;
import com.fit.project.entity.Subscription;
import com.fit.project.enums.JobStatus;
import com.fit.project.enums.SubscriptionStatus;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.JobRepository;
import com.fit.project.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final SubscriptionRepository subscriptionRepository;

    @Transactional(readOnly = true)
    public PageResponse<JobResponse> getPublicJobs(
            String keyword,
            String location,
            String jobType,
            String level,
            BigDecimal minSalary,
            BigDecimal maxSalary,
            String sort,
            int page,
            int size
    ) {
        Sort sortOrder = switch (sort != null ? sort : "latest") {
            case "salary_desc" -> Sort.by(Sort.Direction.DESC, "salaryMax").and(Sort.by(Sort.Direction.DESC, "createdAt"));
            case "salary_asc" -> Sort.by(Sort.Direction.ASC, "salaryMin").and(Sort.by(Sort.Direction.DESC, "createdAt"));
            case "deadline" -> Sort.by(Sort.Direction.ASC, "deadline");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };

        Pageable pageable = QueryUtils.page(page, size, sortOrder);
        String kwPattern = QueryUtils.likePattern(keyword);
        String locPattern = QueryUtils.likePattern(location);
        String jt = (jobType != null && !jobType.isBlank() && !"all".equalsIgnoreCase(jobType)) ? jobType.trim() : null;
        String lvl = (level != null && !level.isBlank() && !"all".equalsIgnoreCase(level)) ? level.trim() : null;

        LocalDateTime now = LocalDateTime.now();
        SubscriptionStatus activeStatus = SubscriptionStatus.ACTIVE;

        Page<Job> result = jobRepository.searchPublicJobs(
                kwPattern,
                locPattern,
                jt,
                lvl,
                minSalary,
                maxSalary,
                JobStatus.OPEN,
                activeStatus,
                now,
                pageable
        );

        Set<Integer> employerIds = result.getContent().stream()
                .map(j -> j.getCompany() != null && j.getCompany().getOwner() != null ? j.getCompany().getOwner().getId() : null)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        List<Subscription> activeSubs = employerIds.isEmpty() ? Collections.emptyList()
                : subscriptionRepository.findInEffectForEmployers(employerIds, activeStatus, now);

        Set<Integer> highlightOwnerIds = activeSubs.stream()
                .filter(s -> Boolean.TRUE.equals(s.getPackageEntity().getCanHighlightJobs()))
                .map(s -> s.getEmployer().getId())
                .collect(Collectors.toSet());

        Set<Integer> prioritizeOwnerIds = activeSubs.stream()
                .filter(s -> Boolean.TRUE.equals(s.getPackageEntity().getCanPrioritizeJobs()))
                .map(s -> s.getEmployer().getId())
                .collect(Collectors.toSet());

        return PageResponse.of(result, j -> {
            Integer ownerId = j.getCompany() != null && j.getCompany().getOwner() != null ? j.getCompany().getOwner().getId() : null;
            boolean effectiveHighlighted = Boolean.TRUE.equals(j.getIsHighlighted())
                    && ownerId != null && highlightOwnerIds.contains(ownerId);
            boolean effectivePrioritized = Boolean.TRUE.equals(j.getIsPrioritized())
                    && ownerId != null && prioritizeOwnerIds.contains(ownerId);
            return JobResponse.of(j, effectiveHighlighted, effectivePrioritized, null, null, null);
        });
    }

    @Transactional(readOnly = true)
    public JobResponse getJobDetail(Integer id) {
        Job job = jobRepository.findByIdAndStatus(id, JobStatus.OPEN)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy tin tuyển dụng hoặc tin đã đóng"));

        LocalDateTime now = LocalDateTime.now();
        Integer ownerId = job.getCompany() != null && job.getCompany().getOwner() != null ? job.getCompany().getOwner().getId() : null;
        boolean effectiveHighlighted = false;
        boolean effectivePrioritized = false;

        if (ownerId != null) {
            List<Subscription> activeSubs = subscriptionRepository.findInEffect(ownerId, SubscriptionStatus.ACTIVE, now);
            effectiveHighlighted = Boolean.TRUE.equals(job.getIsHighlighted())
                    && activeSubs.stream().anyMatch(s -> Boolean.TRUE.equals(s.getPackageEntity().getCanHighlightJobs()));
            effectivePrioritized = Boolean.TRUE.equals(job.getIsPrioritized())
                    && activeSubs.stream().anyMatch(s -> Boolean.TRUE.equals(s.getPackageEntity().getCanPrioritizeJobs()));
        }

        return JobResponse.of(job, effectiveHighlighted, effectivePrioritized, null, null, null);
    }
}
