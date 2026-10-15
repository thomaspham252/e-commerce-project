import React from 'react';

/**
 * Component hiển thị một thẻ cuộc hội thoại trong danh sách
 * Hỗ trợ avatar, chấm online xanh, tên ứng viên, vị trí, trích tin cuối và badge chưa đọc
 */
export const ConversationItem = ({ conversation, isActive, onClick }) => {
  const {
    candidateName,
    candidateAvatar,
    avatarFallback,
    jobTitle,
    lastMessage,
    lastMessageTime,
    isOnline,
    unreadCount
  } = conversation;

  // Định dạng thời gian hiển thị gọn gàng (ví dụ: 08:45, Hôm qua, 14/10)
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div
      className={`conversation-item ${isActive ? 'active' : ''} ${unreadCount > 0 ? 'has-unread' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      {/* Khối Avatar & Chấm Online */}
      <div className="conversation-avatar-wrapper">
        {candidateAvatar ? (
          <img
            src={candidateAvatar}
            alt={candidateName}
            className="conversation-avatar-img"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="conversation-avatar-fallback"
          style={{ display: candidateAvatar ? 'none' : 'flex' }}
        >
          {avatarFallback || candidateName.slice(0, 2).toUpperCase()}
        </div>
        <span
          className={`online-indicator ${isOnline ? 'online' : 'offline'}`}
          title={isOnline ? 'Đang trực tuyến' : 'Ngoại tuyến'}
        />
      </div>

      {/* Thông tin hội thoại */}
      <div className="conversation-info">
        <div className="conversation-header-row">
          <h4 className="candidate-name" title={candidateName}>
            {candidateName}
          </h4>
          <span className="last-time">{formatTime(lastMessageTime)}</span>
        </div>

        <div className="job-title-tag" title={jobTitle}>
          {jobTitle}
        </div>

        <div className="conversation-snippet-row">
          <p className="last-snippet" title={lastMessage}>
            {lastMessage || 'Chưa có tin nhắn'}
          </p>
          {unreadCount > 0 && (
            <span className="unread-badge" title={`${unreadCount} tin nhắn chưa đọc`}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
