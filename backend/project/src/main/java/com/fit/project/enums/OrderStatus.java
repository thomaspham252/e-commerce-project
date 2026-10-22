package com.fit.project.enums;

/**
 * Trạng thái xử lý của đơn hàng theo schema MySQL orders.status.
 */
public enum OrderStatus {
    PENDING,
    PAID,
    FULFILLED,
    CANCELLED,
    FAILED,
    REFUNDED
}
