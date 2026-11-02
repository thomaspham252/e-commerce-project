package com.fit.project.dto.candidate;

import com.fit.project.entity.Application;
import com.fit.project.entity.InterviewInvitation;
import com.fit.project.enums.ApplicationStatus;
import com.fit.project.enums.SalaryUnit;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Một đơn ứng tuyển nhìn từ phía ứng viên (lịch sử ứng tuyển). */
public record CandidateApplicationResponse(
        Integer id,
        Integer jobId,
        String jobTitle,
        Integer companyId,
        String companyName,
        String companyLogo,
        String location,
        BigDecimal salaryMin,
        BigDecimal salaryMax,
        SalaryUnit salaryUnit,
        Integer cvId,
        String cvFileName,
        String coverLetter,
        ApplicationStatus status,
        LocalDateTime appliedAt,
        LocalDateTime updatedAt,
        LocalDateTime interviewAt,
        String interviewLocation,
        String interviewNote
) {
    public static CandidateApplicationResponse of(Application a, InterviewInvitation invitation) {
        var job = a.getJob();
        var company = job.getCompany();
        return new CandidateApplicationResponse(a.getId(), job.getId(), job.getTitle(),
                company.getId(), company.getName(), company.getLogo(), job.getLocation(),
                job.getSalaryMin(), job.getSalaryMax(), job.getSalaryUnit(),
                a.getCv().getId(), a.getCv().getFileName(), a.getCoverLetter(),
                a.getStatus(), a.getAppliedAt(), a.getUpdatedAt(),
                invitation == null ? null : invitation.getScheduledAt(),
                invitation == null ? null : invitation.getLocation(),
                invitation == null ? null : invitation.getNotes());
    }
}
