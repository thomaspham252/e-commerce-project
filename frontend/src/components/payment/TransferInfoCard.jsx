import { CopyButton } from '../common/CopyButton';
import { formatCurrencyVND } from '../../utils/formatCurrency';
import { FiAlertTriangle, FiInfo } from 'react-icons/fi';
import './TransferInfoCard.css';

/**
 * Component hiển thị chi tiết thông tin chuyển khoản ngân hàng (TransferInfoCard).
 * Tích hợp sẵn nút sao chép nhanh cho:
 * 1. Số tài khoản nhận tiền
 * 2. Số tiền chuyển khoản
 * 3. Nội dung chuyển khoản chuẩn hóa chứa mã đơn
 *
 * @param {Object} order - Đối tượng đơn thanh toán (PaymentOrder)
 */
export const TransferInfoCard = ({ order }) => {
  if (!order) return null;

  return (
    <div className="transfer-info-card">
      <div className="transfer-card-header">
        <h3 className="transfer-card-title">Thông tin chuyển khoản</h3>
        <span className="transfer-order-code">Mã đơn: {order.orderId}</span>
      </div>

      <div className="transfer-rows">
        {/* Tên ngân hàng */}
        <div className="transfer-row">
          <span className="transfer-label">Ngân hàng thụ hưởng</span>
          <div className="transfer-value-box">
            <span className="transfer-value-text highlight-bank">{order.bankName}</span>
          </div>
        </div>

        {/* Số tài khoản */}
        <div className="transfer-row">
          <span className="transfer-label">Số tài khoản</span>
          <div className="transfer-value-box">
            <span className="transfer-value-text mono bold">{order.accountNumber}</span>
            <CopyButton text={order.accountNumber} label="Sao chép" />
          </div>
        </div>

        {/* Chủ tài khoản */}
        <div className="transfer-row">
          <span className="transfer-label">Chủ tài khoản</span>
          <div className="transfer-value-box">
            <span className="transfer-value-text bold uppercase">{order.accountHolder}</span>
          </div>
        </div>

        {/* Số tiền */}
        <div className="transfer-row">
          <span className="transfer-label">Số tiền cần chuyển</span>
          <div className="transfer-value-box">
            <span className="transfer-value-text amount-text">
              {formatCurrencyVND(order.amount)}
            </span>
            <CopyButton text={String(order.amount)} label="Sao chép" />
          </div>
        </div>

        {/* Nội dung chuyển khoản */}
        <div className="transfer-row highlight-row">
          <div className="transfer-label-with-tip">
            <span className="transfer-label">Nội dung chuyển khoản</span>
            <span className="transfer-required-badge">Bắt buộc chính xác</span>
          </div>
          <div className="transfer-value-box">
            <span className="transfer-value-text transfer-code mono bold">
              {order.transferContent}
            </span>
            <CopyButton text={order.transferContent} label="Sao chép" />
          </div>
        </div>
      </div>

      {/* Cảnh báo lưu ý quan trọng */}
      <div className="transfer-alert-box">
        <FiAlertTriangle className="transfer-alert-icon" />
        <div className="transfer-alert-content">
          <p className="transfer-alert-title">Lưu ý quan trọng:</p>
          <p className="transfer-alert-desc">
            Vui lòng nhập <strong>chính xác tuyệt đối</strong> nội dung chuyển khoản{' '}
            <code className="inline-code">{order.transferContent}</code> để hệ thống tự động kích
            hoạt dịch vụ ngay lập tức.
          </p>
        </div>
      </div>

      <div className="transfer-help-tip">
        <FiInfo className="tip-icon" />
        <span>Nếu bạn chuyển sai số tiền hoặc sai nội dung, giao dịch sẽ cần hỗ trợ thủ công.</span>
      </div>
    </div>
  );
};
