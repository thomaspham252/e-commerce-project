import { useState } from 'react';
import { simulateOrderStatus } from '../../services/paymentService';
import { FiSliders, FiCheckCircle, FiAlertTriangle, FiClock, FiXCircle, FiRefreshCw } from 'react-icons/fi';
import './PaymentDevSimulator.css';

/**
 * Thanh công cụ giả lập kiểm thử thanh toán (PaymentDevSimulator).
 * Cho phép lập trình viên và người kiểm thử chuyển đổi trạng thái đơn hàng ngay lập tức:
 * - Đã thanh toán (SUCCESS)
 * - Sai số tiền (WRONG_AMOUNT)
 * - Hết hạn (EXPIRED)
 * - Đã huỷ (CANCELLED)
 * - Đặt lại trạng thái Chờ (PENDING)
 *
 * @param {string} orderId - Mã đơn hàng đang được kiểm thử
 * @param {Function} onStatusUpdated - Callback sau khi trạng thái được cập nhật
 */
export const PaymentDevSimulator = ({ orderId, onStatusUpdated }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState('');

  const handleSimulate = async (targetStatus, customAmount = null) => {
    if (!orderId || loading) return;

    try {
      setLoading(true);
      setLastAction(targetStatus);
      const updated = await simulateOrderStatus(orderId, targetStatus, customAmount);
      if (onStatusUpdated) {
        onStatusUpdated(updated);
      }
    } catch (err) {
      alert(`Lỗi giả lập: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside
      className={`dev-simulator-panel ${isOpen ? 'open' : 'minimized'}`}
      aria-label="Bảng giả lập kịch bản thanh toán"
    >
      <div className="simulator-header" onClick={() => setIsOpen(!isOpen)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(!isOpen); } }}>
        <div className="header-left">
          <FiSliders className="simulator-icon" />
          <span className="simulator-title">Dev Simulator (Thử nghiệm)</span>
        </div>
        <button
          type="button"
          className="toggle-btn"
          aria-label={isOpen ? 'Thu nhỏ bảng giả lập' : 'Mở rộng bảng giả lập'}
        >
          {isOpen ? 'Thu nhỏ ▲' : 'Mở rộng ▼'}
        </button>
      </div>

      {isOpen && (
        <div className="simulator-body">
          <p className="simulator-desc">
            Chọn kịch bản mô phỏng SePay để kiểm tra luồng tự động chuyển màn hình:
          </p>

          <div className="simulator-actions">
            <button
              type="button"
              className="sim-btn success-btn"
              onClick={() => handleSimulate('SUCCESS')}
              disabled={loading}
            >
              <FiCheckCircle />
              <span>Giả lập: Đã thanh toán</span>
            </button>

            <button
              type="button"
              className="sim-btn wrong-btn"
              onClick={() => handleSimulate('WRONG_AMOUNT')}
              disabled={loading}
            >
              <FiAlertTriangle />
              <span>Giả lập: Sai số tiền</span>
            </button>

            <button
              type="button"
              className="sim-btn expire-btn"
              onClick={() => handleSimulate('EXPIRED')}
              disabled={loading}
            >
              <FiClock />
              <span>Giả lập: Hết hạn (00:00)</span>
            </button>

            <button
              type="button"
              className="sim-btn cancel-btn"
              onClick={() => handleSimulate('CANCELLED')}
              disabled={loading}
            >
              <FiXCircle />
              <span>Giả lập: Đã huỷ đơn</span>
            </button>

            <button
              type="button"
              className="sim-btn reset-btn"
              onClick={() => handleSimulate('PENDING')}
              disabled={loading}
            >
              <FiRefreshCw />
              <span>Reset về: Chờ thanh toán</span>
            </button>
          </div>

          {loading && <div className="sim-status">Đang gửi tín hiệu mô phỏng SePay...</div>}
          {lastAction && !loading && (
            <div className="sim-status-done">Đã kích hoạt: {lastAction}</div>
          )}
        </div>
      )}
    </aside>
  );
};
