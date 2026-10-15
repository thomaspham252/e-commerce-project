package com.fit.project.dto.admin;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** approved = true: duyệt (OPEN); false: từ chối (REJECTED, bắt buộc có lý do). */
public record ReviewJobRequest(
        @NotNull(message = "Thiếu quyết định duyệt") Boolean approved,
        @Size(max = 1000, message = "Lý do tối đa 1000 ký tự") String reason
) {
}
