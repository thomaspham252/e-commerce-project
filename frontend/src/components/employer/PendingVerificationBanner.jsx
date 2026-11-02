import React from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiAlertTriangle, FiArrowRight, FiShield } from 'react-icons/fi';

/**
 * Banner cảnh báo trạng thái phê duyệt doanh nghiệp (PENDING / REJECTED) trên Employer Dashboard.
 */
export const PendingVerificationBanner = ({ status, companyName }) => {
  if (status === 'VERIFIED') {
    return null;
  }

  if (status === 'REJECTED') {
    return (
      <div
        className="verification-status-banner banner-rejected"
        style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div
            style={{
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <FiAlertTriangle size={20} />
          </div>
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#991b1b' }}>
              Hồ sơ doanh nghiệp chưa đạt yêu cầu xác minh
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#b91c1c', lineHeight: 1.5 }}>
              Ban quản trị đã xem xét hồ sơ của <strong>{companyName || 'Doanh nghiệp'}</strong> nhưng thông tin chưa đầy đủ hoặc không hợp lệ. Vui lòng cập nhật lại giấy tờ pháp lý để được duyệt lại.
            </p>
          </div>
        </div>
        <Link
          to="/employer/company"
          style={{
            backgroundColor: '#dc2626',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          <span>Cập nhật hồ sơ</span>
          <FiArrowRight size={14} />
        </Link>
      </div>
    );
  }

  // Mặc định hoặc trạng thái PENDING
  return (
    <div
      className="verification-status-banner banner-pending"
      style={{
        backgroundColor: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: '12px',
        padding: '18px 22px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        boxShadow: '0 2px 4px rgba(217, 119, 6, 0.05)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div
          style={{
            backgroundColor: '#fef3c7',
            color: '#d97706',
            padding: '10px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <FiClock size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#92400e' }}>
              Tài khoản Doanh nghiệp đang chờ Ban quản trị (Admin) phê duyệt
            </h4>
            <span
              style={{
                backgroundColor: '#d97706',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '9999px',
                textTransform: 'uppercase'
              }}
            >
              Chế độ chỉ xem
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#b45309', lineHeight: 1.5 }}>
            Bạn hiện có thể xem giao diện và báo cáo tổng quan. Để bảo vệ quyền lợi ứng viên, chức năng <strong>Đăng tin tuyển dụng mới</strong> và <strong>tiếp cận ứng viên</strong> sẽ được kích hoạt ngay sau khi Admin duyệt hồ sơ doanh nghiệp.
          </p>
        </div>
      </div>
      <Link
        to="/employer/company"
        style={{
          backgroundColor: '#d97706',
          color: '#ffffff',
          padding: '9px 18px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '600',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          whiteSpace: 'nowrap'
        }}
      >
        <FiShield size={14} />
        <span>Xem hồ sơ công ty</span>
      </Link>
    </div>
  );
};

