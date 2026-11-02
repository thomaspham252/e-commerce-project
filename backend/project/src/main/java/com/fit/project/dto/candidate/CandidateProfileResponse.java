package com.fit.project.dto.candidate;

import com.fit.project.entity.CandidateProfile;

import java.time.LocalDate;

public record CandidateProfileResponse(
        Integer userId,
        String fullName,
        String email,
        String phone,
        LocalDate dob,
        String address,
        String avatar,
        String summary,
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
                p.getAddress(),
                p.getAvatar(),
                p.getSummary(),
                Boolean.TRUE.equals(p.getIsSearchable())
        );
    }
}

