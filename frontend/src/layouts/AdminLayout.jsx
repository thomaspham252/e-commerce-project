import { Navigate, useLocation } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import { getAuthSession } from '../services/apiClient';
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
  const location = useLocation();
  const session = getAuthSession();

  // Chỉ tài khoản ADMIN mới vào được khu vực quản trị
  if (!session) {
    return <Navigate to="/dang-nhap" replace state={{ from: location.pathname }} />;
  }
  if (session.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <DashboardLayout title="Admin" sidebarItems={adminSidebarItems} />;
};
