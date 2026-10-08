import { DashboardLayout } from './DashboardLayout';
import { LayoutDashboard, Briefcase, PlusCircle, Users } from 'lucide-react';

const employerSidebarItems = [
  { path: '/employer', label: 'Dashboard', icon: <LayoutDashboard size={20} />, end: true },
  { path: '/employer/jobs', label: 'Tin tuyển dụng của tôi', icon: <Briefcase size={20} />, end: true },
  { path: '/employer/jobs/create', label: 'Đăng tin mới', icon: <PlusCircle size={20} /> },
  { path: '/employer/applications', label: 'Hồ sơ ứng viên', icon: <Users size={20} /> },
];

export const EmployerLayout = () => {
  return <DashboardLayout title="Nhà Tuyển Dụng" sidebarItems={employerSidebarItems} />;
};
