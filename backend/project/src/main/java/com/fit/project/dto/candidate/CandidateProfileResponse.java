package com.fit.project.dto.candidate;

import com.fit.project.entity.CandidateProfile;

import java.time.LocalDate;

public record CandidateProfileResponse(
        Integer userId,
        String fullName,
        String email,
        String phone,
        LocalDate dob,
        String gender,
        String address,
        String avatar,
        String summary,
        String experienceYears,
        String currentLevel,
        String workType,
        String expectedSalary,
        boolean isSearchable
) {
    public static CandidateProfileResponse of(CandidateProfile p) {
        String email = p.getUser() != null ? p.getUser().getEmail() : null;
        return new CandidateProfileResponse(
                p.getUserId(),
                p.getFullName(),
                email,
                p.getPhone(),
                p.getDob(),
                p.getGender(),
                p.getAddress(),
                p.getAvatar(),
                p.getSummary(),
                p.getExperienceYears(),
                p.getCurrentLevel(),
                p.getWorkType(),
                p.getExpectedSalary(),
                Boolean.TRUE.equals(p.getIsSearchable())
        );
    }
}

