/**
 * Tiện ích sao chép văn bản vào bộ nhớ tạm (clipboard).
 * Có cơ chế dự phòng (fallback) bằng document.execCommand khi trình duyệt chặn quyền hoặc không hỗ trợ.
 *
 * @param {string} text - Nội dung cần sao chép
 * @returns {Promise<boolean>} Trả về true nếu thành công, false nếu thất bại
 */
export const copyToClipboard = async (text) => {
  if (!text) return false;

  // Cách 1: Sử dụng Clipboard API hiện đại
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(String(text));
      return true;
    } catch {
      // Nếu bị chặn quyền (permission error), chuyển sang cơ chế fallback phía dưới
    }
  }

  // Cách 2: Fallback tạo textarea ẩn và dùng execCommand
  try {
    const textArea = document.createElement('textarea');
    textArea.value = String(text);
    // Ẩn phần tử ngoài tầm nhìn của người dùng
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.select();
    textArea.setSelectionRange(0, 99999); // Dành cho thiết bị di động

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
};
