package com.fit.project.dto.company;

import com.fit.project.entity.Company;
import com.fit.project.enums.VerificationStatus;

public record CompanySummaryResponse(
        Integer id,
        String name,
        String legalName,
        String logo,
        String industry,
        String size,
        String address,
        String description,
        String website,
        VerificationStatus verificationStatus,
        long openJobsCount,
        double rating,
        long reviewCount
) {
    public static CompanySummaryResponse of(Company c, long openJobsCount, double rating, long reviewCount) {
        return new CompanySummaryResponse(
                c.getId(),
                c.getName(),
                c.getLegalName(),
                c.getLogo(),
                c.getIndustry(),
                c.getSize(),
                c.getAddress(),
                c.getDescription(),
                c.getWebsite(),
                c.getVerificationStatus(),
                openJobsCount,
                rating,
                reviewCount
        );
    }
}

