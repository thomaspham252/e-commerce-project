import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiShield,
  FiZap,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiArrowRight,
} from 'react-icons/fi';
import { Sparkles } from 'lucide-react';

import { useEmployerPackage } from '../../context/EmployerPackageContext.jsx';
import { createPaymentOrder } from '../../services/paymentService.js';
import { getAuthSession } from '../../services/apiClient.js';
import { EmployerPackageCard } from '../../components/employer/EmployerPackageCard.jsx';

import './EmployerPricingPage.css';

/**
 * Trang Bảng giá Gói Dịch vụ Nhà tuyển dụng (/employer/pricing).
 * Hiển thị các gói đăng tin, quyền chat realtime và kết nối thanh toán VietQR SePay.
 */
export const EmployerPricingPage = () => {
  const navigate = useNavigate();
  const { subscription, packages, loading: contextLoading } = useEmployerPackage();

  const [loadingOrder, setLoadingOrder] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleSelectPackage = async (pkg) => {
    try {
      setLoadingOrder(true);
      const isSamePackage = subscription?.packageId === pkg.id;
      const orderActionName = isSamePackage ? 'Gia hạn' : 'Nâng cấp';

      const session = getAuthSession();
      const order = await createPaymentOrder({
        orderType: 'SUBSCRIPTION',
        packageId: pkg.id, // id thật của gói trong bảng packages
        serviceName: `${orderActionName} ${pkg.name} (${pkg.durationDays} ngày)`,
        amount: pkg.priceVND,
        userId: session?.id,
        userName: subscription?.companyName || session?.email,
        userEmail: session?.email,
        userRole: 'employer',
      });

      showToast(`Đã tạo đơn ${order.orderId}. Đang chuyển sang trang quét mã VietQR...`, 'success');
      setTimeout(() => {
        navigate(`/thanh-toan/${order.orderId}`);
      }, 700);
    } catch (err) {
      console.error('Lỗi khi tạo đơn mua gói tuyển dụng:', err);
      showToast('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.', 'error');
      setLoadingOrder(false);
    }
  };

  return (
    <div className="employer-pricing-page">
      {toastMessage && (
        <div className={`emp-toast-banner emp-toast-banner--${toastMessage.type}`}>
          {toastMessage.type === 'success' ? (
            <FiCheckCircle className="toast-icon" />
          ) : (
            <FiAlertCircle className="toast-icon" />
          )}
          <span>{toastMessage.message}</span>
        </div>
      )}

      <div className="employer-pricing-container">
        {/* Tiêu đề trang */}
        <div className="employer-pricing-header">
          <div className="emp-pricing-badge">
            <Sparkles size={14} /> Gói Tuyển Dụng Doanh Nghiệp
          </div>
          <h1 className="employer-pricing-title">Bảng Giá Gói Dịch Vụ Tuyển Dụng</h1>
          <p className="employer-pricing-subtitle">
            Gia tăng hiệu quả tuyển mộ nhân tài với vị trí hiển thị nổi bật, tăng hạn mức đăng tin và tính năng Chat Realtime trực tiếp với ứng viên.
          </p>
        </div>

        {/* Thông báo tình trạng gói hiện tại của công ty */}
        {subscription && (
          <div className="emp-current-plan-banner">
            <div className="emp-current-plan-info">
              <FiShield className="plan-banner-icon" />
              <div>
                <span className="plan-banner-label">
                  {subscription.status === 'ACTIVE'
                    ? 'Gói dịch vụ đang kích hoạt:'
                    : subscription.status === 'EXPIRED'
                      ? 'Gói đã hết hạn:'
                      : 'Bạn đang dùng:'}
                </span>
                <strong className="plan-banner-name"> {subscription.packageName}</strong>
                <span className="plan-banner-details">
                  {subscription.status === 'ACTIVE' && (
                    <>{' '}• Còn <strong>{subscription.remainingDays} ngày</strong> sử dụng</>
                  )}
                  {' '}• Đã đăng{' '}
                  <strong>
                    {subscription.usedJobPosts}/{subscription.maxJobPosts ?? '∞'} tin
                  </strong>
                </span>
              </div>
            </div>
            <button
              type="button"
              className="btn-view-subscription"
              onClick={() => navigate('/employer/subscription')}
            >
              <span>Chi tiết gói</span>
              <FiArrowRight />
            </button>
          </div>
        )}

        {/* Lưới các gói dịch vụ */}
        <div className="employer-packages-grid">
          {packages.map((pkg) => (
            <EmployerPackageCard
              key={pkg.id}
              pkg={pkg}
              isCurrentPackage={subscription?.status === 'ACTIVE' && subscription?.packageId === pkg.id}
              onSelectPackage={handleSelectPackage}
              loading={loadingOrder || contextLoading}
            />
          ))}
        </div>

        {/* Chính sách và câu hỏi thường gặp */}
        <div className="emp-pricing-policy-section">
          <div className="policy-box">
            <FiZap className="policy-box-icon text-amber" />
            <div>
              <h4>Kích Hoạt Tự Động Tức Thì</h4>
              <p>Hệ thống tự động kích hoạt gói và tăng hạn mức đăng tin ngay sau khi bạn quét mã VietQR SePay thành công.</p>
            </div>
          </div>

          <div className="policy-box">
            <FiInfo className="policy-box-icon text-blue" />
            <div>
              <h4>Quy Tắc Gia Hạn & Nâng Cấp</h4>
              <p>Mua thêm gói khi gói hiện tại còn hạn: gói mới tự động bắt đầu ngay khi gói hiện tại kết thúc. Hạn mức tin đăng tính riêng theo từng gói. Chưa mua gói được đăng miễn phí 3 tin.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
