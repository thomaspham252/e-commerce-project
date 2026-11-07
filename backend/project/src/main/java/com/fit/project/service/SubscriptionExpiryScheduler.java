package com.fit.project.service;

import com.fit.project.enums.SubscriptionStatus;
import com.fit.project.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Tác vụ nền định kỳ quét và cập nhật các gói dịch vụ quá thời hạn kết thúc sang trạng thái EXPIRED.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionExpiryScheduler {

    private final SubscriptionRepository subscriptionRepository;

    @Scheduled(cron = "0 */10 * * * ?") // Chạy định kỳ mỗi 10 phút
    @Transactional
    public void expireOldSubscriptions() {
        LocalDateTime now = LocalDateTime.now();
        int count = subscriptionRepository.updateStatusForExpiredSubscriptions(
                SubscriptionStatus.ACTIVE,
                SubscriptionStatus.EXPIRED,
                now
        );
        if (count > 0) {
            log.info("Đã cập nhật {} gói dịch vụ tuyển dụng quá hạn sang trạng thái EXPIRED", count);
        }
    }
}

