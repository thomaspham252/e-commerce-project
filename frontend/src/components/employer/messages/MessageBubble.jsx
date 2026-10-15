import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

/**
 * Component hiển thị một bong bóng tin nhắn đơn lẻ
 * Phân biệt tin nhắn NTD gửi (bên phải) và Ứng viên gửi (bên trái)
 */
export const MessageBubble = ({ message, isOwn }) => {
  const { content, timeFormatted, status } = message;

  return (
    <div className={`message-bubble-wrapper ${isOwn ? 'outgoing' : 'incoming'}`}>
      <div className="message-bubble">
        <div className="message-text-content">{content}</div>

        <div className="message-meta-footer">
          <span className="message-time">{timeFormatted}</span>

          {/* Trạng thái tin nhắn chỉ hiển thị cho tin do NTD gửi */}
          {isOwn && (
            <span className="message-status" title={status === 'read' ? 'Đã xem' : 'Đã gửi'}>
              {status === 'read' ? (
                <CheckCheck size={14} className="status-icon-read" />
              ) : (
                <Check size={14} className="status-icon-sent" />
              )}
              <span className="status-label">{status === 'read' ? 'Đã xem' : 'Đã gửi'}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
