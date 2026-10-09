import React from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmployerAnalyticsCharts } from '../../components/employer/EmployerAnalyticsCharts.jsx';
import { useEmployerPackage } from '../../context/EmployerPackageContext.jsx';
import { FiPlusCircle, FiBox, FiArrowRight } from 'react-icons/fi';

export const EmployerDashboard = () => {
  const { subscription } = useEmployerPackage();

  const recentApps = [
    { id: 1, applicantName: 'Nguyễn Văn A', jobTitle: 'Frontend Developer', date: '08/10/2026', status: 'Đang xem xét' },
    { id: 2, applicantName: 'Trần Thị B', jobTitle: 'Frontend Developer', date: '07/10/2026', status: 'Phỏng vấn' },
    { id: 3, applicantName: 'Lê Văn C', jobTitle: 'Backend Node.js', date: '06/10/2026', status: 'Đã ứng tuyển' },
    { id: 4, applicantName: 'Phạm Minh D', jobTitle: 'UI/UX Designer', date: '05/10/2026', status: 'Trúng tuyển' },
  ];

  const columns = [
    { header: 'Ứng viên', accessor: 'applicantName' },
    { header: 'Vị trí', accessor: 'jobTitle' },
    { header: 'Trạng thái', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Ngày ứng tuyển', accessor: 'date' },
  ];

  return (
    <>
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
          <Link
            to="/employer/jobs/create"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 14px' }}
          >
            <FiPlusCircle size={16} />
            <span>Đăng tin tuyển dụng</span>
          </Link>
        </div>
      </div>

      {/* Component Biểu đồ và Thống kê Tuyển dụng (US4) */}
      <div style={{ marginBottom: '32px' }}>
        <EmployerAnalyticsCharts employerId="EMP-001" />
      </div>

      {/* Bảng hồ sơ ứng tuyển mới nhất */}
      <div className="card-section" style={{ background: 'var(--color-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text-main)' }}>Hồ sơ ứng tuyển mới nhất</h3>
          <Link to="/employer/applications" style={{ fontSize: '13px', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
            Xem tất cả hồ sơ <FiArrowRight size={14} />
          </Link>
        </div>
        <DataTable columns={columns} data={recentApps} searchable={false} />
      </div>
    </>
  );
};
