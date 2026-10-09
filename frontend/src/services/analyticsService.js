/**
 * Tầng dịch vụ Thống kê & Phân tích (Analytics Service).
 * Tuân thủ hợp đồng tại specs/004-employer-packages-dashboard/contracts/employer-service-contract.md.
 * Thao tác in-memory, giả lập lọc dữ liệu theo khoảng thời gian thực tế.
 */

import {
  initialRecruitmentTimeline,
  initialCvStatusDistribution,
  initialRevenueTimeline,
} from './analyticsMockData.js';

const simulateDelay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 1. Lấy dữ liệu thống kê tuyển dụng của Nhà tuyển dụng theo khoảng ngày.
 */
export const getRecruitmentAnalytics = async (
  _employerId = 'EMP-001',
  { startDate = '', endDate = '' } = {}
) => {
  await simulateDelay();

  let timeline = [...initialRecruitmentTimeline];

  if (startDate) {
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    timeline = timeline.filter((item) => new Date(item.date).getTime() >= start);
  }

  if (endDate) {
    const end = new Date(endDate).setHours(23, 59, 59, 999);
    timeline = timeline.filter((item) => new Date(item.date).getTime() <= end);
  }

  const totalApplications = timeline.reduce((acc, item) => acc + item.applications, 0);

  // Điều chỉnh phân bổ CV tương ứng tỷ lệ với tổng số ứng tuyển
  const statusDistribution = initialCvStatusDistribution.map((item) => ({
    ...item,
    count: Math.round((item.count / 86) * Math.max(1, totalApplications)),
  }));

  return {
    timeline,
    statusDistribution: totalApplications > 0 ? statusDistribution : [],
    summary: {
      totalApplications,
      activeJobs: 3,
      reviewingCount: Math.round(totalApplications * 0.4),
      newApplicationsThisWeek: Math.round(totalApplications * 0.35),
    },
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
