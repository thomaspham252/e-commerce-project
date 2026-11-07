import React, { useEffect, useState } from 'react';
import { employerService } from '../../services/employerService';
import { APPLICATION_STATUS } from '../../utils/statusLabels';
import { formatDate } from '../../utils/formatDate';
import { Link } from 'react-router-dom';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmployerAnalyticsCharts } from '../../components/employer/EmployerAnalyticsCharts.jsx';
import { PendingVerificationBanner } from '../../components/employer/PendingVerificationBanner.jsx';
import { useEmployerPackage } from '../../context/EmployerPackageContext.jsx';
import { PackageLimitModal } from '../../components/employer/PackageLimitModal.jsx';
import { FiPlusCircle, FiBox, FiArrowRight, FiMessageSquare } from 'react-icons/fi';

export const EmployerDashboard = () => {
  const { subscription } = useEmployerPackage();
  const [recentApps, setRecentApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [company, setCompany] = useState(null);
  const [limitModalOpen, setLimitModalOpen] = useState(false);

  useEffect(() => {
    // Tải thông tin công ty để kiểm tra verificationStatus
    employerService.getCompany()
      .then((data) => setCompany(data || null))
      .catch(() => setCompany(null));

    // Tải các ứng tuyển gần nhất
    employerService.getApplications({ size: 5 })
      .then((res) => setRecentApps(res?.content || []))
      .catch(() => setRecentApps([]))
      .finally(() => setLoadingApps(false));
  }, []);

  const isVerified = company?.verificationStatus === 'VERIFIED';
  const verificationStatus = company?.verificationStatus || 'PENDING';

  const columns = [
    { header: 'Ứng viên', accessor: 'candidateName' },
    { header: 'Vị trí', accessor: 'jobTitle' },
    { header: 'Trạng thái', render: (row) => <StatusBadge status={APPLICATION_STATUS[row.status]?.label} /> },
    { header: 'Ngày ứng tuyển', render: (row) => formatDate(row.appliedAt) },
    {
      header: 'Thao tác',
      render: (row) => (
        <Link
          to={`/employer/messages?candidateId=${row.candidateId}`}
          className="btn btn-outline"
          onClick={(e) => {
            if (!subscription?.allowRealtimeChat) {
              e.preventDefault();
              setLimitModalOpen(true);
            }
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            padding: '5px 10px',
            borderRadius: '6px',
            color: 'var(--color-primary)',
            borderColor: 'var(--color-primary)',
            textDecoration: 'none'
          }}
          title={`Nhắn tin với ${row.candidateName}`}
        >
          <FiMessageSquare size={13} />
          <span>Nhắn tin</span>
        </Link>
      )
    }
  ];

  return (
    <>
      {/* Banner thông báo trạng thái PENDING hoặc REJECTED */}
      <PendingVerificationBanner
        status={verificationStatus}
        companyName={company?.name}
      />

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 className="page-title">Tổng quan tuyển dụng</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Giám sát hiệu quả tiếp nhận hồ sơ, tiến độ tuyển dụng và chỉ số chuyển đổi ứng viên.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link
            to="/employer/subscription"
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 14px' }}
          >
            <FiBox size={16} />
            <span>Gói: {subscription?.packageName || 'Chưa kích hoạt'}</span>
          </Link>

          {isVerified ? (
            <Link
              to="/employer/jobs/create"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 14px' }}
            >
              <FiPlusCircle size={16} />
              <span>Đăng tin tuyển dụng</span>
            </Link>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              disabled
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                padding: '8px 14px',
                opacity: 0.65,
                cursor: 'not-allowed'
              }}
              title="Doanh nghiệp đang chờ duyệt xác minh nên chưa thể đăng tin tuyển dụng mới"
            >
              <FiPlusCircle size={16} />
              <span>Đăng tin (Chờ duyệt)</span>
            </button>
          )}
        </div>
      </div>

      {/* Component Biểu đồ và Thống kê Tuyển dụng */}
      <div style={{ marginBottom: '32px' }}>
        <EmployerAnalyticsCharts />
      </div>

      {/* Bảng hồ sơ ứng tuyển mới nhất */}
      <div className="card-section" style={{ background: 'var(--color-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text-main)' }}>Hồ sơ ứng tuyển mới nhất</h3>
          <Link to="/employer/applications" style={{ fontSize: '13px', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
            Xem tất cả hồ sơ <FiArrowRight size={14} />
          </Link>
        </div>
        <DataTable columns={columns} data={recentApps} loading={loadingApps} searchable={false}
          emptyText="Chưa có hồ sơ ứng tuyển nào" />
      </div>

      <PackageLimitModal
        isOpen={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        reason="NO_PERMISSION"
        customTitle="Yêu Cầu Mua Gói Dịch Vụ Nhà Tuyển Dụng"
        customMessage="Tính năng nhắn tin trực tiếp với ứng viên chỉ áp dụng cho Nhà tuyển dụng đã đăng ký Gói Dịch Vụ (Tiêu chuẩn hoặc Chuyên nghiệp). Vui lòng nâng cấp gói để mở khóa kênh liên hệ này!"
        currentSubscription={subscription}
      />
    </>
  );
};
