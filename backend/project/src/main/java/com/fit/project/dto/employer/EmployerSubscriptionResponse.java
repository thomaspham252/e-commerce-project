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
        long usedCvViews,
        Integer cvViewLimit,
        boolean allowRealtimeChat,
        boolean canHighlightJobs,
        boolean canPrioritizeJobs,
        boolean canSearchCandidates,
        String lastOrderId,
        QueuedSubscription queuedSubscription
) {
    public EmployerSubscriptionResponse(
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
            long usedCvViews,
            Integer cvViewLimit,
            boolean allowRealtimeChat,
            boolean canHighlightJobs,
            boolean canPrioritizeJobs,
            boolean canSearchCandidates,
            String lastOrderId
    ) {
        this(status, subscriptionId, packageId, packageName, companyName,
                startDate, endDate, remainingDays, usedJobPosts, maxJobPosts,
                usedCvViews, cvViewLimit, allowRealtimeChat, canHighlightJobs,
                canPrioritizeJobs, canSearchCandidates, lastOrderId, null);
    }

    public record QueuedSubscription(
            Integer subscriptionId,
            String packageName,
            LocalDateTime startDate,
            LocalDateTime endDate
    ) {}
}
