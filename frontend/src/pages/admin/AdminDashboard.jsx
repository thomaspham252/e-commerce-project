import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, Building2, FileText } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { StatCard } from '../../components/common/StatCard';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { adminService } from '../../services/adminService';
import { getErrorMessage } from '../../services/apiClient';
import { JOB_STATUS } from '../../utils/statusLabels';
import { formatDate } from '../../utils/formatDate';
import '../../components/common/Modal.css';

const cardStyle = {
  background: 'var(--color-surface)', padding: '24px', borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)',
};
const titleStyle = { fontSize: '16px', fontWeight: '600', color: 'var(--color-text-main)' };
const tooltipStyle = { borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' };
const fmt = (n) => (n ?? 0).toLocaleString('vi-VN');

/** % tăng/giảm người dùng mới so với tháng trước; null khi tháng trước = 0. */
const growth = (current, previous) =>
  previous > 0 ? Math.round(((current - previous) / previous) * 1000) / 10 : null;

export const AdminDashboard = () => {
  // months: số tháng gần nhất, hoặc 'custom' để chọn khoảng tháng (range.from / range.to dạng yyyy-MM)
  const [months, setMonths] = useState(6);
  const [range, setRange] = useState(() => {
    const now = new Date();
    const to = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return { from: `${now.getFullYear()}-01`, to };
  });
  const [overview, setOverview] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [jobStatus, setJobStatus] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      adminService.getOverview(),
      adminService.getJobStatusStats(),
      adminService.getJobs({ status: 'PENDING_REVIEW', size: 5 }),
    ])
      .then(([ov, js, jobs]) => {
        setOverview(ov);
        setJobStatus(js.map((item) => ({
          name: JOB_STATUS[item.key]?.label || item.key,
          value: item.count,
          color: JOB_STATUS[item.key]?.color,
        })));
        setPendingJobs(jobs.content);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  useEffect(() => {
    if (months === 'custom' && (!range.from || !range.to)) return;
    const params = months === 'custom' ? range : { months };
    adminService.getMonthlyStats(params)
      .then((data) => {
        setMonthly(data);
        setError('');
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, [months, range]);

  const columns = [
    { header: 'Tên công việc', accessor: 'title' },
    { header: 'Công ty', accessor: 'companyName' },
    { header: 'Trạng thái', render: (row) => <StatusBadge status={JOB_STATUS[row.status]?.label} /> },
    { header: 'Ngày đăng', render: (row) => formatDate(row.createdAt) },
  ];

  const trend = overview ? growth(overview.newUsersThisMonth, overview.newUsersLastMonth) : null;

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Tổng quan hệ thống</h2>
      </div>

      {error && <div className="mgmt-error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <StatCard
          title="Tổng Người Dùng"
          value={fmt(overview?.totalUsers)}
          icon={<Users size={20} />}
          trend={trend || undefined}
          trendLabel={trend !== null ? 'người dùng mới so với tháng trước' : undefined}
        />
        <StatCard
          title="Doanh Nghiệp"
          value={fmt(overview?.companies)}
          icon={<Building2 size={20} />}
          trendLabel={overview ? `${overview.pendingCompanies} chờ xác minh` : undefined}
        />
        <StatCard
          title="Tin Tuyển Dụng"
          value={fmt(overview?.totalJobs)}
          icon={<Briefcase size={20} />}
          trendLabel={overview ? `${overview.openJobs} đang tuyển · ${overview.pendingJobs} chờ duyệt` : undefined}
        />
        <StatCard title="Hồ Sơ Ứng Tuyển" value={fmt(overview?.totalApplications)} icon={<FileText size={20} />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Biểu đồ cột theo thời gian */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: 12 }}>
            <h3 style={titleStyle}>Hoạt động theo tháng</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <select className="mgmt-select" value={months}
                onChange={(e) => setMonths(e.target.value === 'custom' ? 'custom' : Number(e.target.value))}>
                <option value={3}>3 tháng</option>
                <option value={6}>6 tháng</option>
                <option value={12}>12 tháng</option>
                <option value="custom">Tùy chọn...</option>
              </select>
              {months === 'custom' && (
                <>
                  <input type="month" className="mgmt-select" value={range.from} max={range.to}
                    onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} aria-label="Từ tháng" />
                  <input type="month" className="mgmt-select" value={range.to} min={range.from}
                    onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} aria-label="Đến tháng" />
                </>
              )}
            </div>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={monthly} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <RechartsTooltip cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }} contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
                <Bar name="Người dùng mới" dataKey="users" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar name="Tin đăng mới" dataKey="jobs" fill="#F97316" radius={[4, 4, 0, 0]} />
                <Bar name="Hồ sơ ứng tuyển" dataKey="applications" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ tròn theo trạng thái tin */}
        <div style={cardStyle}>
          <h3 style={{ ...titleStyle, marginBottom: '20px' }}>Tỷ lệ tin tuyển dụng theo trạng thái</h3>
          <div style={{ width: '100%', height: 300 }}>
            {jobStatus.length === 0 ? (
              <div className="mgmt-muted" style={{ textAlign: 'center', paddingTop: 120 }}>Chưa có tin tuyển dụng</div>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={jobStatus} dataKey="value" nameKey="name" cx="50%" cy="45%"
                    innerRadius={55} outerRadius={95} paddingAngle={2}
                    label={({ percent }) => `${Math.round(percent * 100)}%`}>
                    {jobStatus.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip formatter={(val, name) => [`${val} tin`, name]} contentStyle={tooltipStyle} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={titleStyle}>Tin tuyển dụng chờ duyệt</h3>
          <Link to="/admin/jobs" style={{ fontSize: '13px', color: 'var(--color-primary)' }}>Xem tất cả</Link>
        </div>
        <DataTable columns={columns} data={pendingJobs} searchable={false} emptyText="Không có tin nào chờ duyệt" />
      </div>
    </>
  );
};
