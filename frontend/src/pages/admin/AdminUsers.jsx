import { useState } from 'react';
import { toast } from 'react-toastify';
import { Lock, Unlock } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { adminService } from '../../services/adminService';
import { getErrorMessage } from '../../services/apiClient';
import { usePagedList } from '../../hooks/usePagedList';
import { USER_ROLE_LABELS, USER_STATUS_LABELS, toOptions } from '../../utils/statusLabels';
import { formatDate } from '../../utils/formatDate';
import '../../components/common/Modal.css';

export const AdminUsers = () => {
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [detail, setDetail] = useState(null);
  const { rows, loading, error, keyword, setKeyword, reload, pagination } =
    usePagedList(adminService.getUsers, { role, status });

  const toggleLock = async (user) => {
    const next = user.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
    const action = next === 'LOCKED' ? 'khóa' : 'mở khóa';
    if (!window.confirm(`Bạn chắc chắn muốn ${action} tài khoản ${user.email}?`)) return;
    setBusyId(user.id);
    try {
      await adminService.updateUserStatus(user.id, next);
      toast.success(`Đã ${action} tài khoản ${user.email}`);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const openDetail = async (user) => {
    setDetail({ ...user, loading: true });
    try {
      setDetail(await adminService.getUser(user.id));
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDetail(null);
    }
  };

  const toggleSearchable = async () => {
    const next = !detail.searchable;
    try {
      await adminService.updateSearchable(detail.id, next);
      toast.success(next ? 'Đã hiện lại hồ sơ ứng viên' : 'Đã ẩn hồ sơ ứng viên khỏi nhà tuyển dụng');
      setDetail({ ...detail, searchable: next });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const columns = [
    { header: 'Họ tên / Tên DN', render: (row) => row.displayName || <span className="mgmt-muted">Chưa cập nhật</span> },
    { header: 'Email', accessor: 'email' },
    { header: 'Vai trò', render: (row) => USER_ROLE_LABELS[row.role] },
    { header: 'Trạng thái', render: (row) => <StatusBadge status={USER_STATUS_LABELS[row.status]} /> },
    { header: 'Ngày đăng ký', render: (row) => formatDate(row.createdAt) },
    {
      header: 'Thao tác',
      render: (row) => (
        <div className="mgmt-actions">
          <button className="btn btn-outline mgmt-btn" onClick={() => openDetail(row)}>Chi tiết</button>
          {row.role === 'ADMIN' ? null : row.status === 'LOCKED' ? (
            <button className="btn btn-outline mgmt-btn" disabled={busyId === row.id} onClick={() => toggleLock(row)}>
              <Unlock size={14} /> Mở khóa
            </button>
          ) : (
            <button className="btn btn-outline mgmt-btn mgmt-btn-danger" disabled={busyId === row.id} onClick={() => toggleLock(row)}>
              <Lock size={14} /> Khóa
            </button>
          )}
        </div>
      ),
    },
  ];

  const isCandidate = detail?.role === 'CANDIDATE';
  const isEmployer = detail?.role === 'EMPLOYER';

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Quản lý người dùng</h2>
      </div>

      {error && <div className="mgmt-error">{error}</div>}

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        pagination={pagination}
        searchValue={keyword}
        onSearchChange={setKeyword}
        placeholder="Tìm theo tên hoặc email..."
        filters={
          <>
            <select className="mgmt-select" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">Tất cả vai trò</option>
              {toOptions(USER_ROLE_LABELS).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select className="mgmt-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              {toOptions(USER_STATUS_LABELS).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </>
        }
      />

      <Modal
        isOpen={!!detail}
        title={detail?.displayName || detail?.email}
        width={600}
        onClose={() => setDetail(null)}
        footer={
          isCandidate && !detail.loading && detail.searchable !== null && (
            <button className={`btn btn-outline ${detail.searchable ? 'mgmt-btn-danger' : ''}`} onClick={toggleSearchable}>
              {detail.searchable ? 'Ẩn hồ sơ khỏi NTD' : 'Hiện lại hồ sơ'}
            </button>
          )
        }
      >
        {detail?.loading ? (
          <div className="mgmt-muted">Đang tải...</div>
        ) : detail && (
          <dl className="mgmt-detail-grid">
            <dt>Email</dt><dd>{detail.email}</dd>
            <dt>Vai trò</dt><dd>{USER_ROLE_LABELS[detail.role]}</dd>
            <dt>Trạng thái</dt><dd><StatusBadge status={USER_STATUS_LABELS[detail.status]} /></dd>
            <dt>Ngày đăng ký</dt><dd>{formatDate(detail.createdAt)}</dd>
            {isCandidate && (
              <>
                <dt>Số điện thoại</dt><dd>{detail.phone || '—'}</dd>
                <dt>Ngày sinh</dt><dd>{detail.dob ? formatDate(detail.dob) : '—'}</dd>
                <dt>Địa chỉ</dt><dd>{detail.address || '—'}</dd>
                <dt>Giới thiệu</dt><dd style={{ whiteSpace: 'pre-line' }}>{detail.summary || '—'}</dd>
                <dt>Hồ sơ</dt>
                <dd>{detail.searchable === null ? '—' : <StatusBadge status={detail.searchable ? 'Hiển thị' : 'Đã ẩn'} />}</dd>
                <dt>Số CV</dt><dd>{detail.cvCount}</dd>
                <dt>Đơn ứng tuyển</dt><dd>{detail.applicationCount}</dd>
              </>
            )}
            {isEmployer && (
              <>
                <dt>Doanh nghiệp</dt><dd>{detail.companyName || 'Chưa tạo hồ sơ doanh nghiệp'}</dd>
                <dt>Địa chỉ</dt><dd>{detail.address || '—'}</dd>
                <dt>Tin đã đăng</dt><dd>{detail.jobCount}</dd>
              </>
            )}
          </dl>
        )}
      </Modal>
    </>
  );
};
