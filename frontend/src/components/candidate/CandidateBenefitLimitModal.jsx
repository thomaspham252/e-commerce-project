import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiCheckCircle, FiX, FiArrowRight, FiZap } from 'react-icons/fi';
import './CandidateBenefitLimitModal.css';

/**
 * Modal thông báo khóa quyền lợi tiện ích dành cho Ứng viên.
 * Xuất hiện khi ứng viên chưa mua combo hoặc đã hết hạn mức mà bấm vào tính năng có trong combo (nhắn tin NTD, AI score...).
 */
export const CandidateBenefitLimitModal = ({
  isOpen,
  onClose,
  title = 'Tính năng yêu cầu Combo Tiện Ích',
  featureName = 'Mở khóa liên hệ & Chat trực tiếp với Nhà tuyển dụng',
  description = 'Tính năng này nằm trong các gói combo tiện ích ứng tuyển ("Liên hệ nhanh" và "Toàn diện"). Vui lòng kích hoạt combo để kết nối trực tiếp với nhà tuyển dụng.',
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGoToPricing = () => {
    onClose();
    navigate('/ung-vien/vi-token?tab=fees');
  };

  return (
    <div className="cbl-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="cbl-modal" onClick={(e) => e.stopPropagation()}>
        <button className="cbl-close-btn" onClick={onClose} aria-label="Đóng">
          <FiX size={20} />
        </button>

        <div className="cbl-icon-wrap">
          <div className="cbl-icon-circle">
            <FiLock size={24} />
          </div>
        </div>

        <h3 className="cbl-title">{title}</h3>
        <p className="cbl-desc">{description}</p>

        <div className="cbl-benefits-preview">
          <div className="cbl-preview-header">
            <strong>Quyền lợi mở rộng khi kích hoạt combo:</strong>
          </div>
          <ul className="cbl-preview-list">
            <li>
              <FiCheckCircle size={15} className="cbl-check" />
              <span>Đẩy CV lên đầu danh sách tìm kiếm 72h</span>
            </li>
            <li>
              <FiCheckCircle size={15} className="cbl-check" />
              <span>Huy hiệu nổi bật thu hút nhà tuyển dụng</span>
            </li>
            <li>
              <FiCheckCircle size={15} className="cbl-check" />
              <span>Mở khóa liên hệ & nhắn tin trực tiếp tối đa 3 NTD</span>
            </li>
            <li>
              <FiCheckCircle size={15} className="cbl-check" />
              <span>Chỉ từ <strong>50 Token (50.000 đ)</strong></span>
            </li>
          </ul>
        </div>

        <div className="cbl-actions">
          <button type="button" className="cbl-btn-secondary" onClick={onClose}>
            Để sau
          </button>
          <button type="button" className="cbl-btn-primary" onClick={handleGoToPricing}>
            <span>Xem bảng giá tiện ích</span>
            <FiArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

