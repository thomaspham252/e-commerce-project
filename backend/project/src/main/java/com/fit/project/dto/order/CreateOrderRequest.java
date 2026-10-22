package com.fit.project.dto.order;

import com.fit.project.enums.OrderType;
import lombok.*;

/**
 * Yêu cầu tạo mới đơn hàng thanh toán.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequest {
    private OrderType orderType;
    private Integer packageId;
    private Integer tokenPackageId;
}
