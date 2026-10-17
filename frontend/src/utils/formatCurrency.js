/**
 * Tiện ích định dạng tiền tệ Việt Nam Đồng (VND).
 * Ví dụ: 100000 -> "100.000 ₫"
 *
 * @param {number|string} amount - Số tiền cần định dạng
 * @returns {string} Chuỗi tiền tệ đã được định dạng
 */
export const formatCurrencyVND = (amount) => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '0 ₫';
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(amount));
};
