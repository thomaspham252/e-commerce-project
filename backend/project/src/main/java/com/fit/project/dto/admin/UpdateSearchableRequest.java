package com.fit.project.dto.admin;

import jakarta.validation.constraints.NotNull;

/** searchable = false: ẩn hồ sơ ứng viên khỏi tìm kiếm của nhà tuyển dụng. */
public record UpdateSearchableRequest(@NotNull(message = "Thiếu trạng thái hiển thị") Boolean searchable) {
}
