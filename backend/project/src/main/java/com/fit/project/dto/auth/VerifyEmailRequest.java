package com.fit.project.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record VerifyEmailRequest(
        @NotBlank(message = "Vui lòng nhập email")
        @Email(message = "Email không hợp lệ")
        @Size(max = 255, message = "Email không được vượt quá 255 ký tự")
        String email,
        @NotBlank(message = "Vui lòng nhập mã xác minh")
        @Pattern(regexp = "[0-9]{6}", message = "Mã xác minh phải gồm 6 chữ số")
        String code
) {
}
