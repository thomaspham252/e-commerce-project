import React from 'react';
import { Zap } from 'lucide-react';

/**
 * Component thanh gợi ý các tin nhắn mẫu (Quick replies)
 * Giúp Nhà tuyển dụng phản hồi ứng viên nhanh chỉ với 1 cú click
 */
export const QuickRepliesBar = ({ templates = [], onSelect }) => {
  if (!templates || templates.length === 0) return null;

  return (
    <div className="quick-replies-bar">
      <div className="quick-replies-header">
        <Zap size={14} className="quick-icon" />
        <span className="quick-label">Tin nhắn mẫu nhanh:</span>
      </div>

      <div className="quick-replies-scroll">
        {templates.map((tpl) => (
          <button
            key={tpl.id}
            type="button"
            className="quick-reply-chip"
            onClick={() => onSelect(tpl.content)}
            title={tpl.content}
          >
            {tpl.title}
          </button>
        ))}
      </div>
    </div>
  );
};
