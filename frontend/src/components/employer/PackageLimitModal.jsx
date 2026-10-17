import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiAlertTriangle,
  FiX,
  FiArrowRight,
  FiShield,
  FiMessageSquare,
  FiBriefcase,
} from 'react-icons/fi';
import './PackageLimitModal.css';

/**
 * Modal dùng chung cảnh báo giới hạn gói cước Nhà tuyển dụng.
 * Tự động phân loại 3 kịch bản:
 * 1. LIMIT_REACHED: Đã đạt giới hạn số tin đăng tối đa
 * 2. PACKAGE_EXPIRED: Gói dịch vụ đã hết hạn
 * 3. NO_PERMISSION: Chưa kích hoạt tính năng Chat Realtime
 */
export const PackageLimitModal = ({
  isOpen = false,
  onClose,
  reason = 'LIMIT_REACHED',
  customTitle,
  customMessage,
  currentSubscription,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getModalContent = () => {
    switch (reason) {
      case 'PACKAGE_EXPIRED':
        return {
          title: customTitle || 'Gói Dịch Vụ Đã Hết Hạn',
          message:
            customMessage ||
            'Gói dịch vụ tuyển dụng của bạn đã kết thúc thời hạn sử dụng. Vui lòng gia hạn hoặc nâng cấp gói mới để tiếp tục đăng tin và quản lý ứng viên.',
          icon: <FiAlertTriangle className="modal-alert-icon text-red" />,
          badgeClass: 'badge-expired',
        };
      case 'NO_PERMISSION':
        return {
          title: customTitle || 'Tính Năng Chưa Được Kích Hoạt',
          message:
            customMessage ||
            'Gói dịch vụ hiện tại của bạn chưa bao gồm quyền Nhắn tin Realtime trực tiếp với ứng viên. Hãy nâng cấp lên Gói Tiêu Chuẩn hoặc Gói Chuyên Nghiệp để kết nối tức thì!',
          icon: <FiMessageSquare className="modal-alert-icon text-blue" />,
          badgeClass: 'badge-permission',
        };
      case 'LIMIT_REACHED':
      default:
        return {
          title: customTitle || 'Đạt Giới Hạn Đăng Tin Tuyển Dụng',
          message:
            customMessage ||
            `Bạn đã sử dụng hết ${currentSubscription?.usedJobPosts || 10}/${
              currentSubscription?.maxJobPosts || 10
            } lượt đăng tin của gói hiện tại. Vui lòng nâng cấp gói để tiếp tục tuyển dụng thêm vị trí mới.`,
          icon: <FiBriefcase className="modal-alert-icon text-amber" />,
          badgeClass: 'badge-limit',
        };
    }
  };

  const content = getModalContent();

  const handleGoPricing = () => {
    onClose?.();
    navigate('/employer/pricing');
  };

  return (
    <div className="pkg-modal-overlay" onClick={onClose}>
      <div
        className="pkg-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        id="package-limit-modal"
      >
        <button
          type="button"
          className="pkg-modal-close-btn"
          onClick={onClose}
          aria-label="Đóng hộp thoại"
        >
          <FiX />
        </button>

        <div className="pkg-modal-header">
          <div className={`pkg-modal-icon-badge ${content.badgeClass}`}>
            {content.icon}
          </div>
          <h3 className="pkg-modal-title">{content.title}</h3>
          <p className="pkg-modal-subtitle">{content.message}</p>
        </div>

        {currentSubscription && (
          <div className="pkg-modal-body">
            <div className="pkg-status-preview-box">
              <div className="preview-row">
                <span className="preview-label">Gói hiện tại:</span>
                <strong className="preview-value">{currentSubscription.packageName}</strong>
              </div>
              <div className="preview-row">
                <span className="preview-label">Hạn mức tin đăng:</span>
                <span className="preview-value">
                  <strong>{currentSubscription.usedJobPosts}</strong> /{' '}
                  {currentSubscription.maxJobPosts} tin
                </span>
              </div>
              <div className="preview-row">
                <span className="preview-label">Thời hạn còn lại:</span>
                <span className="preview-value">
                  <strong>{currentSubscription.remainingDays}</strong> ngày
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="pkg-modal-footer">
          <button
            type="button"
            className="pkg-modal-btn pkg-modal-btn--cancel"
            onClick={onClose}
          >
            Để sau
          </button>
          <button
            type="button"
            className="pkg-modal-btn pkg-modal-btn--upgrade"
            onClick={handleGoPricing}
            id="btn-modal-upgrade-package"
          >
            <span>Nâng cấp gói ngay</span>
            <FiArrowRight />
          </button>
        </div>

        <div className="pkg-modal-security-note">
          <FiShield className="inline-icon" /> Kích hoạt tự động ngay sau khi quét QR SePay
        </div>
      </div>
    </div>
  );
};
