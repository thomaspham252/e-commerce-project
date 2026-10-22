package com.fit.project.service;

import com.fit.project.enums.JobStatus;
import com.fit.project.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/** Tự chuyển tin quá hạn nộp sang EXPIRED: khi khởi động và lúc 00:05 mỗi ngày. */
@Slf4j
@Component
@RequiredArgsConstructor
public class JobExpiryScheduler {

    private final JobRepository jobRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Scheduled(cron = "0 5 0 * * *")
    @Transactional
    public void expireOverdueJobs() {
        int expired = jobRepository.expireOverdue(LocalDate.now(), JobStatus.OPEN, JobStatus.EXPIRED);
        if (expired > 0) {
            log.info("Đã chuyển {} tin tuyển dụng quá hạn sang EXPIRED", expired);
        }
    }
}
