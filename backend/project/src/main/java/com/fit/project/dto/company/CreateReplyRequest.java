package com.fit.project.dto.company;

import jakarta.validation.constraints.NotBlank;

public record CreateReplyRequest(
        @NotBlank(message = "Nội dung phản hồi không được để trống")
        String content
) {
}

