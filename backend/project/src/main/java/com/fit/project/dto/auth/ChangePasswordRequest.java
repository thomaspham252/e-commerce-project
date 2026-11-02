package com.fit.project.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        String currentPassword,
        @NotBlank(message = "Vui lòng nhập mật khẩu mới")
        @Size(min = 8, message = "Mật khẩu mới phải có ít nhất 8 ký tự")
        String newPassword
) {
}
