import { apiClient } from './apiClient';

export const authService = {
  login: (credentials) => apiClient.post('/auth/login', credentials).then((response) => response.data),
  loginWithGoogle: (credential) => apiClient.post('/auth/google', { credential }).then((response) => response.data),
  register: (account) => apiClient.post('/auth/register', account).then((response) => response.data),
};
