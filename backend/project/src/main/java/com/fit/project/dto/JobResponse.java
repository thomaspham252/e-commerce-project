package com.fit.project.dto;

import com.fit.project.entity.Company;
import com.fit.project.entity.Job;
import com.fit.project.enums.JobStatus;
import com.fit.project.enums.SalaryUnit;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record JobResponse(
        Integer id,
        String title,
        Integer companyId,
        String companyName,
        String companyLogo,
        String companyIndustry,
        String companyDescription,
        String companyWebsite,
        String companySize,
        String description,
        String requirements,
        String skills,
        BigDecimal salaryMin,
        BigDecimal salaryMax,
        SalaryUnit salaryUnit,
        String location,
        String jobType,
        String level,
        Integer vacancies,
        String workingSchedule,
        LocalDate deadline,
        JobStatus status,
        Boolean isHighlighted,
        String rejectionReason,
        LocalDateTime reviewedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        Long applicationCount,
        Integer matchPercentage,
        List<String> matchedSkills
) {
    public static JobResponse of(Job j, Long applicationCount, Integer matchPercentage, List<String> matchedSkills) {
        Company comp = j.getCompany();
        return new JobResponse(
                j.getId(),
                j.getTitle(),
                comp != null ? comp.getId() : null,
                comp != null ? comp.getName() : null,
                comp != null ? comp.getLogo() : null,
                comp != null ? comp.getIndustry() : null,
                comp != null ? comp.getDescription() : null,
                comp != null ? comp.getWebsite() : null,
                comp != null ? comp.getSize() : null,
                j.getDescription(),
                j.getRequirements(),
                j.getSkills(),
                j.getSalaryMin(),
                j.getSalaryMax(),
                j.getSalaryUnit(),
                j.getLocation(),
                j.getJobType(),
                j.getLevel(),
                j.getVacancies(),
                j.getWorkingSchedule(),
                j.getDeadline(),
                j.getStatus(),
                j.getIsHighlighted(),
                j.getRejectionReason(),
                j.getReviewedAt(),
                j.getCreatedAt(),
                j.getUpdatedAt(),
                applicationCount,
                matchPercentage,
                matchedSkills
        );
    }

    public static JobResponse of(Job j, Long applicationCount) {
        return of(j, applicationCount, null, null);
    }

    public static JobResponse of(Job j) {
        return of(j, null, null, null);
    }
}
