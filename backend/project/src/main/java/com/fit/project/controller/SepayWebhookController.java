package com.fit.project.controller;

import com.fit.project.dto.webhook.SepayWebhookPayload;
import com.fit.project.dto.webhook.WebhookResponse;
import com.fit.project.service.PaymentWebhookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoint tiếp nhận Webhook thông báo giao dịch chuyển khoản tự động từ SePay.
 */
@RestController
@RequestMapping("/api/v1/webhooks")
@RequiredArgsConstructor
public class SepayWebhookController {

    private final PaymentWebhookService paymentWebhookService;

    @PostMapping("/sepay")
    public ResponseEntity<WebhookResponse> handleSepayWebhook(
            @RequestBody SepayWebhookPayload payload,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        WebhookResponse response = paymentWebhookService.processWebhook(payload, authHeader);
        return ResponseEntity.ok(response);
    }
}
