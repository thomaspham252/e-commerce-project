package com.fit.project.dto.employer;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CompanyRequest(
        @NotBlank(message = "Vui lòng nhập tên doanh nghiệp") @Size(max = 255) String name,
        @Size(max = 255) String legalName,
        @Pattern(regexp = "^$|^\\d{10}(-\\d{3})?$", message = "Mã số thuế gồm 10 số (hoặc 10 số-3 số)") String taxCode,
        String description,
        @Size(max = 500) String logo,
        @Size(max = 255) String website,
        @Size(max = 500) String address,
        @Size(max = 100) String industry,
        @Size(max = 50) String size,
        @Size(max = 500) String businessLicenseUrl
) {
}
