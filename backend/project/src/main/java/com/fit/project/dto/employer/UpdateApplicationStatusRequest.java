package com.fit.project.dto.employer;

import com.fit.project.enums.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/** Khi chuyển sang INVITED thì bắt buộc có interviewAt (tạo lời mời phỏng vấn). */
public record UpdateApplicationStatusRequest(
        @NotNull(message = "Vui lòng chọn trạng thái") ApplicationStatus status,
        @Size(max = 1000) String note,
        LocalDateTime interviewAt,
        @Size(max = 500) String interviewLocation
) {
}
