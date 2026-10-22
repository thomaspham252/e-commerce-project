import React from 'react';
import { DashboardLayout } from './DashboardLayout';
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Users,
  MessageSquare,
  Package,
  CreditCard,
  Building2
} from 'lucide-react';
import {
  EmployerMessagesProvider,
  useEmployerMessages
} from '../context/EmployerMessagesContext';

const EmployerLayoutContent = () => {
  const { totalUnreadCount } = useEmployerMessages();

  const employerSidebarItems = [
    { path: '/employer', label: 'Dashboard', icon: <LayoutDashboard size={20} />, end: true },
    { path: '/employer/jobs', label: 'Tin tuyển dụng của tôi', icon: <Briefcase size={20} />, end: true },
    { path: '/employer/jobs/create', label: 'Đăng tin mới', icon: <PlusCircle size={20} /> },
    { path: '/employer/applications', label: 'Hồ sơ ứng viên', icon: <Users size={20} /> },
    {
      path: '/employer/messages',
      label: 'Tin nhắn',
      icon: <MessageSquare size={20} />,
      badge: totalUnreadCount
    },
    { path: '/employer/company', label: 'Hồ sơ doanh nghiệp', icon: <Building2 size={20} /> },
    { path: '/employer/subscription', label: 'Gói dịch vụ của tôi', icon: <Package size={20} /> },
    { path: '/employer/pricing', label: 'Bảng giá dịch vụ', icon: <CreditCard size={20} /> },
  ];

  return <DashboardLayout title="Nhà Tuyển Dụng" sidebarItems={employerSidebarItems} />;
};

export const EmployerLayout = () => {
  return (
    <EmployerMessagesProvider>
      <EmployerLayoutContent />
    </EmployerMessagesProvider>
  );
};
