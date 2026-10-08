import { StatCard } from '../../components/common/StatCard';
import { Users, Briefcase, Eye, TrendingUp } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

export const EmployerDashboard = () => {
  // Dummy data cho biểu đồ NTD
  const viewsData = [
    { name: 'T2', views: 400, applies: 24 },
    { name: 'T3', views: 300, applies: 13 },
    { name: 'T4', views: 550, applies: 42 },
    { name: 'T5', views: 450, applies: 31 },
    { name: 'T6', views: 700, applies: 55 },
    { name: 'T7', views: 850, applies: 70 },
    { name: 'CN', views: 900, applies: 85 },
  ];

  const topJobsData = [
    { name: 'Frontend Dev', applies: 45 },
    { name: 'Backend Node.js', applies: 32 },
    { name: 'UI/UX Designer', applies: 28 },
    { name: 'Marketing', applies: 15 },
  ];

  const recentApps = [
    { id: 1, applicantName: 'Nguyễn Văn A', jobTitle: 'Frontend Developer', date: '08/10/2026', status: 'Đang xem xét' },
    { id: 2, applicantName: 'Trần Thị B', jobTitle: 'Frontend Developer', date: '07/10/2026', status: 'Phỏng vấn' },
    { id: 3, applicantName: 'Lê Văn C', jobTitle: 'Backend Node.js', date: '06/10/2026', status: 'Đã ứng tuyển' },
  ];

  const columns = [
    { header: 'Ứng viên', accessor: 'applicantName' },
    { header: 'Vị trí', accessor: 'jobTitle' },
    { header: 'Trạng thái', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Ngày ứng tuyển', accessor: 'date' },
  ];

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Tổng quan tuyển dụng</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <StatCard title="Đang Tuyển Dụng" value="5" icon={<Briefcase size={20} />} trend={2} trendLabel="tin so với tháng trước" />
        <StatCard title="Hồ Sơ Mới" value="124" icon={<Users size={20} />} trend={15.5} trendLabel="so với tuần trước" />
        <StatCard title="Lượt Xem Tin" value="3,410" icon={<Eye size={20} />} trend={8.2} trendLabel="so với tuần trước" />
        <StatCard title="Tỷ Lệ Chuyển Đổi" value="3.6%" icon={<TrendingUp size={20} />} trend={0.5} trendLabel="so với trung bình" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Biểu đồ miền (Area Chart) cho lượt xem và ứng tuyển */}
        <div className="card-section" style={{ background: 'var(--color-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '600', color: 'var(--color-text-main)' }}>Hiệu suất tin đăng (7 ngày qua)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={viewsData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorApplies" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
                <Area type="monotone" name="Lượt xem" dataKey="views" stroke="#10B981" fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" name="Lượt ứng tuyển" dataKey="applies" stroke="#3B82F6" fillOpacity={1} fill="url(#colorApplies)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ cột ngang */}
        <div className="card-section" style={{ background: 'var(--color-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '600', color: 'var(--color-text-main)' }}>Việc làm thu hút nhất</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart layout="vertical" data={topJobsData} margin={{ top: 5, right: 30, bottom: 5, left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#1F2937' }} width={120} />
                <RechartsTooltip cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Bar name="Lượt ứng tuyển" dataKey="applies" fill="#F97316" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card-section" style={{ background: 'var(--color-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '600', color: 'var(--color-text-main)' }}>Hồ sơ ứng tuyển mới nhất</h3>
        <DataTable columns={columns} data={recentApps} searchable={false} />
      </div>
    </>
  );
};
