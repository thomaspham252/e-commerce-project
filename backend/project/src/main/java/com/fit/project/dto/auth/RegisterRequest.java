package com.fit.project.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Vui lòng nhập họ và tên") @Size(max = 255, message = "Họ và tên không được vượt quá 255 ký tự") String name,
        @NotBlank(message = "Vui lòng nhập email") @Email(message = "Email không hợp lệ") @Size(max = 255, message = "Email không được vượt quá 255 ký tự") String email,
        @NotBlank(message = "Vui lòng nhập mật khẩu") @Size(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự") String password
) {
}
