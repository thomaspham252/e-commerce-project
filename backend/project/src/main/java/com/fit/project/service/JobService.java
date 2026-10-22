package com.fit.project.service;

import com.fit.project.dto.JobResponse;
import com.fit.project.dto.common.PageResponse;
import com.fit.project.entity.Job;
import com.fit.project.enums.JobStatus;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;

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

        Page<Job> result = jobRepository.searchPublicJobs(
                kwPattern,
                locPattern,
                jt,
                lvl,
                minSalary,
                maxSalary,
                JobStatus.OPEN,
                pageable
        );
        return PageResponse.of(result, JobResponse::of);
    }

    @Transactional(readOnly = true)
    public JobResponse getJobDetail(Integer id) {
        Job job = jobRepository.findByIdAndStatus(id, JobStatus.OPEN)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy tin tuyển dụng hoặc tin đã đóng"));
        return JobResponse.of(job);
    }
}
