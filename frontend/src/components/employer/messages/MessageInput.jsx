import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

/**
 * Component ô nhập tin nhắn
 * Hỗ trợ gửi tin bằng phím Enter, xuống dòng bằng Shift + Enter, và nút gửi
 */
export const MessageInput = ({ value, onChange, onSend, disabled }) => {
  const textareaRef = useRef(null);

  // Tự động điều chỉnh chiều cao textarea theo nội dung
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [value]);

  const handleKeyDown = (e) => {
    // Nhấn Enter mà không nhấn Shift -> Gửi tin
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim() !== '') {
        onSend();
      }
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!disabled && value.trim() !== '') {
      onSend();
    }
  };

  return (
    <form className="message-input-form" onSubmit={handleFormSubmit}>
      <div className="input-textarea-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          rows={1}
          placeholder="Nhập nội dung tin nhắn... (Nhấn Enter để gửi, Shift + Enter để xuống dòng)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
      </div>

      <button
        type="submit"
        className={`btn-send-message ${value.trim() ? 'active' : ''}`}
        disabled={disabled || !value.trim()}
        title="Gửi tin nhắn (Enter)"
      >
        <Send size={18} />
      </button>
    </form>
  );
};
