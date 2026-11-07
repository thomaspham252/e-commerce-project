import { apiClient } from './apiClient';

/**
 * Dịch vụ lấy số liệu thống kê công khai từ backend Spring Boot (/api/public/stats).
 */
export const publicStatsService = {
  getPublicStats: async () => {
    const response = await apiClient.get('/public/stats');
    return response.data || {
      candidateCount: 0,
      companyCount: 0,
      jobCount: 0,
      applicationCount: 0,
    };
  },
};
