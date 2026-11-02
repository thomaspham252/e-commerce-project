package com.fit.project.dto.candidate;

import com.fit.project.entity.Cv;

import java.time.LocalDateTime;

public record CandidateCvResponse(
        Integer id,
        String fileName,
        String fileUrl,
        boolean isDefault,
        LocalDateTime uploadedAt
) {
    public static CandidateCvResponse of(Cv cv) {
        return new CandidateCvResponse(cv.getId(), cv.getFileName(), cv.getFileUrl(),
                Boolean.TRUE.equals(cv.getIsDefault()), cv.getUploadedAt());
    }
}
