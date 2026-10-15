package com.fit.project.dto;

import com.fit.project.entity.Company;
import com.fit.project.enums.VerificationStatus;

import java.time.LocalDateTime;

public record CompanyResponse(
        Integer id,
        String name,
        String legalName,
        String taxCode,
        String description,
        String logo,
        String website,
        String address,
        String industry,
        String size,
        String businessLicenseUrl,
        VerificationStatus verificationStatus,
        LocalDateTime verifiedAt,
        Integer ownerId,
        String ownerEmail
) {
    public static CompanyResponse of(Company c) {
        return new CompanyResponse(c.getId(), c.getName(), c.getLegalName(), c.getTaxCode(), c.getDescription(),
                c.getLogo(), c.getWebsite(), c.getAddress(), c.getIndustry(), c.getSize(), c.getBusinessLicenseUrl(),
                c.getVerificationStatus(), c.getVerifiedAt(), c.getOwner().getId(), c.getOwner().getEmail());
    }
}
