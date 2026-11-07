package com.fit.project.dto.employer;

import java.util.List;

public record CandidateSummaryResponse(
        Integer userId,
        String fullName,
        String address,
        String summary,
        String avatar,
        boolean isUnlocked,
        List<String> skills,
        String experienceLevel,
        String email,
        String phone,
        String cvFileName,
        boolean isFeatured,
        boolean isBoosted,
        boolean isPrioritized
) {
    public CandidateSummaryResponse(
            Integer userId,
            String fullName,
            String address,
            String summary,
            String avatar,
            boolean isUnlocked,
            List<String> skills,
            String experienceLevel,
            String email,
            String phone,
            String cvFileName
    ) {
        this(userId, fullName, address, summary, avatar, isUnlocked, skills, experienceLevel, email, phone, cvFileName, false, false, false);
    }
}
