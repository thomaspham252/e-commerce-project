import React from 'react';
import {
  FiShield,
  FiClock,
  FiCalendar,
  FiCheckCircle,
  FiArrowUpRight,
  FiRefreshCw,
  FiBriefcase,
} from 'react-icons/fi';
import './CurrentPackageCard.css';

/**
 * Thẻ hiển thị chi tiết gói dịch vụ đang hoạt động của Nhà tuyển dụng.
 * Có thanh tiến độ sử dụng tin đăng, đếm ngược số ngày còn lại và nút gia hạn / nâng cấp.
 */
export const CurrentPackageCard = ({
  subscription,
  onRenewClick,
  onUpgradeClick,
}) => {
  if (!subscription) return null;

  const used = subscription.usedJobPosts || 0;
  const max = subscription.maxJobPosts || 1;
  const percent = Math.min(100, Math.round((used / max) * 100));
  const remainingPosts = Math.max(0, max - used);

  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getFullYear()}`;
  };

  const isExpired = subscription.status === 'EXPIRED' || subscription.remainingDays <= 0;

  return (
    <div className="current-package-card">
      <div className="current-pkg-top">
        <div className="current-pkg-header-info">
          <div className="current-pkg-badge-row">
            <span
              className={`current-pkg-status-badge ${
                isExpired ? 'status-badge--expired' : 'status-badge--active'
              }`}
            >
              <FiShield /> {isExpired ? 'Gói đã hết hạn' : 'Đang hoạt động'}
            </span>
            <span className="current-pkg-code">Mã: {subscription.subscriptionId}</span>
          </div>

          <h2 className="current-pkg-title">{subscription.packageName}</h2>
          <span className="current-pkg-company">Doanh nghiệp: {subscription.companyName}</span>
        </div>

        <div className="current-pkg-days-box">
          <div className="days-counter">
            <span className="days-number">{subscription.remainingDays}</span>
            <span className="days-unit">ngày còn lại</span>
          </div>
          <div className="days-date-range">
            <span>
              <FiCalendar /> {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
            </span>
          </div>
        </div>
      </div>

      <div className="current-pkg-divider" />

      {/* Thanh tiến độ tin tuyển dụng */}
      <div className="current-pkg-quota-section">
        <div className="quota-header">
          <span className="quota-title">
            <FiBriefcase className="quota-icon" /> Hạn Mức Đăng Tin Tuyển Dụng
          </span>
          <span className="quota-count">
            <strong>{used}</strong> / {max} tin
          </span>
        </div>

        <div className="quota-progress-bar-bg">
          <div
            className={`quota-progress-bar-fill ${
              percent >= 100 ? 'fill--full' : percent >= 80 ? 'fill--warning' : ''
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="quota-footer-hint">
          {percent >= 100 ? (
            <span className="text-danger">⚠️ Đã sử dụng hết 100% hạn mức tin đăng của gói.</span>
          ) : (
            <span>Bạn còn <strong>{remainingPosts} lượt</strong> đăng tin tuyển dụng mới.</span>
          )}
        </div>
      </div>

      {/* Danh sách quyền lợi đang mở khóa */}
      <div className="current-pkg-benefits">
        <h4 className="benefits-title">Quyền Lợi Đang Áp Dụng:</h4>
        <div className="benefits-grid">
          <div className="benefit-item">
            <FiCheckCircle className="benefit-icon text-success" />
            <span>Đăng tối đa {max} tin tuyển dụng</span>
          </div>
          <div className="benefit-item">
            {subscription.allowRealtimeChat ? (
              <>
                <FiCheckCircle className="benefit-icon text-success" />
                <span>Nhắn tin Realtime với ứng viên 💬</span>
              </>
            ) : (
              <>
                <FiClock className="benefit-icon text-muted" />
                <span className="text-muted">Chưa kích hoạt Chat Realtime</span>
              </>
            )}
          </div>
          <div className="benefit-item">
            <FiCheckCircle className="benefit-icon text-success" />
            <span>Xem & lọc toàn bộ hồ sơ ứng viên nộp CV</span>
          </div>
          <div className="benefit-item">
            <FiCheckCircle className="benefit-icon text-success" />
            <span>Báo cáo thống kê hiệu quả tuyển dụng</span>
          </div>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="current-pkg-actions">
        <button
          type="button"
          className="btn-pkg-renew"
          onClick={onRenewClick}
          id="btn-current-pkg-renew"
        >
          <FiRefreshCw />
          <span>Gia hạn gói này</span>
        </button>

        <button
          type="button"
          className="btn-pkg-upgrade"
          onClick={onUpgradeClick}
          id="btn-current-pkg-upgrade"
        >
          <span>Nâng cấp gói cao hơn</span>
          <FiArrowUpRight />
        </button>
      </div>
    </div>
  );
};
