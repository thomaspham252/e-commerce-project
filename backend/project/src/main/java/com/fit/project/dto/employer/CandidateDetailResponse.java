package com.fit.project.dto.employer;

import com.fit.project.dto.candidate.CandidateCvResponse;

import java.util.List;

public record CandidateDetailResponse(
        Integer userId,
        String fullName,
        String email,
        String phone,
        String address,
        String summary,
        String avatar,
        List<CandidateCvResponse> cvs,
        boolean isUnlocked,
        boolean hasAppliedToCompany
) {
}

