package com.fit.project.dto.wallet;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Phản hồi chi tiết sau khi thực hiện giao dịch mua combo tiện ích ứng tuyển.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseComboResponse {

    private boolean success;
    private String message;
    private WalletInfo wallet;
    private TransactionInfo transaction;
    private BenefitsInfo benefits;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WalletInfo {
        private Integer userId;
        private int balance;
        private int totalConsumed;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionInfo {
        private String id;
        private int amount;
        private int balanceAfter;
        private String refType;
        private boolean idempotentReplay;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BenefitsInfo {
        private int boostCvHours;
        private int featuredBadgeHours;
        private int priorityDisplayDays;
        private int contactUnlockQuotaAdded;
        private int totalContactUnlockQuota;
        private int aiScoreQuotaAdded;
        private int totalAiScoreQuota;
    }
}

