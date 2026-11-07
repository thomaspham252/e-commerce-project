package com.fit.project.dto.candidate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateBenefitResponse {
    private Integer userId;
    private boolean isBoostActive;
    private LocalDateTime boostCvExpireAt;
    private boolean isFeaturedBadgeActive;
    private LocalDateTime featuredBadgeExpireAt;
    private boolean isPriorityActive;
    private LocalDateTime priorityDisplayExpireAt;
    private int contactUnlockQuota;
    private int aiScoreQuota;
    private List<Long> unlockedCompanyIds;
    private List<UnlockedCompanyInfo> unlockedCompanies;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UnlockedCompanyInfo {
        private Integer companyId;
        private String companyName;
        private String companyLogo;
        private LocalDateTime unlockedAt;
    }
}
