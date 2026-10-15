import React, { useEffect, useState } from 'react';
import { employerService } from '../../services/employerService';
import { APPLICATION_STATUS } from '../../utils/statusLabels';
import { formatDate } from '../../utils/formatDate';
import { Link } from 'react-router-dom';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmployerAnalyticsCharts } from '../../components/employer/EmployerAnalyticsCharts.jsx';
import { useEmployerPackage } from '../../context/EmployerPackageContext.jsx';
import { FiPlusCircle, FiBox, FiArrowRight } from 'react-icons/fi';

export const EmployerDashboard = () => {
  const { subscription } = useEmployerPackage();
  const [recentApps, setRecentApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);

  useEffect(() => {
    employerService.getApplications({ size: 5 })
      .then((res) => setRecentApps(res.content))
      .catch(() => setRecentApps([]))
      .finally(() => setLoadingApps(false));
  }, []);

  const columns = [
    { header: 'Ứng viên', accessor: 'candidateName' },
    { header: 'Vị trí', accessor: 'jobTitle' },
    { header: 'Trạng thái', render: (row) => <StatusBadge status={APPLICATION_STATUS[row.status]?.label} /> },
    { header: 'Ngày ứng tuyển', render: (row) => formatDate(row.appliedAt) },
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
    </>
  );
};
