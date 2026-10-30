package com.fit.project.dto.company;

import com.fit.project.dto.JobResponse;
import com.fit.project.enums.VerificationStatus;

import java.util.List;
import java.util.Map;

public record CompanyDetailResponse(
        Integer id,
        String name,
        String legalName,
        String taxCode,
        String logo,
        String industry,
        String size,
        String address,
        String description,
        String website,
        VerificationStatus verificationStatus,
        Double rating,
        Long reviewCount,
        Integer recommendRate,
        Map<Integer, Long> ratingBreakdown,
        List<JobResponse> openJobs,
        List<CompanyReviewResponse> reviews
) {
}

