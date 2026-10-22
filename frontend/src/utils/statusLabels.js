/**
 * Nhãn tiếng Việt + màu cho các mã trạng thái backend trả về.
 * Nhãn được chọn khớp với các case sẵn có trong StatusBadge.
 */

export const USER_ROLE_LABELS = {
  CANDIDATE: 'Ứng viên',
  EMPLOYER: 'Nhà tuyển dụng',
  ADMIN: 'Quản trị viên',
};

export const USER_STATUS_LABELS = {
  ACTIVE: 'Hoạt động',
  LOCKED: 'Bị khóa',
};

export const COMPANY_STATUS_LABELS = {
  PENDING: 'Chờ duyệt',
  VERIFIED: 'Đã xác minh',
  REJECTED: 'Từ chối',
};

export const JOB_STATUS = {
  DRAFT: { label: 'Bản nháp', color: '#94A3B8' },
  PENDING_REVIEW: { label: 'Chờ duyệt', color: '#F59E0B' },
  OPEN: { label: 'Đang tuyển', color: '#10B981' },
  CLOSED: { label: 'Đã đóng', color: '#6B7280' },
  REJECTED: { label: 'Từ chối', color: '#EF4444' },
  EXPIRED: { label: 'Hết hạn', color: '#A855F7' },
};

export const APPLICATION_STATUS = {
  PENDING: { label: 'Chờ xem', color: '#F59E0B' },
  VIEWED: { label: 'Đang xem xét', color: '#3B82F6' },
  INVITED: { label: 'Phỏng vấn', color: '#8B5CF6' },
  REJECTED: { label: 'Từ chối', color: '#EF4444' },
  HIRED: { label: 'Đã tuyển', color: '#10B981' },
};

export const toOptions = (map) =>
  Object.entries(map).map(([value, v]) => ({ value, label: typeof v === 'string' ? v : v.label }));
