import { apiClient } from './apiClient';

/**
 * Dữ liệu thống kê dự phòng (fallback) tuân thủ nguyên tắc Dữ liệu mẫu độc lập trong Constitution.
 * Dùng khi chưa kết nối được backend hoặc cơ sở dữ liệu chưa có đủ dữ liệu seed.
 */
export const FALLBACK_PUBLIC_STATS = {
  candidateCount: 120000,
  companyCount: 5000,
  jobCount: 12500,
  applicationCount: 350000,
};

/**
 * Dịch vụ lấy số liệu thống kê công khai phục vụ Landing Page Nhà tuyển dụng.
 */
export const publicStatsService = {
  getPublicStats: async () => {
    try {
      const response = await apiClient.get('/public/stats');
      return response.data || FALLBACK_PUBLIC_STATS;
    } catch (error) {
      console.warn('Lỗi khi tải số liệu thống kê công khai, chuyển sang dùng dữ liệu dự phòng:', error);
      return FALLBACK_PUBLIC_STATS;
    }
  },
};

