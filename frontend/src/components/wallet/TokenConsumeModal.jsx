import React, { useEffect } from 'react';
import {
  FiAlertTriangle,
  FiX,
  FiShield,
} from 'react-icons/fi';
import './TokenConsumeModal.css';

/**
 * Modal xác nhận trừ token dùng chung.
 * Tự động kiểm tra tính toán:
 * - Đủ số dư: Hiển thị chi phí và số dư còn lại sau khi trừ.
 * - Thiếu số dư: Cảnh báo số token còn thiếu và dẫn tới nạp token.
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
        aria-labelledby="token-modal-title"
        id="token-consume-modal"
      >
        <button
          type="button"
          className="token-modal-close-btn"
          onClick={onClose}
          disabled={loading}
          aria-label="Đóng"
        >
          <FiX />
        </button>

        <div className="token-modal-header">
          {!isSufficient && (
            <div className="token-modal-icon-badge token-modal-icon-badge--warning">
              <FiAlertTriangle className="token-modal-icon" />
            </div>
          )}
          <h3 className="token-modal-title" id="token-modal-title">
            {isSufficient ? 'Xác nhận sử dụng tính năng' : 'Số dư token không đủ'}
          </h3>
          <p className="token-modal-subtitle">
            {isSufficient
              ? 'Kiểm tra thông tin chi phí trước khi kích hoạt.'
              : 'Số dư hiện tại không đủ để sử dụng tính năng này.'}
          </p>
        </div>

        <div className="token-modal-content">
          <div className="token-modal-feature-box">
            <span className="token-modal-feature-label">Tính năng:</span>
            <h4 className="token-modal-feature-name">{featureName}</h4>
            {featureDescription && (
              <p className="token-modal-feature-desc">{featureDescription}</p>
            )}
          </div>

          <div className="token-modal-calculation">
            <div className="token-calc-row">
              <span className="token-calc-label">Số dư hiện tại:</span>
              <span className="token-calc-value">
                <strong>{currentBalance.toLocaleString('vi-VN')}</strong> token
              </span>
            </div>

            <div className="token-calc-row token-calc-row--cost">
              <span className="token-calc-label">Token cần trừ:</span>
              <span className="token-calc-value text-red">
                <strong>-{tokenCost.toLocaleString('vi-VN')}</strong> token
              </span>
            </div>

            <div className="token-calc-divider" />

            {isSufficient ? (
              <div className="token-calc-row token-calc-row--remaining">
                <span className="token-calc-label">Số dư còn lại:</span>
                <span className="token-calc-value text-green">
                  <strong>{remainingBalance.toLocaleString('vi-VN')}</strong> token
                </span>
              </div>
            ) : (
              <div className="token-calc-warning-box">
                <div className="token-calc-warning-text">
                  <span>Còn thiếu:</span>
                  <strong className="text-red">
                    {missingTokens.toLocaleString('vi-VN')} token
                  </strong>
                </div>
                <p className="token-calc-warning-desc">
                  Vui lòng nạp thêm token vào ví để tiếp tục.
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
                {loading ? 'Đang xử lý...' : 'Xác nhận'}
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
                Nạp thêm token
              </button>
            </>
          )}
        </div>

        <div className="token-modal-security-note">
          <FiShield className="inline-icon" /> Giao dịch được ghi nhận tự động vào lịch sử biến động token
        </div>
      </div>
    </div>
  );
};
