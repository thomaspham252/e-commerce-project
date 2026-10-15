package com.fit.project.dto.admin;

import com.fit.project.enums.UserStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateUserStatusRequest(@NotNull(message = "Vui lòng chọn trạng thái") UserStatus status) {
}
