import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { FiUsers, FiClock, FiCheckCircle, FiFileText, FiInbox } from 'react-icons/fi';
import { getRecruitmentAnalytics } from '../../services/analyticsService.js';
import './EmployerAnalyticsCharts.css';

/**
 * Component Biểu đồ và Thống kê Tuyển dụng của Nhà tuyển dụng.
 * Hỗ trợ bộ lọc ngày (7 ngày, 30 ngày, tùy chọn), BarChart nộp hồ sơ, PieChart trạng thái CV, EmptyState.
 */
export const EmployerAnalyticsCharts = ({ employerId = 'EMP-001' }) => {
  const [preset, setPreset] = useState('30d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    timeline: [],
    statusDistribution: [],
    summary: {
      totalApplications: 0,
      activeJobs: 0,
      reviewingCount: 0,
      newApplicationsThisWeek: 0,
    },
  });

  // Tính toán khoảng ngày theo preset
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

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getRecruitmentAnalytics(employerId, { startDate, endDate });
        if (isMounted) {
          setAnalyticsData(res);
        }
      } catch (err) {
        console.error('Lỗi tải thống kê tuyển dụng:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [employerId, startDate, endDate]);

  const handleCustomDateChange = (type, val) => {
    setPreset('custom');
    if (type === 'start') setStartDate(val);
    if (type === 'end') setEndDate(val);
  };

  const { timeline, statusDistribution, summary } = analyticsData;
  const hasTimelineData = timeline && timeline.length > 0 && summary.totalApplications > 0;
  const hasPieData = statusDistribution && statusDistribution.length > 0 && statusDistribution.some((item) => item.count > 0);

  // Tooltip tùy biến cho BarChart
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-custom-tooltip">
          <div className="tooltip-date">Ngày: {label}</div>
          <div className="tooltip-value">Số hồ sơ ứng tuyển: {payload[0].value}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="employer-analytics-container">
      {/* Thanh bộ lọc ngày */}
      <div className="analytics-filter-bar">
        <div className="filter-presets">
          <button
            type="button"
            className={`preset-btn ${preset === '7d' ? 'active' : ''}`}
            onClick={() => applyPreset('7d')}
          >
            7 ngày qua
          </button>
          <button
            type="button"
            className={`preset-btn ${preset === '30d' ? 'active' : ''}`}
            onClick={() => applyPreset('30d')}
          >
            30 ngày qua
          </button>
          <button
            type="button"
            className={`preset-btn ${preset === 'all' ? 'active' : ''}`}
            onClick={() => applyPreset('all')}
          >
            Tất cả thời gian
          </button>
        </div>

        <div className="filter-custom-dates">
          <div className="date-input-group">
            <span>Từ:</span>
            <input
              type="date"
              className="date-input"
              value={startDate}
              onChange={(e) => handleCustomDateChange('start', e.target.value)}
            />
          </div>
          <div className="date-input-group">
            <span>Đến:</span>
            <input
              type="date"
              className="date-input"
              value={endDate}
              onChange={(e) => handleCustomDateChange('end', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Các thẻ KPI thống kê */}
      <div className="analytics-kpis-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <FiUsers />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Tổng hồ sơ ứng tuyển</span>
            <span className="kpi-value">{summary.totalApplications}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
            <FiClock />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Đang trong quy trình xem xét</span>
            <span className="kpi-value">{summary.reviewingCount}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#ecfdf5', color: '#059669' }}>
            <FiCheckCircle />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Ứng viên mới tuần này</span>
            <span className="kpi-value">{summary.newApplicationsThisWeek}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <FiFileText />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Tin tuyển dụng đang mở</span>
            <span className="kpi-value">{summary.activeJobs}</span>
          </div>
        </div>
      </div>

      {/* Lưới 2 biểu đồ */}
      <div className="charts-dual-grid">
        {/* Biểu đồ cột: Lượt nộp hồ sơ theo ngày */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-title">Diễn biến hồ sơ ứng tuyển theo ngày</h3>
            <p className="chart-subtitle">Theo dõi số lượt ứng tuyển tiếp nhận qua các mốc thời gian</p>
          </div>
          <div className="chart-body">
            {loading ? (
              <div className="chart-empty-state">Đang tải dữ liệu...</div>
            ) : !hasTimelineData ? (
              <div className="chart-empty-state">
                <FiInbox className="chart-empty-icon" />
                <div className="chart-empty-title">Chưa có dữ liệu ứng tuyển</div>
                <div className="chart-empty-desc">Không có hồ sơ nào được nộp trong khoảng thời gian đã chọn</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="applications" name="Lượt ứng tuyển" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Biểu đồ tròn: Cơ cấu trạng thái CV */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-title">Phân bổ trạng thái hồ sơ</h3>
            <p className="chart-subtitle">Tỷ lệ CV theo từng bước trong quy trình tuyển chọn</p>
          </div>
          <div className="chart-body">
            {loading ? (
              <div className="chart-empty-state">Đang tải dữ liệu...</div>
            ) : !hasPieData ? (
              <div className="chart-empty-state">
                <FiInbox className="chart-empty-icon" />
                <div className="chart-empty-title">Không có phân bổ trạng thái</div>
                <div className="chart-empty-desc">Chưa có ứng viên nào để thống kê phân loại trạng thái</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} hồ sơ`, name]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12, paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
