package com.fit.project.dto.auth;

import com.fit.project.enums.UserRole;

public record LoginResponse(Integer id, String email, UserRole role) {
}
