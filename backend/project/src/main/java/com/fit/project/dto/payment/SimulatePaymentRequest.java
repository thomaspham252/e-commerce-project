package com.fit.project.dto.payment;

import lombok.*;

import java.math.BigDecimal;

/**
 * Yêu cầu giả lập trạng thái đơn hàng phục vụ công cụ Dev Simulator khi chạy kiểm thử hoặc demo.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimulatePaymentRequest {
    private String orderCode;
    private String targetStatus; // "SUCCESS", "WRONG_AMOUNT", "EXPIRED", "CANCELLED"
    private BigDecimal customActualAmount;
}
