package com.fit.project.service;

import com.fit.project.dto.chat.ChatMessageResponse;
import com.fit.project.dto.chat.ConversationResponse;
import com.fit.project.dto.chat.CreateConversationRequest;
import com.fit.project.dto.chat.SendMessageRequest;

import java.util.List;

public interface ChatService {

    ConversationResponse findOrCreateConversation(Integer candidateUserId, CreateConversationRequest request);

    List<ConversationResponse> getConversationsForCandidate(Integer candidateUserId);

    List<ConversationResponse> getConversationsForEmployer(Integer employerUserId);

    List<ChatMessageResponse> getMessages(Integer conversationId, Integer userId);

    ChatMessageResponse sendMessage(Integer conversationId, Integer senderUserId, SendMessageRequest request);

    void markConversationAsRead(Integer conversationId, Integer userId);

    Integer getUnreadCount(Integer userId);
}
