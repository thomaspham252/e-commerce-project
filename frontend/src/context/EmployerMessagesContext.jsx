import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as messagesService from '../services/messagesService';

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
        const qr = await messagesService.getQuickReplies();
        setQuickReplies(qr);
        await fetchConversations();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchConversations]);

  // Chọn một cuộc hội thoại cụ thể
  const selectConversation = useCallback(async (conversationId) => {
    if (!conversationId) {
      setActiveConversationId(null);
      setActiveConversation(null);
      setMessages([]);
      return;
    }

    try {
      setActiveConversationId(conversationId);
      const conv = await messagesService.getConversationById(conversationId);
      setActiveConversation(conv);

      const msgs = await messagesService.getMessages(conversationId);
      setMessages(msgs);

      // Nếu hội thoại có tin chưa đọc, đánh dấu đã đọc
      if (conv && conv.unreadCount > 0) {
        await messagesService.markAsRead(conversationId);
        // Cập nhật lại state local
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

  // Gửi tin nhắn mới
  const handleSendMessage = useCallback(async (content) => {
    if (!activeConversationId || !content || content.trim() === '') return;

    try {
      const result = await messagesService.sendMessage({
        conversationId: activeConversationId,
        senderType: 'employer',
        content
      });

      if (result.success) {
        // Nối tin nhắn vào danh sách hiện tại
        setMessages((prev) => [...prev, result.message]);

        // Cập nhật lại danh sách hội thoại để đưa hội thoại này lên đầu
        await fetchConversations();
      }
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      throw error;
    }
  }, [activeConversationId, fetchConversations]);

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
