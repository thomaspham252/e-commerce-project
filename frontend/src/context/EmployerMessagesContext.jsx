import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as messagesService from '../services/messagesService';
import {
  getSocket,
  joinConversationRoom,
  leaveConversationRoom,
  emitChatMessage,
  emitTypingStatus,
  onReceiveMessage,
  onUserTyping,
  onMessagesMarkedRead
} from '../services/socketService';

const EmployerMessagesContext = createContext(null);

export const EmployerMessagesProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [quickReplies, setQuickReplies] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isCandidateTyping, setIsCandidateTyping] = useState(false);
  const prevActiveConvIdRef = useRef(null);

  // Tải danh sách hội thoại và tin nhắn mẫu khi khởi tạo
  const fetchConversations = useCallback(async (currentFilter = filter, currentSearch = searchQuery) => {
    try {
      const data = await messagesService.getConversations({
        filter: currentFilter,
        search: currentSearch
      });
      setConversations(data);

      const unread = await messagesService.getTotalUnreadCount();
      setTotalUnreadCount(unread);
    } catch (error) {
      console.error('Lỗi khi tải danh sách hội thoại:', error);
    }
  }, [filter, searchQuery]);

  // Khởi tạo ban đầu
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        // Kết nối socket.io
        getSocket();

        const qr = await messagesService.getQuickReplies();
        setQuickReplies(qr);
        await fetchConversations();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchConversations]);

  // Quản lý tham gia / rời phòng Socket.IO khi đổi activeConversationId
  useEffect(() => {
    if (prevActiveConvIdRef.current && prevActiveConvIdRef.current !== activeConversationId) {
      leaveConversationRoom({ conversationId: prevActiveConvIdRef.current, userId: 'employer' });
    }

    if (activeConversationId) {
      joinConversationRoom({
        conversationId: activeConversationId,
        userId: activeConversation?.companyId || 'employer',
        role: 'employer'
      });
      prevActiveConvIdRef.current = activeConversationId;
    }
  }, [activeConversationId, activeConversation]);

  // Lắng nghe tin nhắn Realtime qua Socket.IO
  useEffect(() => {
    const unsubMessage = onReceiveMessage(({ conversationId, message }) => {
      console.log('⚡ [Socket.io Employer] Nhận tin nhắn mới:', conversationId, message);

      if (String(conversationId) === String(activeConversationId)) {
        setMessages((prev) => {
          if (prev.some((m) => String(m.id) === String(message.id))) return prev;
          return [...prev, message];
        });

        // Tự động đánh dấu đã đọc nếu đang mở đúng khung chat
        messagesService.markAsRead(conversationId).catch(() => {});
      }

      // Cập nhật danh sách hội thoại theo thời gian thực
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (String(c.id) === String(conversationId)) {
            const isCurrent = String(conversationId) === String(activeConversationId);
            return {
              ...c,
              lastMessage: message.content,
              lastMessageTime: message.timestamp || new Date().toISOString(),
              unreadCount: isCurrent ? 0 : (c.unreadCount || 0) + 1
            };
          }
          return c;
        });
        return updated.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
      });

      messagesService.getTotalUnreadCount().then(setTotalUnreadCount).catch(() => {});
    });

    const unsubTyping = onUserTyping(({ conversationId, isTyping }) => {
      if (String(conversationId) === String(activeConversationId)) {
        setIsCandidateTyping(Boolean(isTyping));
      }
    });

    const unsubMarkRead = onMessagesMarkedRead(({ conversationId }) => {
      if (String(conversationId) === String(activeConversationId)) {
        setMessages((prev) =>
          prev.map((m) => (m.status !== 'read' ? { ...m, status: 'read' } : m))
        );
      }
    });

    return () => {
      unsubMessage();
      unsubTyping();
      unsubMarkRead();
    };
  }, [activeConversationId]);

  // Chọn một cuộc hội thoại cụ thể
  const selectConversation = useCallback(async (conversationId) => {
    if (!conversationId) {
      setActiveConversationId(null);
      setActiveConversation(null);
      setMessages([]);
      setIsCandidateTyping(false);
      return;
    }

    try {
      setActiveConversationId(conversationId);
      setIsCandidateTyping(false);
      const conv = await messagesService.getConversationById(conversationId);
      setActiveConversation(conv);

      const msgs = await messagesService.getMessages(conversationId);
      setMessages(msgs);

      // Nếu hội thoại có tin chưa đọc, đánh dấu đã đọc
      if (conv && conv.unreadCount > 0) {
        await messagesService.markAsRead(conversationId);
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
        );
        const unread = await messagesService.getTotalUnreadCount();
        setTotalUnreadCount(unread);
      }
    } catch (error) {
      console.error('Lỗi khi chọn hội thoại:', error);
    }
  }, []);

  // Gửi tin nhắn mới & phát realtime qua Socket.IO
  const handleSendMessage = useCallback(async (content) => {
    if (!activeConversationId || !content || content.trim() === '') return;

    try {
      const result = await messagesService.sendMessage({
        conversationId: activeConversationId,
        senderType: 'employer',
        content
      });

      if (result.success) {
        // 1. Cập nhật state local
        setMessages((prev) => [...prev, result.message]);

        // 2. Phát qua Socket.IO cho ứng viên nhận tức thì
        emitChatMessage({
          conversationId: activeConversationId,
          message: result.message,
          recipientUserId: activeConversation?.candidateId
        });

        // 3. Đưa hội thoại này lên đầu danh sách
        await fetchConversations();
      }
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      throw error;
    }
  }, [activeConversationId, activeConversation, fetchConversations]);

  // Báo trạng thái gõ phím của nhà tuyển dụng
  const setEmployerTyping = useCallback((isTyping) => {
    if (activeConversationId) {
      emitTypingStatus({
        conversationId: activeConversationId,
        userId: activeConversation?.companyId || 'employer',
        userName: activeConversation?.companyName || 'Nhà tuyển dụng',
        isTyping
      });
    }
  }, [activeConversationId, activeConversation]);

  // Mở hoặc tạo hội thoại cho ứng viên (từ Dashboard)
  const openConversationForCandidate = useCallback(async (candidateData) => {
    try {
      const conv = await messagesService.getOrCreateConversationForCandidate(candidateData);
      await fetchConversations();
      await selectConversation(conv.id);
      return conv.id;
    } catch (error) {
      console.error('Lỗi khi mở hội thoại ứng viên:', error);
      return null;
    }
  }, [fetchConversations, selectConversation]);

  // Thay đổi bộ lọc (Tất cả / Chưa đọc)
  const handleSetFilter = (newFilter) => {
    setFilter(newFilter);
    fetchConversations(newFilter, searchQuery);
  };

  // Thay đổi tìm kiếm
  const handleSetSearchQuery = (query) => {
    setSearchQuery(query);
    fetchConversations(filter, query);
  };

  return (
    <EmployerMessagesContext.Provider
      value={{
        conversations,
        activeConversation,
        activeConversationId,
        messages,
        quickReplies,
        filter,
        searchQuery,
        totalUnreadCount,
        loading,
        isCandidateTyping,
        setEmployerTyping,
        setFilter: handleSetFilter,
        setSearchQuery: handleSetSearchQuery,
        selectConversation,
        sendMessage: handleSendMessage,
        openConversationForCandidate,
        refreshConversations: fetchConversations
      }}
    >
      {children}
    </EmployerMessagesContext.Provider>
  );
};

export const useEmployerMessages = () => {
  const context = useContext(EmployerMessagesContext);
  if (!context) {
    throw new Error('useEmployerMessages phải được sử dụng bên trong EmployerMessagesProvider');
  }
  return context;
};
