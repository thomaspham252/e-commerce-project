package com.fit.project.dto.webhook;

import lombok.*;

/**
 * Phản hồi cho cổng SePay sau khi xử lý Webhook.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WebhookResponse {
    private boolean success;
    private String message;
    private String orderCode;
}
