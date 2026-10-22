import { useState } from 'react';
import { toast } from 'react-toastify';
import { Eye, EyeOff, ExternalLink, Trash2 } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { adminService } from '../../services/adminService';
import { getErrorMessage } from '../../services/apiClient';
import { usePagedList } from '../../hooks/usePagedList';
import { formatDate } from '../../utils/formatDate';
import '../../components/common/Modal.css';

/** Admin quản lý hồ sơ: xem CV của ứng viên, ẩn hồ sơ khỏi tìm kiếm của NTD, xóa CV chưa dùng ứng tuyển. */
export const AdminCvs = () => {
  const [busyId, setBusyId] = useState(null);
  const { rows, loading, error, keyword, setKeyword, reload, pagination } = usePagedList(adminService.getCvs);

  const run = async (id, action, successMessage) => {
    setBusyId(id);
    try {
      await action();
      toast.success(successMessage);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const toggleSearchable = (cv) => {
    const next = !cv.candidateSearchable;
    const action = next ? 'hiện lại' : 'ẩn';
    if (!window.confirm(`Bạn chắc chắn muốn ${action} hồ sơ của ${cv.candidateName} với nhà tuyển dụng?`)) return;
    run(cv.id, () => adminService.updateSearchable(cv.candidateId, next), `Đã ${action} hồ sơ của ${cv.candidateName}`);
  };

  const remove = (cv) => {
    if (!window.confirm(`Xóa CV "${cv.fileName || cv.fileUrl}" của ${cv.candidateName}? Thao tác không thể hoàn tác.`)) return;
    run(cv.id, () => adminService.deleteCv(cv.id), 'Đã xóa CV');
  };

  const columns = [
    {
      header: 'Tên file',
      width: '24%',
      render: (row) => (
        <>
          {row.fileName || <span className="mgmt-muted">Không có tên</span>}
          {row.isDefault && <span className="mgmt-muted"> · Mặc định</span>}
        </>
      ),
    },
    { header: 'Ứng viên', accessor: 'candidateName', width: '16%' },
    { header: 'Email', accessor: 'candidateEmail', width: '18%' },
    { header: 'Đã ứng tuyển', render: (row) => <strong>{row.applicationCount}</strong>, width: '9%' },
    {
      header: 'Hồ sơ',
      width: '10%',
      render: (row) => <StatusBadge status={row.candidateSearchable ? 'Hiển thị' : 'Đã ẩn'} />,
    },
    { header: 'Ngày tải lên', render: (row) => formatDate(row.uploadedAt), width: '10%' },
    {
      header: 'Thao tác',
      render: (row) => (
        <div className="mgmt-actions">
          <a className="btn btn-outline mgmt-btn" href={row.fileUrl} target="_blank" rel="noreferrer" title="Xem CV">
            <ExternalLink size={14} />
          </a>
          <button className="btn btn-outline mgmt-btn" disabled={busyId === row.id} onClick={() => toggleSearchable(row)}
            title={row.candidateSearchable ? 'Ẩn hồ sơ' : 'Hiện hồ sơ'}>
            {row.candidateSearchable ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <button className="btn btn-outline mgmt-btn mgmt-btn-danger" disabled={busyId === row.id || row.applicationCount > 0}
            onClick={() => remove(row)}
            title={row.applicationCount > 0 ? 'CV đã dùng để ứng tuyển, không thể xóa' : 'Xóa CV'}>
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Quản lý hồ sơ ứng viên</h2>
      </div>

      {error && <div className="mgmt-error">{error}</div>}

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        pagination={pagination}
        searchValue={keyword}
        onSearchChange={setKeyword}
        placeholder="Tìm theo tên file, tên hoặc email ứng viên..."
        emptyText="Chưa có CV nào"
      />
    </>
  );
};
