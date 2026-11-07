package com.fit.project.dto.wallet;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Yêu cầu mua combo tiện ích ứng tuyển bằng Token.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseComboRequest {

    /**
     * Mã định danh của 1 trong 3 combo (ví dụ: COMBO_HIGHLIGHT, COMBO_QUICK_CONTACT, COMBO_COMPREHENSIVE).
     */
    private String comboId;

    /**
     * Khóa Idempotency Key duy nhất gửi từ client để chống gửi trùng khi bấm đúp.
     */
    private String idempotencyKey;
}

