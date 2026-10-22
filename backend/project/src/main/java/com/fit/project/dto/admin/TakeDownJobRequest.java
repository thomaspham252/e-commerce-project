package com.fit.project.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Admin gỡ tin vi phạm: bắt buộc nhập lý do để NTD biết. */
public record TakeDownJobRequest(
        @NotBlank(message = "Vui lòng nhập lý do gỡ tin")
        @Size(max = 1000, message = "Lý do tối đa 1000 ký tự") String reason
) {
}
