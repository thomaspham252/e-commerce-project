package com.fit.project.dto.order;

import lombok.*;

import java.math.BigDecimal;

/**
 * DTO trả về trạng thái nhanh của đơn hàng phục vụ cơ chế Polling từ giao diện người dùng.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderStatusResponse {
    private String orderCode;
    private String status;
    private BigDecimal amount;
    private BigDecimal actualAmount;
    private String paidAt;
}
