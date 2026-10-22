package com.fit.project.dto.employer;

import com.fit.project.entity.Application;
import com.fit.project.enums.ApplicationStatus;

import java.time.LocalDateTime;

public record ApplicationResponse(
        Integer id,
        Integer jobId,
        String jobTitle,
        Integer candidateId,
        String candidateName,
        String candidateEmail,
        String candidatePhone,
        String cvUrl,
        String cvFileName,
        String coverLetter,
        ApplicationStatus status,
        LocalDateTime appliedAt,
        LocalDateTime updatedAt
) {
    public static ApplicationResponse of(Application a) {
        var candidate = a.getCandidate();
        return new ApplicationResponse(a.getId(), a.getJob().getId(), a.getJob().getTitle(),
                candidate.getUserId(), candidate.getFullName(), candidate.getUser().getEmail(), candidate.getPhone(),
                a.getCv().getFileUrl(), a.getCv().getFileName(), a.getCoverLetter(),
                a.getStatus(), a.getAppliedAt(), a.getUpdatedAt());
    }
}
