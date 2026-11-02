import './StatusBadge.css';

/**
 * Component hiển thị huy hiệu trạng thái (Status Badge) cho hệ thống và các đơn thanh toán.
 */
export const StatusBadge = ({ status }) => {
  let badgeClass = 'badge-default';
  let label = status;

  switch (status?.toString().toLowerCase()) {
    // Trạng thái thành công
    case 'active':
    case 'approved':
    case 'đã duyệt':
    case 'hoạt động':
    case 'đã tuyển':
    case 'success':
    case 'đã thanh toán':
    case 'đang tuyển':
    case 'đã xác minh':
    case 'hiển thị':
      badgeClass = 'badge-success';
      label = status === 'SUCCESS' ? 'Đã thanh toán' : label;
      break;

    // Trạng thái chờ xử lý
    case 'pending':
    case 'chờ duyệt':
    case 'đang xem xét':
    case 'chờ thanh toán':
    case 'chờ xem':
      badgeClass = 'badge-warning';
      label = status === 'PENDING' ? 'Chờ thanh toán' : label;
      break;

    // Trạng thái sai số tiền (cần hỗ trợ)
    case 'wrong_amount':
    case 'sai số tiền':
      badgeClass = 'badge-wrong-amount';
      label = 'Sai số tiền';
      break;

    // Trạng thái hết hạn
    // Tin đã đóng / bản nháp: cùng màu xám với hết hạn nhưng giữ nguyên nhãn
    case 'đã đóng':
    case 'bản nháp':
    case 'đã ẩn':
      badgeClass = 'badge-expired';
      break;

    case 'expired':
    case 'hết hạn':
      badgeClass = 'badge-expired';
      label = 'Hết hạn';
      break;

    // Trạng thái huỷ / từ chối / khoá
    case 'locked':
    case 'đã khóa':
    case 'bị khóa':
    case 'rejected':
    case 'từ chối':
    case 'cancelled':
    case 'đã huỷ':
    case 'đã hủy':
    case 'failed':
    case 'thất bại':
      badgeClass = 'badge-danger';
      if (status === 'CANCELLED') label = 'Đã huỷ';
      if (status === 'FAILED') label = 'Thất bại';
      break;

    // Giao dịch đã hoàn tiền
    case 'refunded':
    case 'đã hoàn tiền':
      badgeClass = 'badge-default';
      if (status === 'REFUNDED') label = 'Đã hoàn tiền';
      break;

    // Trạng thái thông tin / phỏng vấn
    case 'shortlist':
    case 'phỏng vấn':
      badgeClass = 'badge-info';
      break;

    default:
      badgeClass = 'badge-default';
  }

  return <span className={`status-badge ${badgeClass}`}>{label}</span>;
};
