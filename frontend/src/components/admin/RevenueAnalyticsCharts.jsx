import React from 'react';
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
import {
  FiDollarSign,
  FiShoppingBag,
  FiBriefcase,
  FiLayers,
  FiInbox,
} from 'react-icons/fi';
import './RevenueAnalyticsCharts.css';

/**
 * Format tiền tệ VND tiện ích
 */
const formatVND = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

/**
 * Rút gọn số tiền cho trục Y (ví dụ 1.5M, 200k)
 */
const formatShortCurrency = (val) => {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}Tr`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
  return val;
};

export const RevenueAnalyticsCharts = ({ analyticsData, loading = false }) => {
  const { timeline = [], sourceComposition = [], summary = {} } = analyticsData || {};

  const totalRevenue = summary.totalRevenue || 0;
  const hasTimeline = timeline.length > 0 && totalRevenue > 0;
  const hasComposition = sourceComposition.length > 0 && totalRevenue > 0;

  // Custom tooltip cho biểu đồ doanh thu theo ngày
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-custom-tooltip">
          <div className="tooltip-date">Ngày: {label}</div>
          {payload.map((item, index) => (
            <div key={`tip-${index}`} style={{ color: item.color, margin: '2px 0' }}>
              {item.name}: <strong>{formatVND(item.value)}</strong>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="revenue-analytics-wrapper">
      {/* 4 Thẻ KPI Tài chính */}
      <div className="revenue-kpi-grid">
        <div className="revenue-kpi-card">
          <div className="revenue-kpi-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <FiDollarSign />
          </div>
          <div className="revenue-kpi-body">
            <span className="revenue-kpi-label">Tổng doanh thu nền tảng</span>
            <span className="revenue-kpi-val" style={{ color: '#059669' }}>
              {formatVND(totalRevenue)}
            </span>
            <span className="revenue-kpi-sub">Giá trị đơn TB: {formatVND(summary.averageOrderValue)}</span>
          </div>
        </div>

        <div className="revenue-kpi-card">
          <div className="revenue-kpi-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <FiBriefcase />
          </div>
          <div className="revenue-kpi-body">
            <span className="revenue-kpi-label">Gói dịch vụ NTD</span>
            <span className="revenue-kpi-val">{formatVND(summary.packageRevenueTotal)}</span>
            <span className="revenue-kpi-sub">{summary.packageOrders || 0} lượt giao dịch</span>
          </div>
        </div>

        <div className="revenue-kpi-card">
          <div className="revenue-kpi-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <FiLayers />
          </div>
          <div className="revenue-kpi-body">
            <span className="revenue-kpi-label">Ví Token Ứng viên</span>
            <span className="revenue-kpi-val">{formatVND(summary.tokenRevenueTotal)}</span>
            <span className="revenue-kpi-sub">{summary.tokenOrders || 0} lượt giao dịch</span>
          </div>
        </div>

        <div className="revenue-kpi-card">
          <div className="revenue-kpi-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <FiShoppingBag />
          </div>
          <div className="revenue-kpi-body">
            <span className="revenue-kpi-label">Tổng số giao dịch thành công</span>
            <span className="revenue-kpi-val">{summary.totalOrders || 0} đơn</span>
            <span className="revenue-kpi-sub">Tự động duyệt qua QR SePay</span>
          </div>
        </div>
      </div>

      {/* Lưới 2 biểu đồ Recharts */}
      <div className="revenue-charts-grid">
        {/* Biểu đồ diễn biến doanh thu theo ngày */}
        <div className="revenue-chart-card">
          <div className="revenue-chart-header">
            <h3 className="revenue-chart-title">Biểu đồ doanh thu theo thời gian</h3>
            <p className="revenue-chart-sub">Dòng tiền chi tiết từng ngày giữa Gói cước NTD và Nạp token Ứng viên</p>
          </div>
          <div className="revenue-chart-body">
            {loading ? (
              <div className="revenue-empty-state">Đang cập nhật số liệu...</div>
            ) : !hasTimeline ? (
              <div className="revenue-empty-state">
                <FiInbox className="revenue-empty-icon" />
                <strong>Không có phát sinh doanh thu</strong>
                <p>Không có giao dịch thành công trong khoảng thời gian đã chọn</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeline} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
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
                    tickFormatter={formatShortCurrency}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 12, paddingBottom: 10 }} />
                  <Bar
                    dataKey="packageRevenue"
                    name="Gói Dịch Vụ NTD"
                    stackId="a"
                    fill="#2563eb"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="tokenRevenue"
                    name="Token Ứng Viên"
                    stackId="a"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Biểu đồ tỷ trọng cơ cấu nguồn thu */}
        <div className="revenue-chart-card">
          <div className="revenue-chart-header">
            <h3 className="revenue-chart-title">Cơ cấu nguồn thu</h3>
            <p className="revenue-chart-sub">Tỷ trọng đóng góp dòng tiền vào doanh thu nền tảng</p>
          </div>
          <div className="revenue-chart-body">
            {loading ? (
              <div className="revenue-empty-state">Đang cập nhật số liệu...</div>
            ) : !hasComposition ? (
              <div className="revenue-empty-state">
                <FiInbox className="revenue-empty-icon" />
                <strong>Không có phân bổ nguồn thu</strong>
                <p>Chưa có dòng tiền phát sinh để phân tích tỷ lệ</p>
              </div>
            ) : (
              <>
                <div style={{ width: '100%', height: '210px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourceComposition}
                        dataKey="amount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {sourceComposition.map((entry, index) => (
                          <Cell key={`cell-rev-${index}`} fill={entry.color || '#2563eb'} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val, name) => [formatVND(val), name]}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="revenue-breakdown-list">
                  {sourceComposition.map((item, idx) => (
                    <div key={`src-${idx}`} className="revenue-breakdown-item">
                      <div className="breakdown-left">
                        <span className="breakdown-dot" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <div className="breakdown-right">
                        <span className="breakdown-amount">{formatVND(item.amount)}</span>
                        <span className="breakdown-pct">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
