import { apiClient } from './apiClient';

/**
 * Lấy trạng thái quyền lợi tiện ích ứng tuyển hiện tại của ứng viên từ backend.
 */
export const getCandidateBenefits = async () => {
  try {
    const res = await apiClient.get('/v1/wallet/benefits');
    return res.data?.data || null;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin quyền lợi tiện ích:', error);
    return null;
  }
};
