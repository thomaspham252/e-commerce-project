/**
 * Tầng dịch vụ Ví Token của Ứng viên (Wallet Service).
 * Kết nối trực tiếp với Backend Spring Boot và Database MySQL.
 * Loại bỏ toàn bộ dữ liệu mock cứng, đồng bộ số dư và lịch sử thực tế.
 */

import { apiClient, getErrorMessage } from './apiClient.js';

// Danh mục biểu phí các tính năng dùng token của ứng viên
export const initialServiceFees = [
  {
    featureKey: 'UNLOCK_CONTACT',
    featureName: 'Mở khóa liên hệ trực tiếp NTD',
    tokenCost: 30,
    badge: 'Phổ biến',
    description: 'Xem trực tiếp số điện thoại và email riêng của người phụ trách tuyển dụng',
  },
  {
    featureKey: 'BOOST_CV',
    featureName: 'Đẩy hồ sơ CV lên đầu danh sách',
    tokenCost: 20,
    badge: 'Hiệu quả',
    description: 'Giữ vị trí ưu tiên cao trong kết quả tìm kiếm ứng viên của NTD trong 72 giờ',
  },
  {
    featureKey: 'URGENT_APPLY',
    featureName: 'Gắn huy hiệu Ứng tuyển nổi bật',
    tokenCost: 25,
    badge: 'Ưu tiên',
    description: 'Hồ sơ được đánh dấu sao nổi bật trong hòm thư tuyển dụng của nhà tuyển dụng',
  },
];

/**
 * 1. Lấy thông tin ví và số dư thực tế từ database MySQL qua API /api/v1/wallet.
 */
export const getWallet = async () => {
  try {
    const res = await apiClient.get('/v1/wallet');
    if (res.data?.success && res.data?.data) {
      return res.data.data;
    }
  } catch (err) {
    console.error('[WalletService] Lỗi khi lấy thông tin ví từ DB:', getErrorMessage(err));
  }
  return { balance: 0, totalDeposited: 0, totalConsumed: 0 };
};

/**
 * 2. Lấy danh sách các mốc nạp token từ database MySQL qua API /api/v1/token-packages.
 */
export const getTokenPackages = async (includeAll = false) => {
  try {
    const res = await apiClient.get('/v1/token-packages', {
      params: { all: includeAll },
    });
    if (res.data?.success && res.data?.data) {
      return res.data.data;
    }
  } catch (err) {
    console.error('[WalletService] Lỗi khi lấy danh sách gói token:', getErrorMessage(err));
  }
  return [];
};

/**
 * 3. Lấy lịch sử biến động token thực tế từ database qua API /api/v1/wallet/transactions.
 */
export const getTokenTransactions = async (
  _userId,
  { type = 'ALL', startDate = '', endDate = '' } = {}
) => {
  try {
    const res = await apiClient.get('/v1/wallet/transactions');
    let list = res.data?.success && res.data?.data ? res.data.data : [];

    if (type && type !== 'ALL') {
      list = list.filter((t) => t.type === type);
    }
    if (startDate) {
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      list = list.filter((t) => new Date(t.createdAt).getTime() >= start);
    }
    if (endDate) {
      const end = new Date(endDate).setHours(23, 59, 59, 999);
      list = list.filter((t) => new Date(t.createdAt).getTime() <= end);
    }
    return list;
  } catch (err) {
    console.error('[WalletService] Lỗi khi lấy lịch sử giao dịch:', getErrorMessage(err));
    return [];
  }
};

/**
 * 4. Lấy lịch sử nạp tiền ngân hàng từ bảng orders qua API /api/v1/wallet/deposits.
 */
export const getDepositHistory = async () => {
  try {
    const res = await apiClient.get('/v1/wallet/deposits');
    if (res.data?.success && res.data?.data) {
      return res.data.data;
    }
  } catch (err) {
    console.error('[WalletService] Lỗi khi lấy lịch sử nạp tiền:', getErrorMessage(err));
  }
  return [];
};

/**
 * 5. Trừ token khi ứng viên sử dụng tiện ích (lưu vào bảng token_transactions trong DB).
 */
export const consumeTokens = async (_userId, featureKey = 'UNLOCK_CONTACT') => {
  const fee = initialServiceFees.find((f) => f.featureKey === featureKey) || {
    featureName: 'Sử dụng tiện ích ứng viên',
    tokenCost: 30,
  };

  try {
    const res = await apiClient.post('/v1/wallet/consume', {
      featureKey,
      featureName: fee.featureName,
      tokenCost: fee.tokenCost,
    });

    if (res.data?.success) {
      return {
        success: true,
        wallet: res.data.wallet,
        transaction: res.data.transaction,
      };
    }
  } catch (err) {
    const msg = err.response?.data?.message || 'Không thể trừ token. Vui lòng kiểm tra số dư.';
    return {
      success: false,
      message: msg,
    };
  }

  return { success: false, message: 'Thao tác không thành công' };
};

/**
 * 6. Lấy danh sách biểu phí các tính năng dùng token từ Database MySQL qua API /api/v1/service-fees.
 */
export const getServiceFees = async () => {
  try {
    const res = await apiClient.get('/v1/service-fees');
    if (res.data?.success && res.data?.data) {
      return res.data.data;
    }
  } catch (err) {
    console.error('[WalletService] Lỗi khi lấy danh sách biểu phí từ DB:', err);
  }
  return [...initialServiceFees];
};

/**
 * 7. Admin: Lưu thông tin gói token (thêm mới hoặc chỉnh sửa vào Database MySQL).
 */
export const saveTokenPackage = async (packageData) => {
  try {
    if (packageData.id) {
      const res = await apiClient.put(`/v1/token-packages/${packageData.id}`, packageData);
      return res.data?.data || packageData;
    } else {
      const res = await apiClient.post('/v1/token-packages', packageData);
      return res.data?.data || packageData;
    }
  } catch (err) {
    console.error('[WalletService] Lỗi khi lưu gói token vào DB:', err);
    throw err;
  }
};

/**
 * 8. Admin: Bật/tắt trạng thái mở bán gói token trong Database MySQL.
 */
export const toggleTokenPackageStatus = async (packageId) => {
  try {
    const res = await apiClient.patch(`/v1/token-packages/${packageId}/toggle-status`);
    return res.data?.data || { id: packageId };
  } catch (err) {
    console.error('[WalletService] Lỗi khi đổi trạng thái gói token trong DB:', err);
    throw err;
  }
};

/**
 * 9. Admin: Lưu chỉnh sửa biểu phí tính năng trực tiếp vào Database MySQL qua API PUT /api/v1/service-fees/{id}.
 */
export const saveServiceFee = async (feeData) => {
  try {
    const id = feeData.id || feeData.featureKey;
    if (!id) {
      throw new Error('Không xác định được ID hoặc mã tính năng để cập nhật');
    }
    const res = await apiClient.put(`/v1/service-fees/${id}`, {
      tokenCost: feeData.tokenCost,
      featureName: feeData.featureName,
      description: feeData.description,
      badge: feeData.badge,
    });
    if (res.data?.success && res.data?.data) {
      return res.data.data;
    }
    return feeData;
  } catch (err) {
    console.error('[WalletService] Lỗi khi cập nhật biểu phí vào DB:', err);
    throw err;
  }
};

