package com.fit.project.controller;

import com.fit.project.dto.chat.*;
import com.fit.project.entity.User;
import com.fit.project.enums.UserRole;
import com.fit.project.service.ChatService;
import com.fit.project.service.CurrentUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller xử lý các yêu cầu Chat 2 chiều giữa Ứng viên và Doanh nghiệp tuyển dụng.
 */
@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final CurrentUserService currentUserService;

    /**
     * Lấy danh sách cuộc hội thoại của người dùng hiện tại (Ứng viên hoặc Nhà tuyển dụng).
     */
    @GetMapping("/conversations")
    public List<ConversationResponse> getConversations(
            @RequestHeader(value = CurrentUserService.HEADER, required = false) Integer userId,
            @RequestParam(required = false) String role) {
        User user = currentUserService.requireUser(userId);

        boolean isEmployer = "employer".equalsIgnoreCase(role) || 
                ("candidate".equalsIgnoreCase(role) ? false : user.getRole() == UserRole.EMPLOYER);

        if (isEmployer) {
            return chatService.getConversationsForEmployer(user.getId());
        } else {
            return chatService.getConversationsForCandidate(user.getId());
        }
    }

    /**
     * Khởi tạo hoặc tìm cuộc hội thoại tương ứng (thường do Ứng viên bấm "Chat với NTD").
     */
    @PostMapping("/conversations")
    public ConversationResponse createOrFindConversation(
            @RequestHeader(value = CurrentUserService.HEADER, required = false) Integer userId,
            @Valid @RequestBody CreateConversationRequest request) {
        User user = currentUserService.requireUser(userId);
        return chatService.findOrCreateConversation(user.getId(), request);
    }

    /**
     * Lấy danh sách tin nhắn của một cuộc hội thoại.
     */
    @GetMapping("/conversations/{id}/messages")
    public List<ChatMessageResponse> getMessages(
            @RequestHeader(value = CurrentUserService.HEADER, required = false) Integer userId,
            @PathVariable Integer id) {
        User user = currentUserService.requireUser(userId);
        return chatService.getMessages(id, user.getId());
    }

    /**
     * Gửi tin nhắn mới vào cuộc hội thoại.
     */
    @PostMapping("/conversations/{id}/messages")
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @RequestHeader(value = CurrentUserService.HEADER, required = false) Integer userId,
            @PathVariable Integer id,
            @Valid @RequestBody SendMessageRequest request) {
        User user = currentUserService.requireUser(userId);
        ChatMessageResponse response = chatService.sendMessage(id, user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Đánh dấu cuộc hội thoại đã đọc.
     */
    @PutMapping("/conversations/{id}/read")
    public Map<String, Boolean> markAsRead(
            @RequestHeader(value = CurrentUserService.HEADER, required = false) Integer userId,
            @PathVariable Integer id) {
        User user = currentUserService.requireUser(userId);
        chatService.markConversationAsRead(id, user.getId());
        return Map.of("success", true);
    }

    /**
     * Lấy tổng số tin nhắn chưa đọc của người dùng.
     */
    @GetMapping("/unread-count")
    public UnreadCountResponse getUnreadCount(
            @RequestHeader(value = CurrentUserService.HEADER, required = false) Integer userId) {
        User user = currentUserService.requireUser(userId);
        Integer unreadCount = chatService.getUnreadCount(user.getId());
        return UnreadCountResponse.builder()
                .totalUnread(unreadCount)
                .build();
    }
}
