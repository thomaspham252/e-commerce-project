import React, { useRef, useEffect, useState } from 'react';
import { Send, Paperclip, Loader2 } from 'lucide-react';
import { uploadService } from '../../../services/uploadService';

/**
 * Component ô nhập tin nhắn
 * Hỗ trợ gửi tin bằng phím Enter, xuống dòng bằng Shift + Enter, đính kèm tệp/ảnh và nút gửi
 */
export const MessageInput = ({ value, onChange, onSend, disabled }) => {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const isImg = file.type.startsWith('image/');
      const res = isImg
        ? await uploadService.uploadImage(file)
        : await uploadService.uploadFile(file);

      if (res?.url) {
        const attachText = isImg
          ? `\n![${file.name}](${res.url})`
          : `\n[Tệp đính kèm: ${file.name}](${res.url})`;
        onChange(value ? value + attachText : attachText.trim());
      }
    } catch (err) {
      console.error('Lỗi khi đính kèm file trong tin nhắn:', err);
      alert(err.message || 'Không thể tải file lên.');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <form className="message-input-form" onSubmit={handleFormSubmit}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*,.pdf,.doc,.docx"
        onChange={handleFileUpload}
      />

      <button
        type="button"
        className="btn-attach-message"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading}
        title="Đính kèm tệp tin hoặc ảnh"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: uploading ? 'not-allowed' : 'pointer',
          padding: '8px',
          color: '#64748B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
        }}
      >
        {uploading ? <Loader2 size={18} className="fuf-spinner" /> : <Paperclip size={18} />}
      </button>

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
        disabled={disabled || !value.trim() || uploading}
        title="Gửi tin nhắn (Enter)"
      >
        <Send size={18} />
      </button>
    </form>
  );
};
