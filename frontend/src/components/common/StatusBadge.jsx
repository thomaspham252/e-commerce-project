import './StatusBadge.css';

export const StatusBadge = ({ status }) => {
  let badgeClass = 'badge-default';
  let label = status;

  switch (status?.toLowerCase()) {
    case 'active':
    case 'approved':
    case 'đã duyệt':
    case 'hoạt động':
    case 'đã tuyển':
      badgeClass = 'badge-success';
      break;
    case 'pending':
    case 'chờ duyệt':
    case 'đang xem xét':
      badgeClass = 'badge-warning';
      break;
    case 'locked':
    case 'đã khóa':
    case 'bị khóa':
    case 'rejected':
    case 'từ chối':
      badgeClass = 'badge-danger';
      break;
    case 'shortlist':
    case 'phỏng vấn':
      badgeClass = 'badge-info';
      break;
    default:
      badgeClass = 'badge-default';
  }

  return <span className={`status-badge ${badgeClass}`}>{label}</span>;
};
