import { apiClient, asUser, cleanParams, DEV_USER_IDS } from './apiClient';

const cfg = (params) => ({ ...asUser(DEV_USER_IDS.admin), params: params && cleanParams(params) });

export const adminService = {
  // Người dùng
  getUsers: (params) => apiClient.get('/admin/users', cfg(params)).then((r) => r.data),
  updateUserStatus: (id, status) => apiClient.patch(`/admin/users/${id}/status`, { status }, cfg()),
  getUser: (id) => apiClient.get(`/admin/users/${id}`, cfg()).then((r) => r.data),
  updateSearchable: (id, searchable) => apiClient.patch(`/admin/users/${id}/searchable`, { searchable }, cfg()),

  // Hồ sơ (CV)
  getCvs: (params) => apiClient.get('/admin/cvs', cfg(params)).then((r) => r.data),
  deleteCv: (id) => apiClient.delete(`/admin/cvs/${id}`, cfg()),

  // Doanh nghiệp
  getCompanies: (params) => apiClient.get('/admin/companies', cfg(params)).then((r) => r.data),
  verifyCompany: (id, status) =>
    apiClient.patch(`/admin/companies/${id}/verification`, { status }, cfg()).then((r) => r.data),

  // Tin tuyển dụng
  getJobs: (params) => apiClient.get('/admin/jobs', cfg(params)).then((r) => r.data),
  reviewJob: (id, approved, reason) =>
    apiClient.patch(`/admin/jobs/${id}/review`, { approved, reason }, cfg()).then((r) => r.data),
  takeDownJob: (id, reason) =>
    apiClient.patch(`/admin/jobs/${id}/take-down`, { reason }, cfg()).then((r) => r.data),

  // Thống kê
  getOverview: () => apiClient.get('/admin/stats/overview', cfg()).then((r) => r.data),
  /** Truyền { months } để lấy N tháng gần nhất, hoặc { from, to } dạng yyyy-MM cho khoảng tùy chọn. */
  getMonthlyStats: ({ months = 6, from, to } = {}) =>
    apiClient.get('/admin/stats/monthly', cfg({ months, from, to })).then((r) => r.data),
  getJobStatusStats: () => apiClient.get('/admin/stats/job-status', cfg()).then((r) => r.data),
};
