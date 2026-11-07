/**
 * Cấu hình hằng số bảng giá tĩnh của 3 gói combo tiện ích ứng tuyển JobViet.
 * Tuân thủ nguyên tắc: Nội dung bảng giá là cố định trên giao diện, không lấy từ DB.
 * Số token tiết kiệm và tiền quy đổi VNĐ được tính toán tự động bằng hàm tiện ích.
 */

export const UTILITY_COMBOS_CONFIG = [
  {
    id: 'COMBO_HIGHLIGHT',
    name: 'Nổi bật',
    badge: 'Phổ biến',
    priceToken: 30,
    originalPriceToken: 45,
    benefits: [
      'Đẩy CV 72h',
      'Huy hiệu nổi bật',
    ],
    isFeatured: false,
    actionButtonColor: 'primary',
  },
  {
    id: 'COMBO_QUICK_CONTACT',
    name: 'Liên hệ nhanh',
    badge: 'Hiệu quả',
    priceToken: 50,
    originalPriceToken: 75,
    benefits: [
      'Đẩy CV 72h',
      'Huy hiệu nổi bật',
      'Mở khóa liên hệ NTD (chat tối đa 3 công ty)',
    ],
    isFeatured: true,
    actionButtonColor: 'black', // Thẻ ở giữa làm nổi bật với nút màu đen
  },
  {
    id: 'COMBO_COMPREHENSIVE',
    name: 'Toàn diện',
    badge: 'Ưu tiên',
    priceToken: 90,
    originalPriceToken: 110,
    benefits: [
      'Đẩy CV 72h',
      'Huy hiệu nổi bật',
      'Ưu tiên hiển thị',
      'Mở khóa liên hệ NTD (chat tối đa 3 công ty)',
      'AI Resume Score',
    ],
    isFeatured: false,
    actionButtonColor: 'primary',
  },
];

/**
 * Tính số token tiết kiệm tự động: Giá gốc - Giá combo
 * @param {object} combo 
 * @returns {number}
 */
export const calculateSavings = (combo) => {
  if (!combo || typeof combo.originalPriceToken !== 'number' || typeof combo.priceToken !== 'number') {
    return 0;
  }
  return combo.originalPriceToken - combo.priceToken;
};

/**
 * Quy đổi giá Token sang giá tương đương VNĐ (1 Token = 1.000 đ)
 * @param {number} token 
 * @returns {number}
 */
export const convertTokenToVnd = (token) => {
  return (token || 0) * 1000;
};

/**
 * Định dạng số tiền VNĐ hiển thị (ví dụ: 50.000 đ)
 * @param {number} amount 
 * @returns {string}
 */
export const formatVnd = (amount) => {
  return `${new Intl.NumberFormat('vi-VN').format(amount || 0)} đ`;
};

