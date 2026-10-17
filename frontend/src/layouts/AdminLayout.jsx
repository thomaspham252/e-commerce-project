import { DashboardLayout } from './DashboardLayout';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  CreditCard,
  TrendingUp,
  Package,
  Coins,
} from 'lucide-react';

const adminSidebarItems = [
  { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} />, end: true },
  { path: '/admin/revenue', label: 'Báo cáo doanh thu', icon: <TrendingUp size={20} /> },
  { path: '/admin/packages', label: 'Quản lý gói NTD', icon: <Package size={20} /> },
  { path: '/admin/token-config', label: 'Cấu hình Token', icon: <Coins size={20} /> },
  { path: '/admin/payments', label: 'Quản lý giao dịch', icon: <CreditCard size={20} /> },
  { path: '/admin/users', label: 'Người dùng', icon: <Users size={20} /> },
  { path: '/admin/jobs', label: 'Tin tuyển dụng', icon: <Briefcase size={20} /> },
  { path: '/admin/companies', label: 'Doanh nghiệp', icon: <Building2 size={20} /> },
];

export const AdminLayout = () => {
  return <DashboardLayout title="Admin" sidebarItems={adminSidebarItems} />;
};
