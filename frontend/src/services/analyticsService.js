/**
 * Tầng dịch vụ Thống kê & Phân tích (Analytics Service).
 * Tuân thủ hợp đồng tại specs/004-employer-packages-dashboard/contracts/employer-service-contract.md.
 * Thống kê tuyển dụng NTD gọi backend; báo cáo doanh thu Admin vẫn dùng mock (thuộc module thanh toán).
 */

import { initialRevenueTimeline } from './analyticsMockData.js';
import { employerService } from './employerService.js';
import { APPLICATION_STATUS } from '../utils/statusLabels.js';

const simulateDelay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 1. Lấy dữ liệu thống kê tuyển dụng của Nhà tuyển dụng theo khoảng ngày (dữ liệu thật từ backend).
 * Ngày trống: backend mặc định 1 năm gần nhất. Khoảng > 62 ngày sẽ gom cột theo tháng.
 * NTD được xác định qua tài khoản đang đăng nhập nên không cần truyền employerId.
 */
export const getRecruitmentAnalytics = async (_employerId, { startDate = '', endDate = '' } = {}) => {
  const res = await employerService.getStats({ from: startDate, to: endDate });
  return {
    timeline: res.timeline,
    statusDistribution: res.statusDistribution.map((item) => ({
      status: item.key,
      name: APPLICATION_STATUS[item.key]?.label || item.key,
      color: APPLICATION_STATUS[item.key]?.color,
      count: item.count,
    })),
    summary: res.summary,
  };
};

/**
 * 2. Lấy dữ liệu báo cáo doanh thu tài chính Admin theo khoảng ngày.
 */
export const getAdminRevenueAnalytics = async ({ startDate = '', endDate = '' } = {}) => {
  await simulateDelay();

  let timeline = [...initialRevenueTimeline];

  if (startDate) {
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    timeline = timeline.filter((item) => new Date(item.date).getTime() >= start);
  }

  if (endDate) {
    const end = new Date(endDate).setHours(23, 59, 59, 999);
    timeline = timeline.filter((item) => new Date(item.date).getTime() <= end);
  }

  const totalRevenue = timeline.reduce((acc, item) => acc + item.totalRevenue, 0);
  const packageRevenueTotal = timeline.reduce((acc, item) => acc + item.packageRevenue, 0);
  const tokenRevenueTotal = timeline.reduce((acc, item) => acc + item.tokenRevenue, 0);

  const totalOrders = Math.round(totalRevenue / 644000);
  const packageOrders = Math.round(packageRevenueTotal / 1400000);
  const tokenOrders = Math.max(0, totalOrders - packageOrders);

  // Cơ cấu nguồn thu
  const sourceComposition = [
    {
      source: 'EMPLOYER_PACKAGES',
      name: 'Gói Dịch Vụ NTD',
      amount: packageRevenueTotal,
      percentage: totalRevenue > 0 ? Math.round((packageRevenueTotal / totalRevenue) * 100) : 0,
      color: '#2563eb',
    },
    {
      source: 'CANDIDATE_TOKENS',
      name: 'Ví Token Ứng Viên',
      amount: tokenRevenueTotal,
      percentage: totalRevenue > 0 ? Math.round((tokenRevenueTotal / totalRevenue) * 100) : 0,
      color: '#f59e0b',
    },
  ];

  return {
    timeline,
    sourceComposition: totalRevenue > 0 ? sourceComposition : [],
    summary: {
      totalRevenue,
      packageRevenueTotal,
      tokenRevenueTotal,
      totalOrders,
      packageOrders,
      tokenOrders,
      averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
    },
  };
};
