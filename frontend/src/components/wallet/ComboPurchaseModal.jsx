import React, { useState } from 'react';
import {
  FiX,
  FiCheckCircle,
  FiAlertTriangle,
  FiArrowRight,
  FiLoader,
} from 'react-icons/fi';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { formatVnd } from '../../constants/utilityCombosConfig.js';
import './ComboPurchaseModal.css';

/**
 * Modal xác nhận mua combo tiện ích ứng tuyển hoặc cảnh báo không đủ số dư token.
 * 
 * @param {object} props
 * @param {boolean} props.isOpen - Trạng thái mở/đóng modal
 * @param {object} props.combo - Thông tin gói combo đang chọn mua
 * @param {number} props.currentBalance - Số dư khả dụng hiện tại của ứng viên
 * @param {boolean} props.loading - Trạng thái đang gọi API backend
 * @param {Function} props.onClose - Hàm đóng modal
 * @param {Function} props.onConfirm - Hàm xác nhận mua combo
 * @param {Function} props.onNavigateDeposit - Hàm chuyển hướng sang tab Nạp token
 */
export const ComboPurchaseModal = ({
  isOpen,
  combo,
  currentBalance = 0,
  loading = false,
  onClose,
  onConfirm,
  onNavigateDeposit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !combo) {
    return null;
  }

  const cost = combo.priceToken || 0;
  const hasSufficient = currentBalance >= cost;
  const remainingBalance = hasSufficient ? currentBalance - cost : 0;
  const missingTokens = !hasSufficient ? cost - currentBalance : 0;
  const missingVnd = missingTokens * 1000;

  // Xử lý xác nhận với cơ chế chống bấm đúp
  const handleConfirmClick = async () => {
    if (isSubmitting || loading || !hasSufficient) {
      return;
    }
    try {
      setIsSubmitting(true);
      if (onConfirm) {
        await onConfirm(combo);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="combo-modal-backdrop" role="dialog" aria-modal="true">
      <div className="combo-modal-card">
        {/* Nút đóng */}
        <button
          type="button"
          className="combo-modal-btn-close"
          onClick={onClose}
          disabled={loading || isSubmitting}
          aria-label="Đóng hộp thoại"
        >
          <FiX />
        </button>

        {/* Header Modal */}
        <div className="combo-modal-header">
          <div className="combo-modal-icon-badge">
            <Sparkles size={18} />
          </div>
          <h3 className="combo-modal-title">
            {hasSufficient ? 'Xác nhận kích hoạt combo' : 'Số dư token không đủ'}
          </h3>
          <p className="combo-modal-subtitle">
            {hasSufficient
              ? `Bạn đang chuẩn bị kích hoạt gói combo "${combo.name}"`
              : `Gói "${combo.name}" yêu cầu nhiều token hơn số dư khả dụng hiện tại`}
          </p>
        </div>

        {/* Nội dung Modal */}
        <div className="combo-modal-body">
          {/* TRƯỜNG HỢP 1: ĐỦ SỐ DƯ -> HIỂN THỊ TÓM TẮT XÁC NHẬN */}
          {hasSufficient ? (
            <>
              {/* Tóm tắt quyền lợi sẽ nhận */}
              <div className="combo-modal-benefits-box">
                <span className="box-section-label">Quyền lợi kích hoạt:</span>
                <ul className="combo-modal-benefits-list">
                  {combo.benefits &&
                    combo.benefits.map((b, idx) => (
                      <li key={idx} className="combo-modal-benefit-item">
                        <CheckCircle2 size={16} className="modal-benefit-icon" />
                        <span>{b}</span>
                      </li>
                    ))}
                </ul>
              </div>

              {/* Bảng chi tiết biến động số dư */}
              <div className="combo-modal-balance-summary">
                <div className="summary-row">
                  <span className="summary-label">Chi phí gói:</span>
                  <span className="summary-value summary-value--cost">
                    -{cost} Token ({formatVnd(cost * 1000)})
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Số dư hiện tại:</span>
                  <span className="summary-value">{currentBalance} Token</span>
                </div>
                <div className="summary-divider" />
                <div className="summary-row summary-row--highlight">
                  <span className="summary-label">Số dư còn lại:</span>
                  <span className="summary-value summary-value--remaining">
                    {remainingBalance} Token
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* TRƯỜNG HỢP 2: THIẾU SỐ DƯ -> HIỂN THỊ CẢNH BÁO & LỐI TẮT NẠP TIỀN */
            <div className="combo-modal-insufficient-box">
              <div className="insufficient-alert-banner">
                <FiAlertTriangle className="alert-icon" />
                <div>
                  <h4 className="alert-heading">Không đủ token thanh toán</h4>
                  <p className="alert-desc">
                    Bạn cần bổ sung thêm token vào tài khoản để hoàn tất kích hoạt combo này.
                  </p>
                </div>
              </div>

              <div className="combo-modal-balance-summary">
                <div className="summary-row">
                  <span className="summary-label">Chi phí gói:</span>
                  <span className="summary-value">{cost} Token</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Số dư hiện có:</span>
                  <span className="summary-value">{currentBalance} Token</span>
                </div>
                <div className="summary-divider" />
                <div className="summary-row summary-row--danger">
                  <span className="summary-label">Còn thiếu:</span>
                  <span className="summary-value summary-value--missing">
                    {missingTokens} Token ({formatVnd(missingVnd)})
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer thao tác */}
        <div className="combo-modal-footer">
          {hasSufficient ? (
            <>
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={onClose}
                disabled={loading || isSubmitting}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn-modal-confirm"
                onClick={handleConfirmClick}
                disabled={loading || isSubmitting}
              >
                {loading || isSubmitting ? (
                  <>
                    <FiLoader className="icon-spin" />
                    <span>Đang kích hoạt...</span>
                  </>
                ) : (
                  <>
                    <FiCheckCircle />
                    <span>Xác nhận mua (-{cost} Token)</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={onClose}
              >
                Đóng
              </button>
              <button
                type="button"
                className="btn-modal-deposit"
                onClick={() => {
                  onClose();
                  if (onNavigateDeposit) {
                    onNavigateDeposit();
                  }
                }}
              >
                <span>Nạp thêm token ngay</span>
                <FiArrowRight />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

