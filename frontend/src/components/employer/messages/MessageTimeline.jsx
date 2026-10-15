import React from 'react';
import { MessageBubble } from './MessageBubble';

/**
 * Component hiển thị dòng thời gian các tin nhắn, gom nhóm theo mốc ngày
 * Tích hợp ref tự động cuộn xuống tin mới nhất
 */
export const MessageTimeline = ({ messages, messagesEndRef }) => {
  // Gom nhóm tin nhắn theo nhãn dateGroup (ví dụ: "14/10/2026", "Hôm qua", "Hôm nay")
  const groupedMessages = messages.reduce((groups, message) => {
    const groupKey = message.dateGroup || 'Tin nhắn';
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(message);
    return groups;
  }, {});

  return (
    <div className="message-timeline-area">
      {Object.keys(groupedMessages).length > 0 ? (
        Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
          <div key={dateLabel} className="message-date-group">
            {/* Vạch ngăn cách và nhãn mốc ngày */}
            <div className="date-separator">
              <span className="date-separator-label">{dateLabel}</span>
            </div>

            {/* Các bong bóng tin nhắn trong ngày */}
            <div className="date-messages-list">
              {msgs.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.senderType === 'employer'}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="timeline-empty-hint">
          <p>Chưa có tin nhắn nào trong cuộc trò chuyện này.</p>
          <p className="sub-hint">Hãy gửi lời chào hoặc sử dụng các tin nhắn mẫu bên dưới để bắt đầu kết nối với ứng viên.</p>
        </div>
      )}

      {/* Điểm neo để cuộn tự động xuống cuối */}
      <div ref={messagesEndRef} className="messages-scroll-anchor" />
    </div>
  );
};
