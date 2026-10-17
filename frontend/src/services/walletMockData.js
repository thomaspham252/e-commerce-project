/**
 * Dữ liệu mẫu (Mock Data) độc lập cho Ví Token của Ứng viên.
 * Tuân thủ Hiến pháp dự án: Tách rời mock data để dễ thay thế bằng API backend sau này.
 */

// Thông tin ví khởi tạo của ứng viên hiện tại
export const initialCandidateWallet = {
  userId: 'USR-UV-01',
  userName: 'Nguyễn Văn An',
  userEmail: 'an.nguyen@gmail.com',
  balance: 150, // Số dư token hiện tại
  totalDeposited: 250, // Tổng số token đã nạp
  totalConsumed: 100, // Tổng số token đã sử dụng
  updatedAt: new Date().toISOString(),
};

// Danh sách các mốc nạp token chuẩn
export const initialTokenPackages = [
  {
    id: 'pkg-50',
    tokens: 50,
    bonusTokens: 0,
    totalTokens: 50,
    priceVND: 50000,
    isPopular: false,
    badgeLabel: null,
    description: 'Gói trải nghiệm cơ bản cho ứng viên mới',
  },
  {
    id: 'pkg-100',
    tokens: 100,
    bonusTokens: 15,
    totalTokens: 115,
    priceVND: 100000,
    isPopular: true,
    badgeLabel: 'Tặng 15% Token • Phổ biến ⭐',
    description: 'Lựa chọn tối ưu, đủ dùng cho nhiều tiện ích ứng tuyển',
  },
  {
    id: 'pkg-200',
    tokens: 200,
    bonusTokens: 40,
    totalTokens: 240,
    priceVND: 190000,
    isPopular: false,
    badgeLabel: 'Tiết kiệm 5% chi phí',
    description: 'Dành cho ứng viên đang tích cực tìm việc làm gấp',
  },
  {
    id: 'pkg-500',
    tokens: 500,
    bonusTokens: 120,
    totalTokens: 620,
    priceVND: 450000,
    isPopular: false,
    badgeLabel: 'Siêu ưu đãi VIP • Tặng 120 Token',
    description: 'Gói nạp lớn nhất với ưu đãi token tối đa',
  },
];

// Danh sách lịch sử biến động token ban đầu
export const initialTokenTransactions = [
  {
    id: 'TX-TOK-005',
    userId: 'USR-UV-01',
    type: 'CONSUME',
    amount: -30,
    balanceAfter: 150,
    title: 'Mở khóa thông tin liên hệ NTD',
    description: 'Công ty Công nghệ FPT Software - Vị trí Frontend React',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'TX-TOK-004',
    userId: 'USR-UV-01',
    type: 'DEPOSIT',
    amount: 115,
    balanceAfter: 180,
    title: 'Nạp token qua VietQR SePay',
    description: 'Gói 100 Token (+15 Token tặng thêm) • Đơn: PAY-20261009-003',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: 'TX-TOK-003',
    userId: 'USR-UV-01',
    type: 'CONSUME',
    amount: -20,
    balanceAfter: 65,
    title: 'Đẩy hồ sơ CV lên đầu tìm kiếm',
    description: 'Ưu tiên hiển thị hồ sơ CV trong 72 giờ',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'TX-TOK-002',
    userId: 'USR-UV-01',
    type: 'REFUND',
    amount: 35,
    balanceAfter: 85,
    title: 'Hoàn lại token hệ thống',
    description: 'Hoàn token do tiện ích phỏng vấn trực tuyến gặp sự cố',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'TX-TOK-001',
    userId: 'USR-UV-01',
    type: 'BONUS',
    amount: 50,
    balanceAfter: 50,
    title: 'Quà tặng chào mừng ứng viên mới',
    description: 'Thưởng 50 token khi hoàn thiện 100% hồ sơ ứng viên',
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },
];

// Danh sách biểu phí tính năng sử dụng token
export const initialServiceFees = [
  {
    featureKey: 'UNLOCK_CONTACT',
    featureName: 'Mở khóa liên hệ trực tiếp NTD',
    tokenCost: 30,
    badge: 'Phổ biến',
    description: 'Xem trực tiếp số điện thoại và email riêng của người phụ trách tuyển dụng',
  },
  {
    featureKey: 'BOOST_CV',
    featureName: 'Đẩy hồ sơ CV lên đầu danh sách',
    tokenCost: 20,
    badge: 'Hiệu quả',
    description: 'Giữ vị trí ưu tiên cao trong kết quả tìm kiếm ứng viên của NTD trong 72 giờ',
  },
  {
    featureKey: 'URGENT_APPLY',
    featureName: 'Gắn huy hiệu Ứng tuyển nổi bật',
    tokenCost: 25,
    badge: 'Ưu tiên',
    description: 'Hồ sơ được đánh dấu sao nổi bật trong hòm thư tuyển dụng của nhà tuyển dụng',
  },
];
