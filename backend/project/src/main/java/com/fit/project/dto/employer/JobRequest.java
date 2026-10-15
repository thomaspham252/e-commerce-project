package com.fit.project.dto.employer;

import com.fit.project.enums.SalaryUnit;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record JobRequest(
        @NotBlank(message = "Vui lòng nhập tên công việc") @Size(max = 255) String title,
        @NotBlank(message = "Vui lòng nhập mô tả công việc") String description,
        String requirements,
        @PositiveOrZero(message = "Lương không được âm") BigDecimal salaryMin,
        @PositiveOrZero(message = "Lương không được âm") BigDecimal salaryMax,
        SalaryUnit salaryUnit,
        @NotBlank(message = "Vui lòng nhập địa điểm") @Size(max = 255) String location,
        @Size(max = 50) String jobType,
        @Size(max = 50) String level,
        @Min(value = 1, message = "Số lượng tuyển tối thiểu là 1") Integer vacancies,
        @Size(max = 255) String workingSchedule,
        @NotNull(message = "Vui lòng chọn hạn nộp hồ sơ")
        @FutureOrPresent(message = "Hạn nộp không được ở quá khứ") LocalDate deadline
) {
}
