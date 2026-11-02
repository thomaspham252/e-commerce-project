package com.fit.project.controller;

import com.fit.project.dto.payment.PaymentHistoryResponse;
import com.fit.project.enums.UserRole;
import com.fit.project.service.CurrentUserService;
import com.fit.project.service.PaymentAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        currentUserService.require(userId, UserRole.ADMIN);

        Page<PaymentHistoryResponse> result = paymentAdminService.getPayments(status, orderType, search, PageRequest.of(page, size));

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
}
