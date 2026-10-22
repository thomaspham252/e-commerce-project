package com.fit.project.dto.webhook;

import lombok.*;

import java.math.BigDecimal;

/**
 * Cấu trúc bản tin Webhook nhận từ cổng SePay khi có biến động số dư tài khoản ngân hàng.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SepayWebhookPayload {
    private Long id;
    private String gateway;
    private String transactionDate;
    private String accountNumber;
    private String content;
    private String transferType;
    private BigDecimal transferAmount;
    private BigDecimal accumulated;
    private String referenceCode;
    private String description;
}
