package com.fit.project.dto.admin;

import java.time.LocalDateTime;

/** Một CV trong danh sách quản lý hồ sơ của Admin. applicationCount = số đơn đã nộp bằng CV này. */
public record AdminCvResponse(
        Integer id,
        String fileName,
        String fileUrl,
        Boolean isDefault,
        LocalDateTime uploadedAt,
        Integer candidateId,
        String candidateName,
        String candidateEmail,
        Boolean candidateSearchable,
        long applicationCount
) {
}
