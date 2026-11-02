package com.fit.project.dto.employer;

import java.time.LocalDateTime;

/**
 * Gói dịch vụ hiện tại của NTD và hạn mức đã dùng.
 * status: ACTIVE (đang có gói), EXPIRED (gói gần nhất đã hết hạn), FREE (chưa từng mua gói, dùng hạn mức miễn phí).
 * maxJobPosts / cvViewLimit = null nghĩa là không giới hạn.
 */
public record EmployerSubscriptionResponse(
        String status,
        Integer subscriptionId,
        Integer packageId,
        String packageName,
        String companyName,
        LocalDateTime startDate,
        LocalDateTime endDate,
        long remainingDays,
        long usedJobPosts,
        Integer maxJobPosts,
        Integer cvViewLimit,
        boolean allowRealtimeChat,
        boolean canHighlightJobs,
        boolean canPrioritizeJobs,
        boolean canSearchCandidates,
        String lastOrderId
) {
}
