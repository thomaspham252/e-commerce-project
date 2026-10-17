import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiChevronRight, FiCreditCard, FiClock, FiFileText } from 'react-icons/fi';
import { useEmployerPackage } from '../../context/EmployerPackageContext.jsx';
import { CurrentPackageCard } from '../../components/employer/CurrentPackageCard.jsx';
import { getTransactions } from '../../services/paymentService.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import './EmployerSubscriptionPage.css';

/**
 * Trang Gói Dịch Vụ Của Tôi (/employer/subscription).
 * Cho phép Nhà tuyển dụng theo dõi chi tiết gói hiện tại và lịch sử thanh toán mua gói.
 */
export const EmployerSubscriptionPage = () => {
  const navigate = useNavigate();
  const { subscription, loading: contextLoading } = useEmployerPackage();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    const fetchPackageOrders = async () => {
      try {
        setLoadingOrders(true);
        const res = await getTransactions({ orderType: 'EMPLOYER_PACKAGE', page: 1, pageSize: 20 });
        setOrders(res.data || []);
      } catch (err) {
        console.error('Lỗi khi tải lịch sử đơn mua gói:', err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchPackageOrders();
  }, []);

  const handleRenew = () => {
    navigate('/employer/pricing');
  };

  const handleUpgrade = () => {
    navigate('/employer/pricing');
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')} - ${d.getDate().toString().padStart(2, '0')}/${(
      d.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div className="employer-subscription-page">
      <div className="employer-subscription-container">
        {/* Breadcrumb */}
        <nav className="emp-breadcrumb" aria-label="Breadcrumb">
          <button
            type="button"
            className="emp-breadcrumb-link"
            onClick={() => navigate('/employer')}
          >
            <FiHome />
            <span>Kênh Nhà Tuyển Dụng</span>
          </button>
          <FiChevronRight className="breadcrumb-separator" />
          <span className="emp-breadcrumb-current">Gói Dịch Vụ Của Tôi</span>
        </nav>

        {/* Tiêu đề trang */}
        <div className="emp-sub-header">
          <h1 className="emp-sub-title">Gói Dịch Vụ Đang Sử Dụng</h1>
          <p className="emp-sub-desc">
            Theo dõi thời hạn, hạn mức tin đăng và các quyền lợi kết nối ứng viên của doanh nghiệp.
          </p>
        </div>

        {/* Thẻ gói hiện tại */}
        {contextLoading ? (
          <div className="emp-sub-loading">Đang tải thông tin gói cước...</div>
        ) : (
          <CurrentPackageCard
            subscription={subscription}
            onRenewClick={handleRenew}
            onUpgradeClick={handleUpgrade}
          />
        )}

        {/* Lịch sử các lần mua/gia hạn gói tuyển dụng */}
        <div className="emp-orders-history-section">
          <div className="orders-history-header">
            <h3>
              <FiCreditCard className="header-icon" /> Lịch Sử Đơn Mua Gói Tuyển Dụng
            </h3>
            <button
              type="button"
              className="btn-go-pricing"
              onClick={() => navigate('/employer/pricing')}
            >
              <span>Xem bảng giá các gói</span>
            </button>
          </div>

          {loadingOrders ? (
            <div className="emp-sub-loading">Đang tải lịch sử thanh toán...</div>
          ) : orders.length === 0 ? (
            <div className="emp-orders-empty">
              <FiFileText className="empty-icon" />
              <p>Chưa có lịch sử thanh toán đơn mua gói nào.</p>
            </div>
          ) : (
            <div className="emp-orders-table-wrap">
              <table className="emp-orders-table">
                <thead>
                  <tr>
                    <th>Mã đơn hàng</th>
                    <th>Thời gian</th>
                    <th>Gói dịch vụ</th>
                    <th className="text-right">Số tiền (VND)</th>
                    <th className="text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => (
                    <tr key={ord.orderId || ord.transactionId}>
                      <td className="cell-code">
                        <span className="code-pill">{ord.orderId}</span>
                      </td>
                      <td className="cell-time">
                        <div className="time-flex">
                          <FiClock />
                          <span>{formatDate(ord.createdAt)}</span>
                        </div>
                      </td>
                      <td>
                        <strong>{ord.serviceName || 'Gói Dịch Vụ NTD'}</strong>
                      </td>
                      <td className="text-right">
                        <strong className="amount-text">
                          {Number(ord.amount).toLocaleString('vi-VN')} ₫
                        </strong>
                      </td>
                      <td className="text-center">
                        <StatusBadge status={ord.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
