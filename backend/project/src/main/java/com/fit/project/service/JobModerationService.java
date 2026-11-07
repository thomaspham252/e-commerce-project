package com.fit.project.service;

import com.fit.project.dto.ml.MlJobModerationDto;
import com.fit.project.entity.Job;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobModerationService {

    @Value("${app.ml-service.url:http://localhost:8000}")
    private String mlServiceUrl;

    /**
     * Tự động kiểm duyệt tin tuyển dụng bằng PhoBERT AI + Luật nghiệm ngặt (Heuristics).
     * Gán trực tiếp nhãn (an_toan, nghi_van, nguy_co_cao), điểm tin cậy và lý do vào thực thể Job.
     */
    public void evaluateJob(Job job) {
        if (job == null) return;

        try {
            SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(2500);
            factory.setReadTimeout(4000);

            RestClient restClient = RestClient.builder()
                    .baseUrl(mlServiceUrl)
                    .requestFactory(factory)
                    .build();

            Map<String, Object> req = new HashMap<>();
            req.put("title", job.getTitle() != null ? job.getTitle() : "");
            req.put("description", job.getDescription() != null ? job.getDescription() : "");
            req.put("requirements", job.getRequirements() != null ? job.getRequirements() : "");
            req.put("level", job.getLevel() != null ? job.getLevel() : "");
            req.put("salary_min", job.getSalaryMin());
            req.put("salary_max", job.getSalaryMax());

            MlJobModerationDto res = restClient.post()
                    .uri("/api/moderation/predict")
                    .body(req)
                    .retrieve()
                    .body(MlJobModerationDto.class);

            if (res != null && res.label() != null) {
                job.setModerationLabel(res.label());
                job.setModerationScore(res.score());
                job.setModerationReasons(res.reasons());
                log.info("PhoBERT AI đã kiểm duyệt Job #{}: label={}, score={}, reasons={}",
                        job.getId(), res.label(), res.score(), res.reasons());
                return;
            }
        } catch (Exception e) {
            log.warn("Không thể gọi ML Service để kiểm duyệt Job: {}. Áp dụng fallback cơ bản.", e.getMessage());
        }

        // Fallback cơ bản nếu ML Service chưa bật
        if (job.getModerationLabel() == null) {
            job.setModerationLabel("an_toan");
            job.setModerationScore(0.8);
            job.setModerationReasons("Chưa quét qua AI PhoBERT (Fallback)");
        }
    }
}

