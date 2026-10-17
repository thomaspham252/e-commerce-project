import axios from 'axios';

/** Axios dùng chung cho backend Spring Boot. Vite proxy /api → backend (xem vite.config.js). */
export const apiClient = axios.create({ baseURL: '/api' });

const AUTH_SESSION_KEY = 'jobviet.authSession';

export const DEV_USER_IDS = {
  admin: import.meta.env.VITE_DEV_ADMIN_ID || '1',
  employer: import.meta.env.VITE_DEV_EMPLOYER_ID || '2',
};

export const getAuthSession = () => {
  const savedSession = localStorage.getItem(AUTH_SESSION_KEY) || sessionStorage.getItem(AUTH_SESSION_KEY);
  return savedSession ? JSON.parse(savedSession) : null;
};

export const saveAuthSession = (user, remember) => {
  const storage = remember ? localStorage : sessionStorage;
  const otherStorage = remember ? sessionStorage : localStorage;
  otherStorage.removeItem(AUTH_SESSION_KEY);
  storage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
};

export const asUser = (userId) => ({
  headers: { 'X-User-Id': getAuthSession()?.id ?? userId },
});

/** Lấy thông báo lỗi tiếng Việt từ backend ({ message, errors }). */
export const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (data?.errors) return Object.values(data.errors).join('. ');
  if (data?.message) return data.message;
  if (!error?.response) return 'Không kết nối được máy chủ. Hãy kiểm tra backend đã chạy chưa.';
  return 'Đã có lỗi xảy ra, vui lòng thử lại.';
};

/** Bỏ các tham số rỗng để không gửi `status=` lên backend. */
export const cleanParams = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined));
