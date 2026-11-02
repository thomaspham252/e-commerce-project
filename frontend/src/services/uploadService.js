import { apiClient, getErrorMessage } from './apiClient';

/**
 * Service xử lý tải ảnh và tệp tin lên máy chủ Backend Spring Boot (/api/upload/*).
 * File được lưu vật lý vào thư mục uploads/ của dự án và trả về URL để lưu vào MySQL.
 */
export const uploadService = {
  /**
   * Tải ảnh lên (Logo, Avatar, Hình ảnh doanh nghiệp)
   * @param {File} file - Đối tượng file từ input
   * @returns {Promise<{ url: string, fileName: string, size: number }>}
   */
  uploadImage: async (file) => {
    if (!file) throw new Error('Vui lòng chọn một tệp hình ảnh.');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      console.error('Lỗi khi tải ảnh lên:', err);
      throw new Error(getErrorMessage(err) || 'Không thể tải ảnh lên máy chủ.');
    }
  },

  /**
   * Tải tệp tin tổng quát (Giấy phép kinh doanh, PDF, CV)
   * @param {File} file - Đối tượng file từ input
   * @returns {Promise<{ url: string, fileName: string, size: number }>}
   */
  uploadFile: async (file) => {
    if (!file) throw new Error('Vui lòng chọn một tệp tin.');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/upload/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      console.error('Lỗi khi tải tệp tin lên:', err);
      throw new Error(getErrorMessage(err) || 'Không thể tải tệp lên máy chủ.');
    }
  },
};
