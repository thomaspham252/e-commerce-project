/** "2026-10-08T10:00:00" → "08/10/2026" */
export const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/** "2026-10-08T10:00:00" → "10:00 08/10/2026" */
export const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${formatDate(value)}`;
};

/** Ngày local dạng yyyy-MM-dd (không bị lệch múi giờ như toISOString). */
export const toIsoDate = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/** Tính khoảng thời gian tương đối: "Vừa đăng", "2 ngày trước", v.v. */
export const formatTimeAgo = (value) => {
  if (!value) return 'Mới đăng';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Mới đăng';
  const diffMs = Date.now() - d.getTime();
  if (diffMs < 0) return 'Vừa đăng';
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'Vừa đăng';
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} ngày trước`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} tháng trước`;
};
