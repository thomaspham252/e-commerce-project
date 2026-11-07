import React, { useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Users,
  MessageSquare,
  Package,
  CreditCard,
  Building2,
  Star,
  Search
} from 'lucide-react';
import {
  EmployerMessagesProvider,
  useEmployerMessages
} from '../context/EmployerMessagesContext';
import { useEmployerPackage } from '../context/EmployerPackageContext';
import { PackageLimitModal } from '../components/employer/PackageLimitModal';

const EmployerLayoutContent = () => {
  const { totalUnreadCount } = useEmployerMessages();
  const { subscription } = useEmployerPackage();
  const [limitModalOpen, setLimitModalOpen] = useState(false);

  // Chỉ cho phép vào tin nhắn nếu NTD đang có gói dịch vụ còn hiệu lực và hỗ trợ realtime chat
  const canAccessChat = Boolean(subscription?.allowRealtimeChat);

  const employerSidebarItems = [
    { path: '/employer/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, end: true },
    { path: '/employer/jobs', label: 'Tin tuyển dụng của tôi', icon: <Briefcase size={20} />, end: true },
    { path: '/employer/jobs/create', label: 'Đăng tin mới', icon: <PlusCircle size={20} /> },
    { path: '/employer/candidates', label: 'Kho ứng viên', icon: <Search size={20} /> },
    { path: '/employer/applications', label: 'Hồ sơ ứng tuyển', icon: <Users size={20} /> },
    {
      path: '/employer/messages',
      label: 'Tin nhắn',
      icon: <MessageSquare size={20} />,
      badge: totalUnreadCount,
      onClick: (e) => {
        if (!canAccessChat) {
          e.preventDefault();
          setLimitModalOpen(true);
        }
      }
    },
    { path: '/employer/reviews', label: 'Đánh giá & Phản hồi', icon: <Star size={20} /> },
    { path: '/employer/company', label: 'Hồ sơ doanh nghiệp', icon: <Building2 size={20} /> },
    { path: '/employer/subscription', label: 'Gói dịch vụ của tôi', icon: <Package size={20} /> },
    { path: '/employer/pricing', label: 'Bảng giá dịch vụ', icon: <CreditCard size={20} /> },
  ];

  return (
    <>
      <DashboardLayout title="Nhà Tuyển Dụng" sidebarItems={employerSidebarItems} />
      <PackageLimitModal
        isOpen={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        reason="NO_PERMISSION"
        customTitle="Yêu Cầu Mua Gói Dịch Vụ Nhà Tuyển Dụng"
        customMessage="Tính năng nhắn tin trực tiếp với ứng viên chỉ áp dụng cho Nhà tuyển dụng đã đăng ký Gói Dịch Vụ (Tiêu chuẩn hoặc Chuyên nghiệp). Vui lòng nâng cấp gói để mở khóa kênh liên hệ này!"
        currentSubscription={subscription}
      />
    </>
  );
};

export const EmployerLayout = () => {
  return (
    <EmployerMessagesProvider>
      <EmployerLayoutContent />
    </EmployerMessagesProvider>
  );
};
