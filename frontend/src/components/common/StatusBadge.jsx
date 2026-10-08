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
      badgeClass = 'badge-success';
      label = status === 'SUCCESS' ? 'Đã thanh toán' : label;
      break;

    // Trạng thái chờ xử lý
    case 'pending':
    case 'chờ duyệt':
    case 'đang xem xét':
    case 'chờ thanh toán':
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
      badgeClass = 'badge-danger';
      label = status === 'CANCELLED' ? 'Đã huỷ' : label;
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
