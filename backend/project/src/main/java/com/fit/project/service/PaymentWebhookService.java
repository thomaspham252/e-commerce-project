package com.fit.project.service;

import com.fit.project.dto.webhook.SepayWebhookPayload;
import com.fit.project.dto.webhook.WebhookResponse;
import com.fit.project.entity.Order;
import com.fit.project.entity.Payment;
import com.fit.project.enums.OrderStatus;
import com.fit.project.enums.PaymentStatus;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.OrderRepository;
import com.fit.project.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service xử lý tiếp nhận Webhook từ SePay, đối soát tiền và kích hoạt đơn hàng.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentWebhookService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final FulfillmentService fulfillmentService;

    @Value("${sepay.api-key:test_sepay_api_key_2026}")
    private String sepayApiKey;

    // Regex tìm mã đơn: PAY-YYYYMMDD-XXXX hoặc PAYYYYYMMDDXXXX
    private static final Pattern ORDER_CODE_PATTERN = Pattern.compile(
            "(?:JOBVIET\\s+)?(PAY-?\\d{8}-?[A-Z0-9]+)",
            Pattern.CASE_INSENSITIVE
    );

    @Transactional
    public WebhookResponse processWebhook(SepayWebhookPayload payload, String authHeader) {
        // 1. Xác thực API Key
        validateApiKey(authHeader);

        if (payload == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Payload rỗng");
        }

        log.info("Nhận Webhook từ SePay: id={}, gateway={}, ref={}, amount={}, content={}",
                payload.getId(), payload.getGateway(), payload.getReferenceCode(),
                payload.getTransferAmount(), payload.getContent());

        // Chỉ xử lý giao dịch tiền vào (transferType = "in")
        if (payload.getTransferType() != null && !"in".equalsIgnoreCase(payload.getTransferType())) {
            log.info("Bỏ qua giao dịch tiền ra: {}", payload.getTransferType());
            return WebhookResponse.builder()
                    .success(true)
                    .message("Bỏ qua giao dịch tiền ra")
                    .build();
        }

        String gateway = payload.getGateway() != null ? payload.getGateway() : "SePay";
        String txCode = payload.getReferenceCode() != null ? payload.getReferenceCode() : String.valueOf(payload.getId());

        // 2. Chống trùng lặp (Idempotency)
        if (paymentRepository.existsByGatewayAndTransactionCode(gateway, txCode)) {
            log.warn("Giao dịch {} - {} đã được xử lý trước đó, bỏ qua.", gateway, txCode);
            return WebhookResponse.builder()
                    .success(true)
                    .message("Giao dịch đã được xử lý trước đó (Idempotent)")
                    .build();
        }

        // 3. Trích xuất mã đơn hàng từ nội dung
        String extractedCode = extractOrderCode(payload.getContent());
        if (extractedCode == null) {
            log.warn("Không tìm thấy mã đơn hàng trong nội dung: {}", payload.getContent());
            return WebhookResponse.builder()
                    .success(true)
                    .message("Không tìm thấy mã đơn hàng trong nội dung chuyển khoản")
                    .build();
        }

        // 4. Tìm đơn hàng trong DB
        Optional<Order> orderOpt = findOrderByExtractedCode(extractedCode);
        if (orderOpt.isEmpty()) {
            log.warn("Không tìm thấy đơn hàng tương ứng với mã: {}", extractedCode);
            return WebhookResponse.builder()
                    .success(true)
                    .message("Không tìm thấy đơn hàng: " + extractedCode)
                    .build();
        }

        Order order = orderOpt.get();

        // 5. So sánh số tiền nhận được
        if (payload.getTransferAmount() != null && payload.getTransferAmount().compareTo(order.getTotalAmount()) >= 0) {
            // Thanh toán đủ tiền -> Hợp lệ
            order.setStatus(OrderStatus.PAID);
            order.setPaidAt(LocalDateTime.now());
            orderRepository.save(order);

            Payment payment = Payment.builder()
                    .order(order)
                    .amount(payload.getTransferAmount())
                    .gateway(gateway)
                    .transactionCode(txCode)
                    .status(PaymentStatus.SUCCESS)
                    .createdAt(LocalDateTime.now())
                    .paidAt(LocalDateTime.now())
                    .build();
            paymentRepository.save(payment);

            // Cấp phát quyền lợi
            fulfillmentService.fulfillOrder(order);

            log.info("Xử lý thanh toán thành công cho đơn hàng {}", order.getOrderCode());
            return WebhookResponse.builder()
                    .success(true)
                    .message("Thanh toán thành công và đã cấp phát quyền lợi")
                    .orderCode(order.getOrderCode())
                    .build();
        } else {
            // Chuyển thiếu tiền -> WRONG_AMOUNT / FAILED
            log.warn("Chuyển thiếu tiền cho đơn {}: cần {}, thực nhận {}",
                    order.getOrderCode(), order.getTotalAmount(), payload.getTransferAmount());

            order.setStatus(OrderStatus.FAILED);
            orderRepository.save(order);

            Payment payment = Payment.builder()
                    .order(order)
                    .amount(payload.getTransferAmount() != null ? payload.getTransferAmount() : java.math.BigDecimal.ZERO)
                    .gateway(gateway)
                    .transactionCode(txCode)
                    .status(PaymentStatus.FAILED)
                    .createdAt(LocalDateTime.now())
                    .build();
            paymentRepository.save(payment);

            return WebhookResponse.builder()
                    .success(true)
                    .message("Chuyển khoản thiếu tiền so với giá trị đơn hàng")
                    .orderCode(order.getOrderCode())
                    .build();
        }
    }

    private void validateApiKey(String authHeader) {
        if (sepayApiKey == null || sepayApiKey.isBlank()) {
            return; // Nếu chưa cấu hình key thì tạm bỏ qua kiểm tra
        }
        if (authHeader == null || authHeader.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Thiếu Authorization Header xác thực Webhook");
        }
        String cleanToken = authHeader.replace("Apikey", "").replace("Bearer", "").trim();
        if (!sepayApiKey.equals(cleanToken)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "API Key xác thực Webhook không hợp lệ");
        }
    }

    public String extractOrderCode(String content) {
        if (content == null || content.isBlank()) return null;
        Matcher matcher = ORDER_CODE_PATTERN.matcher(content);
        if (matcher.find()) {
            return matcher.group(1).trim().toUpperCase();
        }
        return null;
    }

    private Optional<Order> findOrderByExtractedCode(String code) {
        // Thử tìm chính xác
        Optional<Order> order = orderRepository.findByOrderCode(code);
        if (order.isPresent()) return order;

        // Nếu mã không có dấu gạch (VD: PAY202610227890), format lại thành PAY-20261022-7890
        String clean = code.replace("-", "");
        if (clean.length() >= 15 && clean.startsWith("PAY")) {
            String formatted = clean.substring(0, 3) + "-" + clean.substring(3, 11) + "-" + clean.substring(11);
            return orderRepository.findByOrderCode(formatted);
        }

        return Optional.empty();
    }
}
