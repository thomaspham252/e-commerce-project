package com.fit.project.repository;

import com.fit.project.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Integer> {

    List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(Integer conversationId);

    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.conversation.id = :convId AND m.senderType <> :readerType AND m.isRead = false")
    void markMessagesAsRead(@Param("convId") Integer convId, @Param("readerType") String readerType);
}
