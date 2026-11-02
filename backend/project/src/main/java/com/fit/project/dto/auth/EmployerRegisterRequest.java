package com.fit.project.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * DTO tiếp nhận dữ liệu đăng ký tài khoản Nhà tuyển dụng và hồ sơ Doanh nghiệp ban đầu.
 */
public record EmployerRegisterRequest(
        @NotBlank(message = "Vui lòng nhập họ và tên người đại diện")
        @Size(max = 255, message = "Họ và tên không được vượt quá 255 ký tự")
        String name,

        @NotBlank(message = "Vui lòng nhập địa chỉ email")
        @Email(message = "Email không đúng định dạng")
        @Size(max = 255, message = "Email không được vượt quá 255 ký tự")
        String email,

        @NotBlank(message = "Vui lòng nhập mật khẩu")
        @Size(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự")
        String password,

        @NotBlank(message = "Vui lòng nhập số điện thoại")
        @Pattern(regexp = "^(03|05|07|08|09)\\d{8}$", message = "Số điện thoại không hợp lệ (phải gồm 10 chữ số)")
        String phone,

        @NotBlank(message = "Vui lòng nhập tên doanh nghiệp")
        @Size(min = 3, max = 255, message = "Tên doanh nghiệp phải từ 3 đến 255 ký tự")
        String companyName,

        @NotBlank(message = "Vui lòng chọn hoặc nhập lĩnh vực hoạt động")
        @Size(max = 100, message = "Lĩnh vực không được vượt quá 100 ký tự")
        String industry,

        @NotBlank(message = "Vui lòng chọn quy mô doanh nghiệp")
        @Size(max = 50, message = "Quy mô không được vượt quá 50 ký tự")
        String size,

        @NotBlank(message = "Vui lòng nhập địa chỉ trụ sở hoặc văn phòng")
        @Size(max = 500, message = "Địa chỉ không được vượt quá 500 ký tự")
        String address,

        @Size(max = 255, message = "Website không được vượt quá 255 ký tự")
        String website
) {
}

