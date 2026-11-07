import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { useEmployerMessages } from '../../context/EmployerMessagesContext';
import { useEmployerPackage } from '../../context/EmployerPackageContext.jsx';
import { ConversationList } from '../../components/employer/messages/ConversationList';
import { ChatHeader } from '../../components/employer/messages/ChatHeader';
import { MessageTimeline } from '../../components/employer/messages/MessageTimeline';
import { QuickRepliesBar } from '../../components/employer/messages/QuickRepliesBar';
import { MessageInput } from '../../components/employer/messages/MessageInput';
import { toast } from 'react-toastify';
import './EmployerMessagesPage.css';

/**
 * Trang Tin nhắn Nhà Tuyển Dụng (EmployerMessagesPage)
 * Kết nối danh sách hội thoại, khung chat, tin nhắn mẫu và điều hướng
 */
export const EmployerMessagesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const { subscription } = useEmployerPackage();
  const {
    conversations,
    activeConversation,
    activeConversationId,
    messages,
    quickReplies,
    filter,
    searchQuery,
    totalUnreadCount,
    setFilter,
    setSearchQuery,
    selectConversation,
    sendMessage,
    openConversationForCandidate
  } = useEmployerMessages();

  // Kiểm tra tham số URL ?candidateId=... khi người dùng chuyển hướng từ Dashboard
  useEffect(() => {
    const candidateIdParam = searchParams.get('candidateId');
    if (candidateIdParam) {
      const found = conversations.find(
        (c) => String(c.candidateId) === String(candidateIdParam)
      );
      if (found) {
        selectConversation(found.id);
      }
    } else if (!activeConversationId && conversations.length > 0) {
      const isMobile = window.innerWidth < 768;
      if (!isMobile) {
        selectConversation(conversations[0].id);
      }
    }
  }, [searchParams, conversations, activeConversationId, selectConversation]);

  // Tự động cuộn xuống tin nhắn mới nhất mỗi khi messages hoặc hội thoại thay đổi
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeConversationId]);

  // Kiểm tra xem ứng viên đã gửi tin nhắn nào trong hội thoại này chưa
  const candidateHasSent = messages.some((m) => m.senderType === 'CANDIDATE' || m.senderRole === 'CANDIDATE');
  const canSend = Boolean(subscription?.allowRealtimeChat) || candidateHasSent;

  // Xử lý gửi tin nhắn
  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;

    if (!canSend) {
      toast.error('Gói dịch vụ hiện tại không hỗ trợ chủ động nhắn tin. Vui lòng nâng cấp gói hoặc chờ ứng viên nhắn trước.');
      return;
    }

    try {
      setIsSending(true);
      await sendMessage(inputText);
      setInputText('');
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || '';
      if (msg.includes('FEATURE_NOT_PERMITTED')) {
        toast.error('Gói dịch vụ hiện tại không hỗ trợ chủ động nhắn tin với ứng viên.');
      } else {
        toast.error('Không thể gửi tin nhắn: ' + msg);
      }
    } finally {
      setIsSending(false);
    }
  };

  // Chọn tin nhắn mẫu (Quick reply)
  const handleSelectQuickReply = (templateText) => {
    setInputText(templateText);
  };

  // Quay lại danh sách hội thoại trên màn hình di động
  const handleBackToList = () => {
    selectConversation(null);
  };

  // Điều hướng đến xem hồ sơ ứng viên
  const handleViewProfile = () => {
    navigate('/employer/applications');
  };

  return (
    <div
      className={`employer-messages-container ${
        activeConversationId ? 'mobile-chat-open' : ''
      }`}
    >
      {/* Cột trái: Danh sách hội thoại */}
      <ConversationList
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={selectConversation}
        filter={filter}
        onFilterChange={setFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalUnreadCount={totalUnreadCount}
      />

      {/* Cột phải: Khung chat chi tiết hoặc trạng thái chưa chọn */}
      {activeConversation ? (
        <div className="chat-window-pane">
          {/* Header thông tin ngữ cảnh ứng viên */}
          <ChatHeader
            conversation={activeConversation}
            onBack={handleBackToList}
            onViewProfile={handleViewProfile}
          />

          {/* Dòng thời gian tin nhắn phân theo ngày */}
          <MessageTimeline
            messages={messages}
            messagesEndRef={messagesEndRef}
          />

          {/* Thanh gợi ý tin nhắn mẫu */}
          <QuickRepliesBar
            templates={quickReplies}
            onSelect={handleSelectQuickReply}
          />

          {/* Khung soạn thảo tin nhắn */}
          <MessageInput
            value={inputText}
            onChange={setInputText}
            onSend={handleSend}
            disabled={isSending}
          />
        </div>
      ) : (
        <div className="no-conversation-selected">
          <div className="placeholder-illustration">
            <MessageSquare size={38} />
          </div>
          <h3 className="placeholder-title">Tin nhắn tuyển dụng</h3>
          <p className="placeholder-subtitle">
            Chọn một cuộc hội thoại từ danh sách bên trái để xem nội dung trao đổi hoặc phản hồi ứng viên nhanh chóng.
          </p>
        </div>
      )}
    </div>
  );
};
