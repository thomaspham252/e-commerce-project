package com.fit.project.dto.candidate;

import jakarta.validation.constraints.NotBlank;

public record CreateCvRequest(
        @NotBlank(message = "Tên tệp CV không được để trống")
        String fileName,

        @NotBlank(message = "Đường dẫn tệp CV không được để trống")
        String fileUrl,

        Boolean isDefault
) {}

