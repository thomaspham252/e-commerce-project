package com.fit.project.dto.admin;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Admin tạo/sửa gói dịch vụ Nhà tuyển dụng (bảng packages).
 * jobPostLimit / cvViewLimit để trống = không giới hạn.
 */
public record SavePackageRequest(
        @NotBlank(message = "Vui lòng nhập tên gói")
        @Size(min = 3, max = 100, message = "Tên gói phải từ 3 đến 100 ký tự")
        String name,
        @NotNull(message = "Vui lòng nhập giá bán")
        @DecimalMin(value = "1", message = "Giá bán phải lớn hơn 0")
        BigDecimal price,
        @NotNull(message = "Vui lòng nhập thời hạn")
        @Min(value = 1, message = "Thời hạn phải từ 1 ngày trở lên")
        Integer durationDays,
        @Min(value = 0, message = "Số tin đăng không được âm")
        Integer jobPostLimit,
        @Min(value = 0, message = "Số lượt xem CV không được âm")
        Integer cvViewLimit,
        @Min(value = 0, message = "Số token tặng kèm không được âm")
        Integer includedTokens,
        Boolean canHighlightJobs,
        Boolean canPrioritizeJobs,
        Boolean canSearchCandidates,
        Boolean canDirectContact
) {
}
