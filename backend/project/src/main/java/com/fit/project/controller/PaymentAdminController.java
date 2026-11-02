package com.fit.project.controller;

import com.fit.project.dto.payment.PaymentHistoryResponse;
import com.fit.project.enums.UserRole;
import com.fit.project.exception.ApiException;
import com.fit.project.service.CurrentUserService;
import com.fit.project.service.PaymentAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

/**
 * Controller dành cho Quản trị viên (Admin) xem và đối soát các giao dịch thanh toán.
 */
@RestController
@RequestMapping("/api/v1/admin/payments")
@RequiredArgsConstructor
public class PaymentAdminController {

    private final PaymentAdminService paymentAdminService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getPayments(
            @RequestHeader(value = CurrentUserService.HEADER, required = false) Integer userId,
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false, defaultValue = "ALL") String orderType,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        currentUserService.require(userId, UserRole.ADMIN);
        if (from != null && to != null && from.isAfter(to)) {
            throw ApiException.badRequest("Ngày bắt đầu phải trước ngày kết thúc");
        }

        Page<PaymentHistoryResponse> result = paymentAdminService.getPayments(status, orderType, search, from, to, page, size);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "content", result.getContent(),
                        "page", result.getNumber(),
                        "size", result.getSize(),
                        "totalElements", result.getTotalElements(),
                        "totalPages", result.getTotalPages()
                )
        ));
    }

    /** Thống kê nhanh: số giao dịch theo trạng thái và số giao dịch lệch tiền (AMOUNT_MISMATCH). */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(
            @RequestHeader(value = CurrentUserService.HEADER, required = false) Integer userId) {
        currentUserService.require(userId, UserRole.ADMIN);
        return ResponseEntity.ok(Map.of("success", true, "data", paymentAdminService.getSummary()));
    }
}
