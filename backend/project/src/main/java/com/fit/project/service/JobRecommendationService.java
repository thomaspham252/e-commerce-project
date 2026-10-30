package com.fit.project.service;

import com.fit.project.dto.JobResponse;
import com.fit.project.dto.ml.MlRelatedJobDto;
import com.fit.project.entity.Job;
import com.fit.project.enums.JobStatus;
import com.fit.project.repository.ApplicationRepository;
import com.fit.project.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobRecommendationService {

    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    @Value("${app.ml-service.url:http://localhost:8000}")
    private String mlServiceUrl;

    @Transactional(readOnly = true)
    public List<JobResponse> getRelatedJobs(Integer jobId, int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 20));

        // 1. Thử gọi sang Python ML Service
        try {
            SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(2000);
            factory.setReadTimeout(3000);

            RestClient restClient = RestClient.builder()
                    .baseUrl(mlServiceUrl)
                    .requestFactory(factory)
                    .build();

            MlRelatedJobDto[] predictions = restClient.get()
                    .uri("/api/related-jobs/{jobId}?top_k={topK}", jobId, safeLimit)
                    .retrieve()
                    .body(MlRelatedJobDto[].class);

            if (predictions != null && predictions.length > 0) {
                List<JobResponse> results = new ArrayList<>();
                for (MlRelatedJobDto item : predictions) {
                    if (item.jobId() == null) continue;
                    Optional<Job> jobOpt = jobRepository.findById(item.jobId());
                    if (jobOpt.isPresent() && jobOpt.get().getStatus() == JobStatus.OPEN) {
                        Job j = jobOpt.get();
                        long appCount = applicationRepository.countByJobId(j.getId());
                        results.add(JobResponse.of(j, appCount, item.matchPercentage(), item.matchedSkills()));
                    }
                }
                if (!results.isEmpty()) {
                    log.debug("Lấy thành công {} việc làm liên quan từ ML Service cho Job #{}", results.size(), jobId);
                    return results;
                }
            }
        } catch (Exception e) {
            log.warn("Không thể kết nối hoặc lỗi từ ML Service ({}): {}. Sử dụng truy vấn SQL dự phòng.",
                    mlServiceUrl, e.getMessage());
        }

        // 2. Dự phòng an toàn (Fallback): Tìm việc làm cùng cấp bậc hoặc địa điểm từ CSDL
        return getFallbackRecommendations(jobId, safeLimit);
    }

    private List<JobResponse> getFallbackRecommendations(Integer jobId, int limit) {
        Job current = jobRepository.findById(jobId).orElse(null);
        String level = current != null ? current.getLevel() : null;

        Page<Job> page = jobRepository.searchPublicJobs(
                null,
                null,
                null,
                level,
                null,
                null,
                JobStatus.OPEN,
                PageRequest.of(0, limit + 2, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        List<JobResponse> fallback = new ArrayList<>();
        int rank = 0;
        for (Job j : page.getContent()) {
            if (Objects.equals(j.getId(), jobId)) continue;
            long appCount = applicationRepository.countByJobId(j.getId());
            int fallbackPercentage = Math.max(70, 88 - rank * 3);
            fallback.add(JobResponse.of(j, appCount, fallbackPercentage, List.of()));
            rank++;
            if (fallback.size() >= limit) break;
        }

        // Nếu vẫn không đủ kết quả, lấy thêm các open jobs khác
        if (fallback.size() < limit) {
            Page<Job> anyOpen = jobRepository.searchPublicJobs(
                    null, null, null, null, null, null,
                    JobStatus.OPEN,
                    PageRequest.of(0, limit + 2, Sort.by(Sort.Direction.DESC, "id"))
            );
            for (Job j : anyOpen.getContent()) {
                if (Objects.equals(j.getId(), jobId)) continue;
                if (fallback.stream().anyMatch(f -> Objects.equals(f.id(), j.getId()))) continue;
                long appCount = applicationRepository.countByJobId(j.getId());
                fallback.add(JobResponse.of(j, appCount, 75, List.of()));
                if (fallback.size() >= limit) break;
            }
        }

        return fallback;
    }
}

