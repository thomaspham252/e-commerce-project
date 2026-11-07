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
        String experienceLevel
) {
}

