import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RevenueAnalyticsCharts } from '../../components/admin/RevenueAnalyticsCharts.jsx';
import { getAdminRevenueAnalytics } from '../../services/analyticsService.js';
import { getTransactions } from '../../services/paymentService.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { FiArrowRight, FiFileText, FiRefreshCw } from 'react-icons/fi';
import './AdminRevenuePage.css';

/**
 * Trang Báo cáo Doanh thu Admin.
 * Hiển thị KPI, Biểu đồ doanh thu Recharts, Cơ cấu nguồn thu và Lịch sử giao dịch gần đây.
 */
export const AdminRevenuePage = () => {
  const [preset, setPreset] = useState('30d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  const applyPreset = (type) => {
    setPreset(type);
    const end = new Date();
    const endStr = end.toISOString().slice(0, 10);
    let startStr = '';

    if (type === '7d') {
      const start = new Date(Date.now() - 6 * 86400 * 1000);
      startStr = start.toISOString().slice(0, 10);
    } else if (type === '30d') {
      const start = new Date(Date.now() - 29 * 86400 * 1000);
      startStr = start.toISOString().slice(0, 10);
    } else if (type === 'all') {
      startStr = '';
    }

    setStartDate(startStr);
    setEndDate(endStr);
  };

  useEffect(() => {
    applyPreset('30d');
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        getAdminRevenueAnalytics({ startDate, endDate }),
        getTransactions({ pageSize: 6 }),
      ]);
      setAnalyticsData(analyticsRes);
      // Lấy danh sách giao dịch gần nhất
      const paidOrders = (ordersRes?.data || []).slice(0, 6);
      setRecentOrders(paidOrders);
    } catch (err) {
      console.error('Lỗi tải dữ liệu doanh thu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  const handleCustomDateChange = (type, val) => {
    setPreset('custom');
    if (type === 'start') setStartDate(val);
    if (type === 'end') setEndDate(val);
  };

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const columns = [
    {
      header: 'Mã đơn hàng',
      accessor: 'orderId',
      render: (row) => <span style={{ fontWeight: 600, color: '#1e293b' }}>{row.orderId}</span>,
    },
    {
      header: 'Loại sản phẩm',
      accessor: 'orderType',
      render: (row) => (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            background: row.orderType === 'EMPLOYER_PACKAGE' ? '#eff6ff' : '#fef3c7',
            color: row.orderType === 'EMPLOYER_PACKAGE' ? '#2563eb' : '#d97706',
          }}
        >
          {row.orderType === 'EMPLOYER_PACKAGE' ? 'Gói NTD' : 'Token'}
        </span>
      ),
    },
    {
      header: 'Mô tả',
      accessor: 'description',
      render: (row) => row.packageName || row.tokenPackageName || row.description || 'Thanh toán',
    },
    {
      header: 'Số tiền',
      accessor: 'amount',
      render: (row) => (
        <span style={{ fontWeight: 600, color: '#059669' }}>{formatVND(row.amount)}</span>
      ),
    },
    {
      header: 'Trạng thái',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status === 'PAID' ? 'Hoạt động' : row.status} />,
    },
    {
      header: 'Thời gian',
      accessor: 'createdAt',
      render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString('vi-VN') : '-'),
    },
  ];

  return (
    <div className="admin-revenue-page">
      <div className="revenue-page-header">
        <div>
          <h2 className="revenue-page-title">Báo cáo Doanh thu & Dòng tiền</h2>
          <p className="revenue-page-desc">
            Theo dõi dòng tiền thu từ Gói dịch vụ Nhà tuyển dụng và Nạp token của Ứng viên.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={loadData}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <FiRefreshCw size={14} />
            <span>Làm mới</span>
          </button>
          <Link
            to="/admin/transactions"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <FiFileText size={14} />
            <span>Quản lý giao dịch</span>
          </Link>
        </div>
      </div>

      {/* Thanh bộ lọc khoảng ngày */}
      <div className="revenue-filter-card">
        <div className="revenue-presets">
          <button
            type="button"
            className={`revenue-preset-btn ${preset === '7d' ? 'active' : ''}`}
            onClick={() => applyPreset('7d')}
          >
            7 ngày qua
          </button>
          <button
            type="button"
            className={`revenue-preset-btn ${preset === '30d' ? 'active' : ''}`}
            onClick={() => applyPreset('30d')}
          >
            30 ngày qua
          </button>
          <button
            type="button"
            className={`revenue-preset-btn ${preset === 'all' ? 'active' : ''}`}
            onClick={() => applyPreset('all')}
          >
            Toàn bộ thời gian
          </button>
        </div>

        <div className="revenue-custom-dates">
          <div className="revenue-date-group">
            <span>Từ:</span>
            <input
              type="date"
              className="revenue-date-input"
              value={startDate}
              onChange={(e) => handleCustomDateChange('start', e.target.value)}
            />
          </div>
          <div className="revenue-date-group">
            <span>Đến:</span>
            <input
              type="date"
              className="revenue-date-input"
              value={endDate}
              onChange={(e) => handleCustomDateChange('end', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Biểu đồ và chỉ số KPI */}
      <RevenueAnalyticsCharts analyticsData={analyticsData} loading={loading} />

      {/* Danh sách giao dịch doanh thu gần nhất */}
      <div className="revenue-recent-section">
        <div className="revenue-recent-header">
          <h3 className="revenue-recent-title">Giao dịch thanh toán gần đây</h3>
          <Link to="/admin/transactions" className="revenue-view-all-link">
            Xem toàn bộ lịch sử <FiArrowRight size={14} />
          </Link>
        </div>

        <DataTable columns={columns} data={recentOrders} searchable={false} />
      </div>
    </div>
  );
};
