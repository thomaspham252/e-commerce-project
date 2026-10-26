package com.fit.project.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderName;
    private String senderType; // "CANDIDATE" | "EMPLOYER"
    private String content;
    private String attachmentUrl;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private String timeFormatted;
}
