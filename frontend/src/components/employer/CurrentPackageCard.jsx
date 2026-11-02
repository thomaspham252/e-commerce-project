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
  const max = subscription.maxJobPosts; // null = không giới hạn
  const unlimited = max == null;
  const percent = unlimited ? 0 : max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 100;
  const remainingPosts = unlimited ? null : Math.max(0, max - used);
  const isFree = subscription.status === 'FREE';

  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getFullYear()}`;
  };

  const isExpired = subscription.status === 'EXPIRED';

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
              <FiShield /> {isExpired ? 'Gói đã hết hạn' : isFree ? 'Chưa mua gói' : 'Đang hoạt động'}
            </span>
            {subscription.subscriptionId && (
              <span className="current-pkg-code">Mã: SUB-{subscription.subscriptionId}</span>
            )}
          </div>

          <h2 className="current-pkg-title">{subscription.packageName}</h2>
          <span className="current-pkg-company">Doanh nghiệp: {subscription.companyName || '—'}</span>
        </div>

        {isFree ? (
          <div className="current-pkg-days-box">
            <div className="days-counter">
              <span className="days-number">{max}</span>
              <span className="days-unit">tin miễn phí</span>
            </div>
            <div className="days-date-range">
              <span>Mua gói để đăng thêm tin và mở khóa quyền lợi</span>
            </div>
          </div>
        ) : (
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
        )}
      </div>

      <div className="current-pkg-divider" />

      {/* Thanh tiến độ tin tuyển dụng */}
      <div className="current-pkg-quota-section">
        <div className="quota-header">
          <span className="quota-title">
            <FiBriefcase className="quota-icon" /> Hạn Mức Đăng Tin Tuyển Dụng
          </span>
          <span className="quota-count">
            <strong>{used}</strong> / {unlimited ? '∞' : max} tin
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
          {isExpired ? (
            <span className="text-danger">⚠️ Gói đã hết hạn, vui lòng gia hạn để đăng tin mới.</span>
          ) : unlimited ? (
            <span>Gói của bạn được đăng tin <strong>không giới hạn</strong>.</span>
          ) : percent >= 100 ? (
            <span className="text-danger">⚠️ Đã sử dụng hết 100% hạn mức tin đăng.</span>
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
            <span>{unlimited ? 'Đăng tin không giới hạn' : `Đăng tối đa ${max} tin tuyển dụng`}</span>
          </div>
          {[
            [subscription.allowRealtimeChat, 'Nhắn tin trực tiếp với ứng viên'],
            [subscription.canSearchCandidates, 'Tìm kiếm trong kho hồ sơ ứng viên'],
            [subscription.canHighlightJobs, 'Làm nổi bật tin tuyển dụng'],
            [subscription.canPrioritizeJobs, 'Ưu tiên hiển thị tin lên đầu'],
          ].map(([enabled, label]) => (
            <div className="benefit-item" key={label}>
              {enabled ? (
                <>
                  <FiCheckCircle className="benefit-icon text-success" />
                  <span>{label}</span>
                </>
              ) : (
                <>
                  <FiClock className="benefit-icon text-muted" />
                  <span className="text-muted">Chưa có: {label.toLowerCase()}</span>
                </>
              )}
            </div>
          ))}
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
          <span>{isFree ? 'Xem bảng giá' : 'Gia hạn gói này'}</span>
        </button>

        <button
          type="button"
          className="btn-pkg-upgrade"
          onClick={onUpgradeClick}
          id="btn-current-pkg-upgrade"
        >
          <span>{isFree ? 'Mua gói dịch vụ' : 'Nâng cấp gói cao hơn'}</span>
          <FiArrowUpRight />
        </button>
      </div>
    </div>
  );
};
