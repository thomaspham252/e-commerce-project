package com.fit.project.dto.admin;

import com.fit.project.enums.VerificationStatus;
import jakarta.validation.constraints.NotNull;

public record VerifyCompanyRequest(@NotNull(message = "Vui lòng chọn trạng thái xác minh") VerificationStatus status) {
}
