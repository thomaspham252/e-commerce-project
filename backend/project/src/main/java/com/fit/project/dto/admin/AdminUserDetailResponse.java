package com.fit.project.dto.admin;

import com.fit.project.enums.UserRole;
import com.fit.project.enums.UserStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Chi tiết người dùng cho Admin. Các trường hồ sơ ứng viên (phone, dob, address, summary, searchable,
 * cvCount, applicationCount) chỉ có với CANDIDATE; companyId/companyName/jobCount chỉ có với EMPLOYER.
 */
public record AdminUserDetailResponse(
        Integer id,
        String email,
        String displayName,
        UserRole role,
        UserStatus status,
        LocalDateTime createdAt,
        String phone,
        LocalDate dob,
        String address,
        String summary,
        Boolean searchable,
        Long cvCount,
        Long applicationCount,
        Integer companyId,
        String companyName,
        Long jobCount
) {
}
