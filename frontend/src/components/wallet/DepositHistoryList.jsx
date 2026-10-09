import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiClock,
  FiExternalLink,
  FiCreditCard,
  FiAlertCircle,
  FiCheckCircle,
} from 'react-icons/fi';
import { StatusBadge } from '../common/StatusBadge.jsx';
import './DepositHistoryList.css';

/**
 * Danh sách Lịch sử các lần nạp tiền ngân hàng VietQR SePay của ứng viên.
 * Hiển thị mã đơn, số tiền VND, trạng thái (StatusBadge) và nút chuyển nhanh tới trang thanh toán/kết quả.
 */
export const DepositHistoryList = ({
  depositOrders = [],
  loading = false,
  onRefresh,
}) => {
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')} - ${d.getDate().toString().padStart(2, '0')}/${(
      d.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${d.getFullYear()}`;
  };

  const handleAction = (order) => {
    if (order.status === 'PENDING') {
      navigate(`/thanh-toan/${order.orderId}`);
    } else {
      navigate(`/thanh-toan/ket-qua/${order.orderId}`);
    }
  };

  return (
    <div className="deposit-history-container">
      <div className="deposit-history-header">
        <div>
          <h3 className="deposit-history-title">Lịch Sử Nạp Tiền Ngân Hàng</h3>
          <p className="deposit-history-desc">
            Theo dõi danh sách các đơn thanh toán quét mã VietQR SePay đã tạo trên hệ thống.
          </p>
        </div>
        {onRefresh && (
          <button
            type="button"
            className="deposit-history-btn-refresh"
            onClick={onRefresh}
            disabled={loading}
          >
            Làm mới
          </button>
        )}
      </div>

      {loading ? (
        <div className="deposit-history-empty">
          <p>Đang tải lịch sử các đơn nạp tiền...</p>
        </div>
      ) : depositOrders.length === 0 ? (
        <div className="deposit-history-empty">
          <FiCreditCard className="empty-icon" />
          <h4>Chưa có đơn nạp tiền nào</h4>
          <p>Bạn chưa thực hiện đơn nạp tiền ngân hàng nào qua VietQR.</p>
        </div>
      ) : (
        <>
          {/* Bảng trên Desktop / Tablet */}
          <div className="deposit-history-table-wrap">
            <table className="deposit-history-table">
              <thead>
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Thời gian tạo</th>
                  <th>Gói nạp & Dịch vụ</th>
                  <th className="text-right">Số tiền nạp (VND)</th>
                  <th className="text-center">Trạng thái</th>
                  <th className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {depositOrders.map((order) => (
                  <tr key={order.orderId || order.transactionId} className="deposit-history-row">
                    <td className="cell-code">
                      <span className="order-code-badge">{order.orderId}</span>
                    </td>
                    <td className="cell-time">
                      <div className="deposit-time-box">
                        <FiClock className="time-icon" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </td>
                    <td className="cell-service">
                      <strong className="service-name-text">
                        {order.serviceName || 'Nạp Token Ứng viên'}
                      </strong>
                    </td>
                    <td className="text-right cell-amount">
                      <span className="deposit-amount-highlight">
                        {Number(order.amount).toLocaleString('vi-VN')} ₫
                      </span>
                    </td>
                    <td className="text-center">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className={`deposit-btn-action ${
                          order.status === 'PENDING'
                            ? 'deposit-btn-action--pay'
                            : 'deposit-btn-action--view'
                        }`}
                        onClick={() => handleAction(order)}
                        id={`btn-view-order-${order.orderId}`}
                      >
                        <span>
                          {order.status === 'PENDING' ? 'Thanh toán' : 'Chi tiết'}
                        </span>
                        <FiExternalLink />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Dạng thẻ trên Mobile (<= 640px) */}
          <div className="deposit-history-cards-mobile">
            {depositOrders.map((order) => (
              <div key={order.orderId || order.transactionId} className="deposit-history-card-mobile">
                <div className="deposit-card-top">
                  <span className="order-code-badge">{order.orderId}</span>
                  <StatusBadge status={order.status} />
                </div>

                <div className="deposit-card-body">
                  <h5 className="deposit-card-title">{order.serviceName}</h5>
                  <div className="deposit-card-amount">
                    <span>Số tiền:</span>
                    <strong>{Number(order.amount).toLocaleString('vi-VN')} ₫</strong>
                  </div>
                </div>

                <div className="deposit-card-footer">
                  <span className="deposit-card-time">
                    <FiClock className="time-icon" />
                    {formatDate(order.createdAt)}
                  </span>

                  <button
                    type="button"
                    className={`deposit-btn-action ${
                      order.status === 'PENDING'
                        ? 'deposit-btn-action--pay'
                        : 'deposit-btn-action--view'
                    }`}
                    onClick={() => handleAction(order)}
                  >
                    <span>{order.status === 'PENDING' ? 'Thanh toán' : 'Xem đơn'}</span>
                    <FiExternalLink />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
