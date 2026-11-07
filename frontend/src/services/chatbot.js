import { apiClient } from './apiClient';

/**
 * Dịch vụ trợ lý Chatbot AI.
 * TODO: Backend Spring Boot hiện chưa có endpoint /api/chat hoặc /api/chatbot.
 * Khi backend triển khai controller tương ứng, kết nối trực tiếp qua apiClient.post('/chat', ...).
 */
export const sendMessage = async (message, history = []) => {
  try {
    const response = await apiClient.post('/chat', { message, history });
    return response.data?.reply || response.data?.message || '';
  } catch (err) {
    // Không bịa dữ liệu giả; thông báo tính năng AI đang chờ endpoint backend
    throw new Error(
      'Hệ thống Chatbot AI đang được nâng cấp hoặc chưa có endpoint hỗ trợ từ backend.'
    );
  }
};
