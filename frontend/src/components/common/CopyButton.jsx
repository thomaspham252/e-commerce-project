import { useState } from 'react';
import { copyToClipboard } from '../../utils/clipboard';
import { FiCopy, FiCheck } from 'react-icons/fi';
import './CopyButton.css';

/**
 * Component nút sao chép (CopyButton) tái sử dụng.
 * Phản hồi trực quan tức thì (< 300ms) chuyển sang biểu tượng check và thông báo "Đã sao chép".
 *
 * @param {string} text - Đoạn văn bản cần sao chép vào clipboard
 * @param {string} label - Nhãn hiển thị đi kèm (tuỳ chọn)
 * @param {string} className - Class CSS tuỳ biến bổ sung
 */
export const CopyButton = ({ text, label = 'Sao chép', className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    if (!text) return;

    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`copy-btn ${copied ? 'copied' : ''} ${className}`}
      title={copied ? 'Đã sao chép vào bộ nhớ tạm!' : `Sao chép: ${text}`}
      aria-label={label}
    >
      {copied ? (
        <>
          <FiCheck className="copy-icon check-icon" />
          <span className="copy-text">Đã sao chép</span>
        </>
      ) : (
        <>
          <FiCopy className="copy-icon" />
          {label && <span className="copy-text">{label}</span>}
        </>
      )}
    </button>
  );
};
