import React from 'react';
import { FiCheck, FiX, FiZap, FiArrowRight, FiShield, FiMessageSquare } from 'react-icons/fi';
import { Sparkles, Briefcase } from 'lucide-react';
import './EmployerPackageCard.css';

/**
 * Thẻ hiển thị gói cước dịch vụ dành cho Nhà tuyển dụng.
 * Thiết kế so sánh tính năng trực quan, nhận biết gói hiện tại và gói phổ biến.
 */
export const EmployerPackageCard = ({
  pkg,
  isCurrentPackage = false,
  onSelectPackage,
  loading = false,
}) => {
  const isPopular = pkg.isPopular;

  return (
    <div
      className={`employer-package-card ${
        isCurrentPackage ? 'employer-package-card--current' : ''
      } ${isPopular ? 'employer-package-card--popular' : ''}`}
      id={`emp-package-${pkg.id}`}
    >
      {/* Huy hiệu trên cùng */}
      {isCurrentPackage ? (
        <div className="emp-pkg-badge emp-pkg-badge--current">
          <FiShield size={13} /> Đang sử dụng
        </div>
      ) : isPopular ? (
        <div className="emp-pkg-badge emp-pkg-badge--popular">
          <Sparkles size={13} /> {pkg.badge || 'Phổ biến nhất ⭐'}
        </div>
      ) : pkg.badge ? (
        <div className="emp-pkg-badge emp-pkg-badge--custom">
          {pkg.badge}
        </div>
      ) : null}

      <div className="emp-pkg-card-top">
        <h3 className="emp-pkg-name">{pkg.name}</h3>
        <p className="emp-pkg-desc">{pkg.description}</p>
      </div>

      <div className="emp-pkg-price-row">
        <div className="emp-pkg-price">
          <span className="emp-pkg-price-number">
            {pkg.priceVND.toLocaleString('vi-VN')}
          </span>
          <span className="emp-pkg-currency">₫</span>
        </div>
        <span className="emp-pkg-period">/ {pkg.durationDays} ngày</span>
      </div>

      <div className="emp-pkg-highlights">
        <div className="emp-highlight-item">
          <Briefcase className="emp-highlight-icon" />
          <span>Đăng tối đa <strong>{pkg.maxJobPosts} tin</strong> tuyển dụng</span>
        </div>
        <div className="emp-highlight-item">
          <FiMessageSquare className="emp-highlight-icon" />
          <span>
            Chat Realtime ứng viên:{' '}
            {pkg.allowRealtimeChat ? (
              <strong className="text-success">Có hỗ trợ</strong>
            ) : (
              <span className="text-muted">Không hỗ trợ</span>
            )}
          </span>
        </div>
      </div>

      <div className="emp-pkg-features-list">
        <span className="emp-features-title">Quyền lợi chi tiết:</span>
        <ul>
          {pkg.features?.map((feature, idx) => (
            <li key={idx} className="emp-feature-item">
              <FiCheck className="feature-check-icon" />
              <span>{feature}</span>
            </li>
          ))}
          {!pkg.allowRealtimeChat && (
            <li className="emp-feature-item text-muted">
              <FiX className="feature-x-icon" />
              <span>Chưa hỗ trợ Nhắn tin Realtime</span>
            </li>
          )}
        </ul>
      </div>

      <div className="emp-pkg-card-footer">
        <button
          type="button"
          className={`emp-pkg-btn-action ${
            isCurrentPackage ? 'emp-pkg-btn-action--renew' : 'emp-pkg-btn-action--upgrade'
          }`}
          onClick={() => onSelectPackage?.(pkg)}
          disabled={loading}
          id={`btn-buy-pkg-${pkg.id}`}
        >
          <span>{isCurrentPackage ? 'Gia hạn gói này' : 'Nâng cấp gói ngay'}</span>
          <FiArrowRight />
        </button>
      </div>
    </div>
  );
};
