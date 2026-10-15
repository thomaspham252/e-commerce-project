import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { useEmployerMessages } from '../../context/EmployerMessagesContext';
import { ConversationList } from '../../components/employer/messages/ConversationList';
import { ChatHeader } from '../../components/employer/messages/ChatHeader';
import { MessageTimeline } from '../../components/employer/messages/MessageTimeline';
import { QuickRepliesBar } from '../../components/employer/messages/QuickRepliesBar';
import { MessageInput } from '../../components/employer/messages/MessageInput';
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
      // Tìm trong danh sách hội thoại hiện tại
      const found = conversations.find(
        (c) => String(c.candidateId) === String(candidateIdParam)
      );

      if (found) {
        selectConversation(found.id);
      } else if (candidateIdParam === '1') {
        openConversationForCandidate({
          candidateId: 1,
          candidateName: 'Nguyễn Văn A',
          jobTitle: 'Frontend Developer',
          applicationStatus: 'Đang xem xét'
        });
      } else if (candidateIdParam === '2') {
        openConversationForCandidate({
          candidateId: 2,
          candidateName: 'Trần Thị B',
          jobTitle: 'Frontend Developer',
          applicationStatus: 'Phỏng vấn'
        });
      } else if (candidateIdParam === '3') {
        openConversationForCandidate({
          candidateId: 3,
          candidateName: 'Lê Văn C',
          jobTitle: 'Backend Node.js',
          applicationStatus: 'Đã ứng tuyển'
        });
      } else if (candidateIdParam === '4') {
        openConversationForCandidate({
          candidateId: 4,
          candidateName: 'Phạm Minh D',
          jobTitle: 'UI/UX Designer',
          applicationStatus: 'Trúng tuyển'
        });
      }
    } else if (!activeConversationId && conversations.length > 0) {
      // Mặc định trên desktop: tự động chọn hội thoại đầu tiên nếu chưa chọn
      const isMobile = window.innerWidth < 768;
      if (!isMobile) {
        selectConversation(conversations[0].id);
      }
    }
  }, [searchParams, conversations, activeConversationId, openConversationForCandidate, selectConversation]);

  // Tự động cuộn xuống tin nhắn mới nhất mỗi khi messages hoặc hội thoại thay đổi
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeConversationId]);

  // Xử lý gửi tin nhắn
  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;

    try {
      setIsSending(true);
      await sendMessage(inputText);
      setInputText('');
    } catch (error) {
      console.error('Không thể gửi tin nhắn:', error);
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
