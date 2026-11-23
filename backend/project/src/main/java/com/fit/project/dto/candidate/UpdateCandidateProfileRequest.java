package com.fit.project.dto.candidate;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UpdateCandidateProfileRequest(
        @Size(max = 255) String fullName,
        @Size(max = 20) String phone,
        LocalDate dob,
        @Size(max = 30) String gender,
        String address,
        String avatar,
        String summary,
        @Size(max = 100) String experienceYears,
        @Size(max = 100) String currentLevel,
        @Size(max = 100) String workType,
        @Size(max = 100) String expectedSalary,
        Boolean isSearchable
) {}

