import axios from 'axios';

/** Axios dùng chung cho backend Spring Boot. Vite proxy /api → backend (xem vite.config.js). */
export const apiClient = axios.create({ baseURL: '/api' });

export const DEV_USER_IDS = {
  admin: import.meta.env.VITE_DEV_ADMIN_ID || '1',
  employer: import.meta.env.VITE_DEV_EMPLOYER_ID || '2',
  candidate: import.meta.env.VITE_DEV_CANDIDATE_ID || '35',
};

const AUTH_SESSION_KEY = 'jobviet.authSession';

export const getAuthSession = () => {
  try {
    const savedSession = localStorage.getItem(AUTH_SESSION_KEY) || sessionStorage.getItem(AUTH_SESSION_KEY);
    return savedSession ? JSON.parse(savedSession) : null;
  } catch {
    return null;
  }
};

export const saveAuthSession = (user) => {
  // Luôn luôn lưu phiên đăng nhập vào localStorage để thống nhất tài khoản trên toàn bộ trình duyệt
  sessionStorage.removeItem(AUTH_SESSION_KEY);
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('auth-session-changed'));
};

export const updateAuthSession = (updates) => {
  const session = getAuthSession();
  if (!session) return;
  saveAuthSession({ ...session, ...updates });
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_SESSION_KEY);
  sessionStorage.removeItem(AUTH_SESSION_KEY);
  window.dispatchEvent(new Event('auth-session-changed'));
};

apiClient.interceptors.request.use((config) => {
  const session = getAuthSession();
  if (session?.id && !config.headers['X-User-Id']) {
    config.headers['X-User-Id'] = session.id;
  }
  return config;
});

export const asUser = (userId) => ({
  headers: { 'X-User-Id': getAuthSession()?.id ?? userId },
});

/** Lấy thông báo lỗi tiếng Việt từ backend ({ message, errors }). */
export const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (data?.errors) return Object.values(data.errors).join('. ');
  if (data?.message) return data.message;
  if (data?.detail) return data.detail;
  if (!error?.response) return 'Không kết nối được máy chủ. Hãy kiểm tra backend đã chạy chưa.';
  return 'Đã có lỗi xảy ra, vui lòng thử lại.';
};

/** Bỏ các tham số rỗng để không gửi `status=` lên backend. */
export const cleanParams = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined));
