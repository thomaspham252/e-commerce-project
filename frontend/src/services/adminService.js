import { apiClient, asUser, cleanParams, DEV_USER_IDS } from './apiClient';

const cfg = (params) => ({ ...asUser(DEV_USER_IDS.admin), params: params && cleanParams(params) });

export const adminService = {
  // Người dùng
  getUsers: (params) => apiClient.get('/admin/users', cfg(params)).then((r) => r.data),
  updateUserStatus: (id, status) => apiClient.patch(`/admin/users/${id}/status`, { status }, cfg()),

  // Doanh nghiệp
  getCompanies: (params) => apiClient.get('/admin/companies', cfg(params)).then((r) => r.data),
  verifyCompany: (id, status) =>
    apiClient.patch(`/admin/companies/${id}/verification`, { status }, cfg()).then((r) => r.data),

  // Tin tuyển dụng
  getJobs: (params) => apiClient.get('/admin/jobs', cfg(params)).then((r) => r.data),
  reviewJob: (id, approved, reason) =>
    apiClient.patch(`/admin/jobs/${id}/review`, { approved, reason }, cfg()).then((r) => r.data),

  // Thống kê
  getOverview: () => apiClient.get('/admin/stats/overview', cfg()).then((r) => r.data),
  getMonthlyStats: (months = 6) => apiClient.get('/admin/stats/monthly', cfg({ months })).then((r) => r.data),
  getJobStatusStats: () => apiClient.get('/admin/stats/job-status', cfg()).then((r) => r.data),
};
