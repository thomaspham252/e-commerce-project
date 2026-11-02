package com.fit.project.dto.employer;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Một đơn mua gói dịch vụ của NTD (lịch sử mua gói). status theo bảng orders: PENDING, PAID, FULFILLED, ... */
public record EmployerOrderResponse(
        String orderId,
        String serviceName,
        BigDecimal amount,
        String status,
        LocalDateTime createdAt,
        LocalDateTime paidAt
) {
}
