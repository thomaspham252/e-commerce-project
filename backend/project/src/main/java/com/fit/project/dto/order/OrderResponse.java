package com.fit.project.dto.order;

import lombok.*;

import java.math.BigDecimal;

/**
 * DTO trả về thông tin chi tiết đơn hàng và mã VietQR thanh toán.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private String orderCode;
    private String orderType;
    private String serviceName;
    private BigDecimal amount;
    private BigDecimal actualAmount;
    private String status;
    private String bankCode;
    private String bankName;
    private String accountNumber;
    private String accountHolder;
    private String transferContent;
    private String qrCodeUrl;
    private String createdAt;
    private String expiresAt;
    private String paidAt;
}
