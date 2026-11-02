package com.fit.project.dto.candidate;

import java.time.LocalDate;

public record UpdateCandidateProfileRequest(
        String fullName,
        String phone,
        LocalDate dob,
        String address,
        String avatar,
        String summary,
        Boolean isSearchable
) {}

