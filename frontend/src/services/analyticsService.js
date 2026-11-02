/**
 * Tầng dịch vụ Thống kê & Phân tích (Analytics Service).
 * Tuân thủ hợp đồng tại specs/004-employer-packages-dashboard/contracts/employer-service-contract.md.
 * Thống kê tuyển dụng NTD và báo cáo doanh thu Admin đều lấy dữ liệu thật từ backend.
 */

import { adminService } from './adminService.js';
import { employerService } from './employerService.js';
import { APPLICATION_STATUS } from '../utils/statusLabels.js';

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

/** Tên hiển thị + màu cho từng nguồn thu (order_type trong bảng orders). */
const REVENUE_SOURCES = {
  SUBSCRIPTION: { name: 'Gói Dịch Vụ NTD', color: '#2563eb' },
  TOKEN: { name: 'Ví Token Ứng Viên', color: '#f59e0b' },
};

/**
 * 2. Báo cáo doanh thu Admin theo khoảng ngày (dữ liệu thật từ bảng orders, chỉ đơn đã thanh toán).
 * Ngày bắt đầu trống: lấy từ đơn thanh toán đầu tiên. Khoảng > 62 ngày sẽ gom cột theo tháng.
 */
export const getAdminRevenueAnalytics = async ({ startDate = '', endDate = '' } = {}) => {
  const res = await adminService.getRevenueStats({ from: startDate, to: endDate });
  const totalRevenue = res.summary.totalRevenue;

  const sourceComposition = res.sources
    .filter((item) => item.amount > 0)
    .map((item) => ({
      source: item.source,
      name: REVENUE_SOURCES[item.source]?.name || item.source,
      color: REVENUE_SOURCES[item.source]?.color || '#94a3b8',
      amount: item.amount,
      orders: item.orders,
      percentage: totalRevenue > 0 ? Math.round((item.amount / totalRevenue) * 100) : 0,
    }));

  return {
    timeline: res.timeline,
    sourceComposition,
    summary: res.summary,
  };
};
