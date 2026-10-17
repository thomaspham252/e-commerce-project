import React, { useEffect } from 'react';
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiX,
  FiMinusCircle,
  FiPlusCircle,
  FiArrowRight,
  FiShield,
} from 'react-icons/fi';
import { Coins } from 'lucide-react';
import './TokenConsumeModal.css';

/**
 * Modal xác nhận trừ token dùng chung cho toàn bộ ứng dụng.
 * Tự động kiểm tra tính toán:
 * - Đủ số dư: Hiển thị "Trừ X token, số dư còn Y" và cho phép bấm xác nhận.
 * - Thiếu số dư: Khóa nút xác nhận, hiển thị cảnh báo thiếu token và nút dẫn tới trang nạp.
 */
export const TokenConsumeModal = ({
  isOpen = false,
  onClose,
  onConfirm,
  featureName = 'Tính năng sử dụng',
  featureDescription = '',
  tokenCost = 0,
  currentBalance = 0,
  onNavigateDeposit,
  loading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const isSufficient = currentBalance >= tokenCost;
  const remainingBalance = Math.max(0, currentBalance - tokenCost);
  const missingTokens = Math.max(0, tokenCost - currentBalance);

  return (
    <div className="token-modal-overlay" onClick={!loading ? onClose : undefined}>
      <div
        className="token-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        id="token-consume-modal"
      >
        <button
          type="button"
          className="token-modal-close-btn"
          onClick={onClose}
          disabled={loading}
          aria-label="Đóng hộp thoại"
        >
          <FiX />
        </button>

        <div className="token-modal-header">
          <div
            className={`token-modal-icon-badge ${
              isSufficient ? 'token-modal-icon-badge--confirm' : 'token-modal-icon-badge--warning'
            }`}
          >
            {isSufficient ? (
              <Coins className="token-modal-icon" />
            ) : (
              <FiAlertTriangle className="token-modal-icon" />
            )}
          </div>
          <h3 className="token-modal-title">
            {isSufficient ? 'Xác Nhận Sử Dụng Tính Năng' : 'Số Dư Token Không Đủ'}
          </h3>
          <p className="token-modal-subtitle">
            {isSufficient
              ? 'Vui lòng kiểm tra kỹ chi phí token trước khi kích hoạt tiện ích.'
              : 'Bạn cần nạp thêm token để có thể mở khóa và sử dụng tính năng này.'}
          </p>
        </div>

        <div className="token-modal-content">
          <div className="token-modal-feature-box">
            <span className="token-modal-feature-label">Tính năng yêu cầu:</span>
            <h4 className="token-modal-feature-name">{featureName}</h4>
            {featureDescription && (
              <p className="token-modal-feature-desc">{featureDescription}</p>
            )}
          </div>

          <div className="token-modal-calculation">
            <div className="token-calc-row">
              <span className="token-calc-label">Số dư hiện tại:</span>
              <span className="token-calc-value">
                <strong>{currentBalance.toLocaleString('vi-VN')}</strong> Token
              </span>
            </div>

            <div className="token-calc-row token-calc-row--cost">
              <span className="token-calc-label">
                <FiMinusCircle className="text-red inline-icon" /> Token cần trừ:
              </span>
              <span className="token-calc-value text-red">
                <strong>-{tokenCost.toLocaleString('vi-VN')}</strong> Token
              </span>
            </div>

            <div className="token-calc-divider" />

            {isSufficient ? (
              <div className="token-calc-row token-calc-row--remaining">
                <span className="token-calc-label">
                  <FiCheckCircle className="text-green inline-icon" /> Số dư còn lại sau khi trừ:
                </span>
                <span className="token-calc-value text-green">
                  <strong>{remainingBalance.toLocaleString('vi-VN')}</strong> Token
                </span>
              </div>
            ) : (
              <div className="token-calc-warning-box">
                <div className="token-calc-warning-text">
                  <span>Còn thiếu:</span>
                  <strong className="text-red">
                    {missingTokens.toLocaleString('vi-VN')} Token
                  </strong>
                </div>
                <p className="token-calc-warning-desc">
                  Số dư hiện tại không đủ để hoàn tất thao tác. Vui lòng nạp thêm token vào ví.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="token-modal-footer">
          {isSufficient ? (
            <>
              <button
                type="button"
                className="token-modal-btn token-modal-btn--cancel"
                onClick={onClose}
                disabled={loading}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="token-modal-btn token-modal-btn--confirm"
                onClick={onConfirm}
                disabled={loading}
                id="btn-confirm-consume-token"
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận trừ Token'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="token-modal-btn token-modal-btn--cancel"
                onClick={onClose}
              >
                Để sau
              </button>
              <button
                type="button"
                className="token-modal-btn token-modal-btn--deposit"
                onClick={() => {
                  onClose?.();
                  onNavigateDeposit?.();
                }}
                id="btn-modal-go-deposit"
              >
                <FiPlusCircle />
                <span>Nạp Token ngay</span>
                <FiArrowRight />
              </button>
            </>
          )}
        </div>

        <div className="token-modal-security-note">
          <FiShield className="inline-icon" /> Thao tác trừ token an toàn • Có thể kiểm tra tại tab Lịch sử biến động
        </div>
      </div>
    </div>
  );
};
