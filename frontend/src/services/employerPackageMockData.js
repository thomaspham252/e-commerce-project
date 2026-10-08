/**
 * Dữ liệu mẫu (Mock Data) độc lập cho Gói dịch vụ Nhà tuyển dụng.
 * Tuân thủ Hiến pháp: Tách riêng mock data khỏi giao diện để dễ thay thế backend sau này.
 */

// Danh mục các gói cước tuyển dụng mặc định
export const initialEmployerPackages = [
  {
    id: 'pkg-emp-basic',
    name: 'Gói Khởi Nghiệp',
    priceVND: 500000,
    durationDays: 30,
    maxJobPosts: 3,
    allowRealtimeChat: false,
    badge: null,
    isPopular: false,
    isActive: true,
    description: 'Giải pháp khởi đầu tiết kiệm dành cho doanh nghiệp nhỏ và startup',
    features: [
      'Đăng tối đa 3 tin tuyển dụng',
      'Hiển thị tiêu chuẩn trong 30 ngày',
      'Quản lý danh sách ứng viên ứng tuyển',
      'Hỗ trợ tiêu chuẩn qua email',
    ],
    createdAt: new Date('2026-09-01').toISOString(),
  },
  {
    id: 'pkg-emp-standard',
    name: 'Gói Tiêu Chuẩn',
    priceVND: 1200000,
    durationDays: 30,
    maxJobPosts: 10,
    allowRealtimeChat: true,
    badge: null,
    isPopular: false,
    isActive: true,
    description: 'Lựa chọn tối ưu cho các doanh nghiệp đang tuyển dụng nhiều vị trí',
    features: [
      'Đăng tối đa 10 tin tuyển dụng',
      'Hiển thị vị trí ưu tiên trong 30 ngày',
      'Nhắn tin Realtime trực tiếp với ứng viên 💬',
      'Thống kê số lượng hồ sơ nộp theo ngày',
      'Hỗ trợ kỹ thuật ưu tiên 24/7',
    ],
    createdAt: new Date('2026-09-01').toISOString(),
  },
  {
    id: 'pkg-emp-pro',
    name: 'Gói Chuyên Nghiệp',
    priceVND: 2800000,
    durationDays: 90,
    maxJobPosts: 30,
    allowRealtimeChat: true,
    badge: 'Phổ biến nhất ⭐',
    isPopular: true,
    isActive: true,
    description: 'Gói tuyển dụng dài hạn 90 ngày với đầy đủ quyền lợi cao cấp nhất',
    features: [
      'Đăng tối đa 30 tin tuyển dụng',
      'Thời hạn sử dụng lên đến 90 ngày',
      'Huy hiệu Doanh nghiệp nổi bật trên trang chủ',
      'Nhắn tin Realtime trực tiếp không giới hạn',
      'Báo cáo phân tích tuyển dụng chuyên sâu',
      'Chuyên viên tư vấn hỗ trợ riêng 1-1',
    ],
    createdAt: new Date('2026-09-01').toISOString(),
  },
];

// Thông tin gói hiện tại đang kích hoạt của Nhà tuyển dụng hiện tại
export const initialEmployerSubscription = {
  subscriptionId: 'SUB-EMP-202610-01',
  employerId: 'EMP-001',
  companyName: 'FPT Software',
  packageId: 'pkg-emp-standard',
  packageName: 'Gói Tiêu Chuẩn',
  startDate: new Date(Date.now() - 12 * 86400 * 1000).toISOString(),
  endDate: new Date(Date.now() + 18 * 86400 * 1000).toISOString(),
  remainingDays: 18,
  usedJobPosts: 3,
  maxJobPosts: 10,
  allowRealtimeChat: true,
  status: 'ACTIVE',
  lastOrderId: 'PAY-20261001-889',
};
