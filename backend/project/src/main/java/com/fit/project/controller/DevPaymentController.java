package com.fit.project.controller;

import com.fit.project.dto.payment.SimulatePaymentRequest;
import com.fit.project.entity.Order;
import com.fit.project.entity.Payment;
import com.fit.project.enums.OrderStatus;
import com.fit.project.enums.PaymentStatus;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.OrderRepository;
import com.fit.project.repository.PaymentRepository;
import com.fit.project.service.FulfillmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Controller giả lập thanh toán chỉ kích hoạt trong môi trường phát triển (app.dev-mode=true).
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/dev/payments")
@RequiredArgsConstructor
public class DevPaymentController {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final FulfillmentService fulfillmentService;

    @Value("${app.dev-mode:true}")
    private boolean devMode;

    @PostMapping("/simulate")
    @Transactional
    public ResponseEntity<Map<String, Object>> simulatePayment(@RequestBody SimulatePaymentRequest request) {
        if (!devMode) {
            throw ApiException.forbidden("Tính năng giả lập thanh toán bị vô hiệu hóa trong môi trường này");
        }

        if (request.getOrderCode() == null || request.getOrderCode().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mã đơn hàng không được để trống");
        }

        Order order = orderRepository.findByOrderCode(request.getOrderCode())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng: " + request.getOrderCode()));

        String target = request.getTargetStatus() != null ? request.getTargetStatus().toUpperCase() : "SUCCESS";
        BigDecimal actualAmount = request.getCustomActualAmount();

        log.info("Giả lập thanh toán: orderCode={}, targetStatus={}", order.getOrderCode(), target);

        String simTxCode = "DEV_SIM_" + System.currentTimeMillis();

        switch (target) {
            case "SUCCESS" -> {
                actualAmount = order.getTotalAmount();
                order.setStatus(OrderStatus.PAID);
                order.setPaidAt(LocalDateTime.now());
                orderRepository.save(order);

                Payment payment = Payment.builder()
                        .order(order)
                        .amount(actualAmount)
                        .gateway("DevSimulator")
                        .transactionCode(simTxCode)
                        .status(PaymentStatus.SUCCESS)
                        .createdAt(LocalDateTime.now())
                        .paidAt(LocalDateTime.now())
                        .build();
                paymentRepository.save(payment);

                fulfillmentService.fulfillOrder(order);
            }
            case "WRONG_AMOUNT" -> {
                if (actualAmount == null) {
                    actualAmount = order.getTotalAmount().multiply(BigDecimal.valueOf(0.8));
                }
                order.setStatus(OrderStatus.FAILED);
                orderRepository.save(order);

                Payment payment = Payment.builder()
                        .order(order)
                        .amount(actualAmount)
                        .gateway("DevSimulator")
                        .transactionCode(simTxCode)
                        .status(PaymentStatus.FAILED)
                        .createdAt(LocalDateTime.now())
                        .build();
                paymentRepository.save(payment);
            }
            case "EXPIRED", "CANCELLED" -> {
                order.setStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);
            }
            default -> throw new ApiException(HttpStatus.BAD_REQUEST, "Trạng thái giả lập không hỗ trợ: " + target);
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã giả lập cập nhật trạng thái đơn hàng thành: " + target,
                "data", Map.of(
                        "orderCode", order.getOrderCode(),
                        "status", order.getStatus().name(),
                        "totalAmount", order.getTotalAmount(),
                        "actualAmount", actualAmount != null ? actualAmount : BigDecimal.ZERO
                )
        ));
    }
}
