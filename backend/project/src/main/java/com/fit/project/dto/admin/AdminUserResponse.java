package com.fit.project.dto.admin;

import com.fit.project.enums.UserRole;
import com.fit.project.enums.UserStatus;

import java.time.LocalDateTime;

public record AdminUserResponse(
        Integer id,
        String email,
        String displayName,
        UserRole role,
        UserStatus status,
        LocalDateTime createdAt
) {
}
