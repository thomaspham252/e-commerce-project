package com.fit.project.dto.candidate;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ApplyRequest(
        @NotNull(message = "Thiếu tin tuyển dụng") Integer jobId,
        @NotNull(message = "Vui lòng chọn CV") Integer cvId,
        @Size(max = 1500, message = "Thư giới thiệu tối đa 1500 ký tự") String coverLetter
) {
}
