import React, { useState } from 'react';
import './CompanyLogo.css';

/**
 * Trích xuất chữ cái viết tắt từ tên công ty nếu không truyền initials riêng
 * Ví dụ: "VNG Corporation" -> "VNG", "FPT Software" -> "FPT", "Shopee Vietnam" -> "SV"
 */
const extractInitials = (name = '') => {
  if (!name) return 'DN';
  const clean = name.trim();

  // Kiểm tra các từ viết tắt hoa đầu tiên (VNG, FPT, MoMo, Tiki, Viettel)
  const words = clean.split(/\s+/);
  if (words.length === 1) {
    return clean.slice(0, 3).toUpperCase();
  }

  // Nếu từ đầu viết hoa toàn bộ (ví dụ VNG, FPT)
  if (words[0].length >= 2 && words[0] === words[0].toUpperCase()) {
    return words[0];
  }

  // Ghép chữ cái đầu của các từ
  return words.slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('');
};

/**
 * Component hiển thị Logo Công ty hoặc Avatar chữ viết tắt nền trung tính
 * Tuân thủ Hiến pháp dự án (bản quyền hình ảnh) và yêu cầu thiết kế
 *
 * @param {string|null} logoUrl - Đường dẫn ảnh logo thật khi có (tùy chọn)
 * @param {string} companyName - Tên công ty đầy đủ
 * @param {string} initials - Chữ viết tắt tùy chỉnh (ví dụ: "VNG", "FPT", "MM", "VT")
 * @param {number} size - Kích thước logo tính theo px (mặc định: 48)
 * @param {string} className - Class CSS mở rộng
 */
export const CompanyLogo = ({
  logoUrl = null,
  companyName = 'Công ty',
  initials,
  size = 48,
  className = '',
  style = {}
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const displayInitials = initials || extractInitials(companyName);
  const shouldShowImage = Boolean(logoUrl) && !imageFailed;

  const dimensionStyle = {
    width: `${size}px`,
    height: `${size}px`,
    minWidth: `${size}px`,
    minHeight: `${size}px`,
    fontSize: `${Math.max(12, Math.round(size * 0.32))}px`,
    ...style
  };

  return (
    <div
      className={`company-logo-container ${shouldShowImage ? 'has-image' : 'is-initials'} ${className}`}
      style={dimensionStyle}
      title={companyName}
      aria-label={`Logo của ${companyName}`}
    >
      {shouldShowImage ? (
        <img
          src={logoUrl}
          alt={`Logo ${companyName}`}
          className="company-logo-image"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="company-logo-initials">{displayInitials}</span>
      )}
    </div>
  );
};
