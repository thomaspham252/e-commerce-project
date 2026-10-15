import { useState } from 'react';
import { toast } from 'react-toastify';
import { Lock, Unlock } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
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

  const columns = [
    { header: 'Họ tên / Tên DN', render: (row) => row.displayName || <span className="mgmt-muted">Chưa cập nhật</span> },
    { header: 'Email', accessor: 'email' },
    { header: 'Vai trò', render: (row) => USER_ROLE_LABELS[row.role] },
    { header: 'Trạng thái', render: (row) => <StatusBadge status={USER_STATUS_LABELS[row.status]} /> },
    { header: 'Ngày đăng ký', render: (row) => formatDate(row.createdAt) },
    {
      header: 'Thao tác',
      render: (row) =>
        row.role === 'ADMIN' ? null : row.status === 'LOCKED' ? (
          <button className="btn btn-outline mgmt-btn" disabled={busyId === row.id} onClick={() => toggleLock(row)}>
            <Unlock size={14} /> Mở khóa
          </button>
        ) : (
          <button className="btn btn-outline mgmt-btn mgmt-btn-danger" disabled={busyId === row.id} onClick={() => toggleLock(row)}>
            <Lock size={14} /> Khóa
          </button>
        ),
    },
  ];

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
    </>
  );
};
