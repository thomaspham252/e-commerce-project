/**
 * Dữ liệu mẫu (Mock Data) độc lập cho Thống kê Tuyển dụng NTD và Báo cáo Doanh thu Admin.
 * Tuân thủ Hiến pháp: Mock data tách biệt, hỗ trợ lọc theo khoảng ngày linh hoạt.
 */

// Hàm tạo chuỗi ngày YYYY-MM-DD
const getDateStr = (daysAgo) => {
  const d = new Date(Date.now() - daysAgo * 86400 * 1000);
  return d.toISOString().slice(0, 10);
};

const getLabelStr = (daysAgo) => {
  const d = new Date(Date.now() - daysAgo * 86400 * 1000);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
};

// 1. Dữ liệu diễn biến nộp hồ sơ ứng tuyển 35 ngày qua
export const initialRecruitmentTimeline = [
  { date: getDateStr(34), label: getLabelStr(34), applications: 5 },
  { date: getDateStr(33), label: getLabelStr(33), applications: 8 },
  { date: getDateStr(32), label: getLabelStr(32), applications: 4 },
  { date: getDateStr(31), label: getLabelStr(31), applications: 7 },
  { date: getDateStr(30), label: getLabelStr(30), applications: 9 },
  { date: getDateStr(29), label: getLabelStr(29), applications: 12 },
  { date: getDateStr(28), label: getLabelStr(28), applications: 6 },
  { date: getDateStr(27), label: getLabelStr(27), applications: 11 },
  { date: getDateStr(26), label: getLabelStr(26), applications: 14 },
  { date: getDateStr(25), label: getLabelStr(25), applications: 8 },
  { date: getDateStr(24), label: getLabelStr(24), applications: 10 },
  { date: getDateStr(23), label: getLabelStr(23), applications: 15 },
  { date: getDateStr(22), label: getLabelStr(22), applications: 18 },
  { date: getDateStr(21), label: getLabelStr(21), applications: 7 },
  { date: getDateStr(20), label: getLabelStr(20), applications: 13 },
  { date: getDateStr(19), label: getLabelStr(19), applications: 16 },
  { date: getDateStr(18), label: getLabelStr(18), applications: 21 },
  { date: getDateStr(17), label: getLabelStr(17), applications: 14 },
  { date: getDateStr(16), label: getLabelStr(16), applications: 19 },
  { date: getDateStr(15), label: getLabelStr(15), applications: 22 },
  { date: getDateStr(14), label: getLabelStr(14), applications: 11 },
  { date: getDateStr(13), label: getLabelStr(13), applications: 17 },
  { date: getDateStr(12), label: getLabelStr(12), applications: 24 },
  { date: getDateStr(11), label: getLabelStr(11), applications: 20 },
  { date: getDateStr(10), label: getLabelStr(10), applications: 26 },
  { date: getDateStr(9), label: getLabelStr(9), applications: 18 },
  { date: getDateStr(8), label: getLabelStr(8), applications: 23 },
  { date: getDateStr(7), label: getLabelStr(7), applications: 15 },
  { date: getDateStr(6), label: getLabelStr(6), applications: 28 },
  { date: getDateStr(5), label: getLabelStr(5), applications: 32 },
  { date: getDateStr(4), label: getLabelStr(4), applications: 25 },
  { date: getDateStr(3), label: getLabelStr(3), applications: 30 },
  { date: getDateStr(2), label: getLabelStr(2), applications: 35 },
  { date: getDateStr(1), label: getLabelStr(1), applications: 27 },
  { date: getDateStr(0), label: getLabelStr(0), applications: 19 },
];

// 2. Cơ cấu phân bổ trạng thái CV hiện tại của NTD
export const initialCvStatusDistribution = [
  { status: 'NEW', name: 'Hồ sơ mới', count: 28, color: '#3b82f6' },
  { status: 'REVIEWING', name: 'Đang xem xét', count: 20, color: '#f59e0b' },
  { status: 'INTERVIEW', name: 'Mời phỏng vấn', count: 14, color: '#8b5cf6' },
  { status: 'ACCEPTED', name: 'Trúng tuyển', count: 8, color: '#10b981' },
  { status: 'REJECTED', name: 'Từ chối', count: 6, color: '#ef4444' },
];

