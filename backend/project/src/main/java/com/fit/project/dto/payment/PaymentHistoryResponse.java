package com.fit.project.dto.payment;

import lombok.*;

import java.math.BigDecimal;

/**
 * DTO dữ liệu lịch sử thanh toán đối soát cho Quản trị viên (Admin).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentHistoryResponse {
    private Integer id;
    private String orderCode;
    private String orderType;
    private String userName;
    private String userEmail;
    private BigDecimal expectedAmount;
    private BigDecimal actualAmount;
    private String referenceCode;
    private String gateway;
    private String status;
    private String createdAt;
    private String paidAt;
}
