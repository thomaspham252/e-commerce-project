package com.fit.project.dto.employer;

import com.fit.project.enums.ApplicationStatus;
import com.fit.project.enums.InvitationStatus;

import java.time.LocalDateTime;
import java.util.List;

public record ApplicationDetailResponse(
        ApplicationResponse application,
        List<ApplicationStatus> nextStatuses,
        List<HistoryItem> history,
        List<InvitationItem> invitations
) {
    public record HistoryItem(ApplicationStatus fromStatus, ApplicationStatus toStatus,
                              String changedBy, LocalDateTime changedAt, String note) {
    }

    public record InvitationItem(Integer id, LocalDateTime scheduledAt, String location,
                                 String notes, InvitationStatus status) {
    }
}