// 3. Dữ liệu diễn biến doanh thu theo ngày của Admin
export const initialRevenueTimeline = [
  { date: getDateStr(34), label: getLabelStr(34), packageRevenue: 1200000, tokenRevenue: 250000, totalRevenue: 1450000 },
  { date: getDateStr(33), label: getLabelStr(33), packageRevenue: 500000, tokenRevenue: 400000, totalRevenue: 900000 },
  { date: getDateStr(32), label: getLabelStr(32), packageRevenue: 0, tokenRevenue: 300000, totalRevenue: 300000 },
  { date: getDateStr(31), label: getLabelStr(31), packageRevenue: 2800000, tokenRevenue: 450000, totalRevenue: 3250000 },
  { date: getDateStr(30), label: getLabelStr(30), packageRevenue: 1200000, tokenRevenue: 500000, totalRevenue: 1700000 },
  { date: getDateStr(29), label: getLabelStr(29), packageRevenue: 0, tokenRevenue: 200000, totalRevenue: 200000 },
  { date: getDateStr(28), label: getLabelStr(28), packageRevenue: 1200000, tokenRevenue: 350000, totalRevenue: 1550000 },
  { date: getDateStr(27), label: getLabelStr(27), packageRevenue: 2800000, tokenRevenue: 600000, totalRevenue: 3400000 },
  { date: getDateStr(26), label: getLabelStr(26), packageRevenue: 500000, tokenRevenue: 150000, totalRevenue: 650000 },
  { date: getDateStr(25), label: getLabelStr(25), packageRevenue: 1200000, tokenRevenue: 400000, totalRevenue: 1600000 },
  { date: getDateStr(24), label: getLabelStr(24), packageRevenue: 0, tokenRevenue: 500000, totalRevenue: 500000 },
  { date: getDateStr(23), label: getLabelStr(23), packageRevenue: 2800000, tokenRevenue: 450000, totalRevenue: 3250000 },
  { date: getDateStr(22), label: getLabelStr(22), packageRevenue: 1200000, tokenRevenue: 300000, totalRevenue: 1500000 },
  { date: getDateStr(21), label: getLabelStr(21), packageRevenue: 500000, tokenRevenue: 250000, totalRevenue: 750000 },
  { date: getDateStr(20), label: getLabelStr(20), packageRevenue: 1200000, tokenRevenue: 600000, totalRevenue: 1800000 },
  { date: getDateStr(19), label: getLabelStr(19), packageRevenue: 0, tokenRevenue: 350000, totalRevenue: 350000 },
  { date: getDateStr(18), label: getLabelStr(18), packageRevenue: 2800000, tokenRevenue: 500000, totalRevenue: 3300000 },
  { date: getDateStr(17), label: getLabelStr(17), packageRevenue: 1200000, tokenRevenue: 400000, totalRevenue: 1600000 },
  { date: getDateStr(16), label: getLabelStr(16), packageRevenue: 0, tokenRevenue: 300000, totalRevenue: 300000 },
  { date: getDateStr(15), label: getLabelStr(15), packageRevenue: 1200000, tokenRevenue: 550000, totalRevenue: 1750000 },
  { date: getDateStr(14), label: getLabelStr(14), packageRevenue: 2800000, tokenRevenue: 700000, totalRevenue: 3500000 },
  { date: getDateStr(13), label: getLabelStr(13), packageRevenue: 500000, tokenRevenue: 250000, totalRevenue: 750000 },
  { date: getDateStr(12), label: getLabelStr(12), packageRevenue: 1200000, tokenRevenue: 400000, totalRevenue: 1600000 },
  { date: getDateStr(11), label: getLabelStr(11), packageRevenue: 0, tokenRevenue: 450000, totalRevenue: 450000 },
  { date: getDateStr(10), label: getLabelStr(10), packageRevenue: 2800000, tokenRevenue: 600000, totalRevenue: 3400000 },
  { date: getDateStr(9), label: getLabelStr(9), packageRevenue: 1200000, tokenRevenue: 350000, totalRevenue: 1550000 },
  { date: getDateStr(8), label: getLabelStr(8), packageRevenue: 500000, tokenRevenue: 500000, totalRevenue: 1000000 },
  { date: getDateStr(7), label: getLabelStr(7), packageRevenue: 1200000, tokenRevenue: 400000, totalRevenue: 1600000 },
  { date: getDateStr(6), label: getLabelStr(6), packageRevenue: 2800000, tokenRevenue: 850000, totalRevenue: 3650000 },
  { date: getDateStr(5), label: getLabelStr(5), packageRevenue: 1200000, tokenRevenue: 600000, totalRevenue: 1800000 },
  { date: getDateStr(4), label: getLabelStr(4), packageRevenue: 0, tokenRevenue: 350000, totalRevenue: 350000 },
  { date: getDateStr(3), label: getLabelStr(3), packageRevenue: 1200000, tokenRevenue: 500000, totalRevenue: 1700000 },
  { date: getDateStr(2), label: getLabelStr(2), packageRevenue: 2800000, tokenRevenue: 750000, totalRevenue: 3550000 },
  { date: getDateStr(1), label: getLabelStr(1), packageRevenue: 1200000, tokenRevenue: 450000, totalRevenue: 1650000 },
  { date: getDateStr(0), label: getLabelStr(0), packageRevenue: 500000, tokenRevenue: 300000, totalRevenue: 800000 },
];

// 4. Cơ cấu nguồn thu nền tảng
export const initialRevenueSourceComposition = [
  { source: 'EMPLOYER_PACKAGES', name: 'Gói Dịch Vụ NTD', amount: 37100000, percentage: 74, color: '#2563eb' },
  { source: 'CANDIDATE_TOKENS', name: 'Ví Token Ứng Viên', amount: 13050000, percentage: 26, color: '#f59e0b' },
];
