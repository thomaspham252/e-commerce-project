import { apiClient, asUser, cleanParams, DEV_USER_IDS } from './apiClient';

const cfg = (params) => ({ ...asUser(DEV_USER_IDS.employer), params: params && cleanParams(params) });

export const employerService = {
  // Hồ sơ doanh nghiệp (null khi chưa tạo — backend trả 204)
  getCompany: () => apiClient.get('/employer/company', cfg()).then((r) => r.data || null),
  saveCompany: (data) => apiClient.put('/employer/company', data, cfg()).then((r) => r.data),

  // Tin tuyển dụng
  getJobs: (params) => apiClient.get('/employer/jobs', cfg(params)).then((r) => r.data),
  getJob: (id) => apiClient.get(`/employer/jobs/${id}`, cfg()).then((r) => r.data),
  createJob: (data) => apiClient.post('/employer/jobs', data, cfg()).then((r) => r.data),
  updateJob: (id, data) => apiClient.put(`/employer/jobs/${id}`, data, cfg()).then((r) => r.data),
  closeJob: (id) => apiClient.patch(`/employer/jobs/${id}/close`, null, cfg()).then((r) => r.data),
  deleteJob: (id) => apiClient.delete(`/employer/jobs/${id}`, cfg()),

  // Quản lý ứng tuyển
  getApplications: (params) => apiClient.get('/employer/applications', cfg(params)).then((r) => r.data),
  getApplication: (id) => apiClient.get(`/employer/applications/${id}`, cfg()).then((r) => r.data),
  updateApplicationStatus: (id, body) =>
    apiClient.patch(`/employer/applications/${id}/status`, body, cfg()).then((r) => r.data),

  // Thống kê ({ from, to } dạng yyyy-MM-dd, bỏ trống = mặc định của backend)
  getStats: ({ from, to } = {}) => apiClient.get('/employer/stats', cfg({ from, to })).then((r) => r.data),
};
