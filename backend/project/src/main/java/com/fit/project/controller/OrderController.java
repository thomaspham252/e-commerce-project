package com.fit.project.controller;

import com.fit.project.dto.order.CreateOrderRequest;
import com.fit.project.dto.order.OrderResponse;
import com.fit.project.dto.order.OrderStatusResponse;
import com.fit.project.service.CurrentUserService;
import com.fit.project.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller xử lý tạo đơn hàng, lấy thông tin VietQR và kiểm tra trạng thái thanh toán.
 */
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createOrder(
            @RequestBody CreateOrderRequest request,
            @RequestHeader(value = CurrentUserService.HEADER, required = false) Integer currentUserId) {
        OrderResponse response = orderService.createOrder(request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "data", response
        ));
    }

    @GetMapping("/{orderCode}")
    public ResponseEntity<Map<String, Object>> getOrderByCode(@PathVariable String orderCode) {
        OrderResponse response = orderService.getOrderByCode(orderCode);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", response
        ));
    }

    @GetMapping("/{orderCode}/status")
    public ResponseEntity<Map<String, Object>> getOrderStatus(@PathVariable String orderCode) {
        OrderStatusResponse response = orderService.getOrderStatus(orderCode);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", response
        ));
    }

    @PostMapping("/{orderCode}/cancel")
    public ResponseEntity<Map<String, Object>> cancelOrder(
            @PathVariable String orderCode,
            @RequestHeader(value = CurrentUserService.HEADER, required = false) Integer currentUserId) {
        orderService.cancelOrder(orderCode, currentUserId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã hủy đơn hàng thành công"
        ));
    }
}
