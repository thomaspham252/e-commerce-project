import { useState } from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { CopyButton } from '../common/CopyButton';
import { formatCurrencyVND } from '../../utils/formatCurrency';
import { FiX, FiInfo, FiTerminal } from 'react-icons/fi';
import './WebhookLogModal.css';

/**
 * Modal xem chi tiết giao dịch và bản tin Webhook SePay mẫu (WebhookLogModal).
 * Phục vụ Quản trị viên (Admin) đối soát kỹ thuật và kiểm tra dòng tiền.
 *
 * @param {boolean} isOpen - Trạng thái đóng/mở modal
 * @param {Function} onClose - Hàm đóng modal
 * @param {Object} data - Dữ liệu chi tiết { transaction, order, webhookLog }
 */
export const WebhookLogModal = ({ isOpen, onClose, data }) => {
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' hoặc 'webhook'

  if (!isOpen || !data) return null;

  const { transaction, order, webhookLog } = data;
  const jsonString = webhookLog?.rawPayload
    ? JSON.stringify(webhookLog.rawPayload, null, 2)
    : '{\n  "status": "NO_WEBHOOK_DATA"\n}';

  return (
    <div className="webhook-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="webhook-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="webhook-modal-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="webhook-modal-header">
          <div className="modal-title-block">
            <h3 id="webhook-modal-title" className="modal-main-title">
              Chi tiết giao dịch: {transaction.transactionId}
            </h3>
            <span className="modal-sub-order">Đơn hàng: {transaction.orderId}</span>
          </div>
          <div className="modal-header-right">
            <StatusBadge status={transaction.status} />
            <button
              type="button"
              className="btn-close-x"
              onClick={onClose}
              aria-label="Đóng cửa sổ chi tiết"
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* Tab chuyển đổi */}
        <div className="webhook-modal-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            <FiInfo /> Thông tin đối soát
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'webhook' ? 'active' : ''}`}
            onClick={() => setActiveTab('webhook')}
          >
            <FiTerminal /> Bản tin Webhook SePay (JSON)
          </button>
        </div>

        {/* Nội dung Tab */}
        <div className="webhook-modal-content">
          {activeTab === 'summary' ? (
            <div className="summary-tab-view">
              <div className="info-grid">
                <div className="info-box">
                  <span className="info-lbl">Khách hàng / Người nộp</span>
                  <span className="info-val bold">{transaction.userName}</span>
                  <span className="info-sub">{transaction.userEmail}</span>
                </div>
                <div className="info-box">
                  <span className="info-lbl">Loại giao dịch</span>
                  <span className="info-val bold">
                    {transaction.orderType === 'CANDIDATE_TOKEN'
                      ? 'Nạp Token Ứng viên'
                      : 'Mua Gói Tuyển Dụng'}
                  </span>
                  <span className="info-sub">{transaction.serviceName}</span>
                </div>
                <div className="info-box">
                  <span className="info-lbl">Số tiền cần thanh toán</span>
                  <span className="info-val bold">
                    {formatCurrencyVND(transaction.expectedAmount)}
                  </span>
                </div>
                <div className="info-box">
                  <span className="info-lbl">Số tiền thực tế nhận</span>
                  <span
                    className={`info-val bold ${
                      transaction.actualAmount !== transaction.expectedAmount &&
                      transaction.status === 'WRONG_AMOUNT'
                        ? 'text-danger'
                        : 'text-success'
                    }`}
                  >
                    {formatCurrencyVND(transaction.actualAmount)}
                  </span>
                </div>
                <div className="info-box">
                  <span className="info-lbl">Mã tham chiếu ngân hàng</span>
                  <span className="info-val mono">{transaction.referenceCode}</span>
                </div>
                <div className="info-box">
                  <span className="info-lbl">Thời gian ghi nhận</span>
                  <span className="info-val">
                    {transaction.receivedAt
                      ? new Date(transaction.receivedAt).toLocaleString('vi-VN')
                      : 'Chưa nhận tiền'}
                  </span>
                </div>
              </div>

              {order && (
                <div className="bank-recipient-box">
                  <h4 className="box-title">Tài khoản nhận tiền:</h4>
                  <p className="box-line">
                    Ngân hàng: <strong>{order.bankName}</strong> • Số TK:{' '}
                    <strong>{order.accountNumber}</strong> • Chủ TK:{' '}
                    <strong>{order.accountHolder}</strong>
                  </p>
                  <p className="box-line">
                    Nội dung đơn:{' '}
                    <code className="highlight-code">{order.transferContent}</code>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="webhook-tab-view">
              <div className="webhook-toolbar">
                <span className="payload-gateway-tag">
                  Cổng: {webhookLog?.gateway || 'SePay Webhook Engine'}
                </span>
                <CopyButton text={jsonString} label="Sao chép JSON" />
              </div>

              <div className="code-container">
                <pre className="json-pre">
                  <code>{jsonString}</code>
                </pre>
              </div>

              <p className="json-note">
                💡 Bản tin mô phỏng cấu trúc Payload chuẩn SePay Webhook đẩy vào API endpoint đối soát.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="webhook-modal-footer">
          <button type="button" className="btn-modal-close" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
