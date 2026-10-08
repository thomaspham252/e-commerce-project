import { StatCard } from '../../components/common/StatCard';
import { Users, Briefcase, Building2, Eye } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';

export const AdminDashboard = () => {
  const recentJobs = [
    { id: 1, title: 'Frontend Developer (React)', company: 'TechAsia', status: 'Chờ duyệt', date: '08/10/2026' },
    { id: 2, title: 'UX/UI Designer', company: 'DesignStudio', status: 'Chờ duyệt', date: '08/10/2026' },
    { id: 3, title: 'Backend Engineer (Node.js)', company: 'FPT Software', status: 'Đã duyệt', date: '07/10/2026' },
  ];

  const columns = [
    { header: 'Tên công việc', accessor: 'title' },
    { header: 'Công ty', accessor: 'company' },
    { header: 'Trạng thái', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Ngày đăng', accessor: 'date' },
  ];

  // Dummy data for charts
  const userGrowthData = [
    { name: 'T1', users: 4000, companies: 240 },
    { name: 'T2', users: 5000, companies: 300 },
    { name: 'T3', users: 6500, companies: 420 },
    { name: 'T4', users: 7200, companies: 510 },
    { name: 'T5', users: 8900, companies: 630 },
    { name: 'T6', users: 10500, companies: 780 },
    { name: 'T7', users: 12450, companies: 842 },
  ];

  const jobCategoryData = [
    { name: 'IT - Phần mềm', value: 1200 },
    { name: 'Marketing', value: 850 },
    { name: 'Kinh doanh', value: 920 },
    { name: 'Thiết kế', value: 450 },
    { name: 'Kế toán', value: 380 },
  ];

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Tổng quan hệ thống</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <StatCard title="Tổng Người Dùng" value="12,450" icon={<Users size={20} />} trend={5.2} trendLabel="so với tháng trước" />
        <StatCard title="Doanh Nghiệp" value="842" icon={<Building2 size={20} />} trend={2.1} trendLabel="so với tháng trước" />
        <StatCard title="Tin Tuyển Dụng" value="3,210" icon={<Briefcase size={20} />} trend={12.5} trendLabel="so với tháng trước" />
        <StatCard title="Lượt Xem Hôm Nay" value="45,210" icon={<Eye size={20} />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Biểu đồ đường */}
        <div className="card-section" style={{ background: 'var(--color-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '600', color: 'var(--color-text-main)' }}>Tăng trưởng người dùng & doanh nghiệp</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={userGrowthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
                <Line type="monotone" name="Người dùng" dataKey="users" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" name="Doanh nghiệp" dataKey="companies" stroke="#F97316" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ cột */}
        <div className="card-section" style={{ background: 'var(--color-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '600', color: 'var(--color-text-main)' }}>Việc làm theo ngành nghề</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={jobCategoryData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <RechartsTooltip cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Bar name="Số tin đăng" dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card-section" style={{ background: 'var(--color-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '600', color: 'var(--color-text-main)' }}>Tin tuyển dụng chờ duyệt</h3>
        <DataTable columns={columns} data={recentJobs} searchable={false} />
      </div>
    </>
  );
};
