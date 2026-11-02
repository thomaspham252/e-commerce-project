import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../common/StatusBadge.jsx';
import './DepositHistoryList.css';

/**
 * Danh sách Lịch sử nạp tiền ngân hàng VietQR SePay của ứng viên.
 * Định dạng ngày dd/mm/yyyy hh:mm, tiêu đề chữ thường, không viết hoa toàn bộ.
 */
export const DepositHistoryList = ({
  depositOrders = [],
  loading = false,
  onRefresh,
}) => {
  const navigate = useNavigate();

  const formatDateVN = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
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
          <h3 className="deposit-history-title">Lịch sử nạp tiền ngân hàng</h3>
          <p className="deposit-history-desc">
            Danh sách các đơn thanh toán chuyển khoản qua VietQR SePay.
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
          <h4>Chưa có đơn nạp tiền nào</h4>
          <p>Bạn chưa tạo đơn nạp tiền nào qua VietQR.</p>
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
                  <th>Gói nạp</th>
                  <th className="text-right">Số tiền (₫)</th>
                  <th className="text-center">Trạng thái</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {depositOrders.map((order) => (
                  <tr key={order.orderId || order.transactionId} className="deposit-history-row">
                    <td className="cell-code">
                      <span className="order-code-text">{order.orderId}</span>
                    </td>
                    <td className="cell-time">
                      <span className="deposit-time-text">{formatDateVN(order.createdAt)}</span>
                    </td>
                    <td className="cell-service">
                      <span className="service-name-text">
                        {order.serviceName || 'Nạp token ứng viên'}
                      </span>
                    </td>
                    <td className="text-right cell-amount">
                      <span className="deposit-amount-num">
                        {Number(order.amount).toLocaleString('vi-VN')} ₫
                      </span>
                    </td>
                    <td className="text-center">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="text-right">
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
                        {order.status === 'PENDING' ? 'Thanh toán' : 'Chi tiết'}
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
                <div className="deposit-mobile-top">
                  <span className="deposit-mobile-code">{order.orderId}</span>
                  <StatusBadge status={order.status} />
                </div>

                <div className="deposit-mobile-body">
                  <span className="deposit-mobile-service">{order.serviceName || 'Nạp token'}</span>
                  <span className="deposit-mobile-amount">
                    {Number(order.amount).toLocaleString('vi-VN')} ₫
                  </span>
                </div>

                <div className="deposit-mobile-footer">
                  <span className="deposit-mobile-time">{formatDateVN(order.createdAt)}</span>
                  <button
                    type="button"
                    className="deposit-btn-action"
                    onClick={() => handleAction(order)}
                  >
                    {order.status === 'PENDING' ? 'Thanh toán' : 'Chi tiết'}
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
