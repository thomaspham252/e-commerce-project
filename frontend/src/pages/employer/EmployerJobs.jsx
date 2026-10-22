import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PlusCircle } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { employerService } from '../../services/employerService';
import { getErrorMessage } from '../../services/apiClient';
import { usePagedList } from '../../hooks/usePagedList';
import { JOB_STATUS, toOptions } from '../../utils/statusLabels';
import { formatDate } from '../../utils/formatDate';
import { formatSalaryRange } from '../../utils/formatSalary';
import '../../components/common/Modal.css';

const EDITABLE = ['DRAFT', 'PENDING_REVIEW', 'OPEN', 'REJECTED'];

export const EmployerJobs = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [busyId, setBusyId] = useState(null);
  const { rows, loading, error, keyword, setKeyword, reload, pagination } =
    usePagedList(employerService.getJobs, { status });

  const run = async (job, confirmText, action, successText) => {
    if (!window.confirm(confirmText)) return;
    setBusyId(job.id);
    try {
      await action(job.id);
      toast.success(successText);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    {
      header: 'Tên công việc',
      width: '28%',
      render: (row) => (
        <>
          <div style={{ fontWeight: 600 }}>{row.title}</div>
          {row.status === 'REJECTED' && row.rejectionReason && (
            <div className="mgmt-muted" style={{ color: '#B91C1C' }}>Lý do từ chối: {row.rejectionReason}</div>
          )}
        </>
      ),
    },
    {
      header: 'Ứng viên',
      width: '9%',
      render: (row) => (
        <button
          className="btn btn-outline mgmt-btn"
          title="Xem hồ sơ ứng tuyển của tin này"
          onClick={() => navigate(`/employer/applications?jobId=${row.id}`)}
        >
          {row.applicationCount}
        </button>
      ),
    },
    { header: 'Mức lương', width: '13%', render: (row) => formatSalaryRange(row.salaryMin, row.salaryMax) },
    { header: 'Trạng thái', width: '12%', render: (row) => <StatusBadge status={JOB_STATUS[row.status]?.label} /> },
    { header: 'Hạn nộp', width: '11%', render: (row) => formatDate(row.deadline) },
    {
      header: 'Thao tác',
      width: '27%',
      render: (row) => (
        <div className="mgmt-actions">
          {EDITABLE.includes(row.status) && (
            <button className="btn btn-outline mgmt-btn" disabled={busyId === row.id}
              onClick={() => navigate(`/employer/jobs/${row.id}/edit`)}>
              Sửa
            </button>
          )}
          {row.status !== 'CLOSED' && (
            <button className="btn btn-outline mgmt-btn" disabled={busyId === row.id}
              onClick={() => run(row, `Đóng tin "${row.title}"? Ứng viên sẽ không thể ứng tuyển nữa.`,
                employerService.closeJob, 'Đã đóng tin tuyển dụng')}>
              Đóng tin
            </button>
          )}
          {row.applicationCount === 0 && (
            <button className="btn btn-outline mgmt-btn mgmt-btn-danger" disabled={busyId === row.id}
              onClick={() => run(row, `Xóa vĩnh viễn tin "${row.title}"?`,
                employerService.deleteJob, 'Đã xóa tin tuyển dụng')}>
              Xóa
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Tin tuyển dụng của tôi</h2>
        <button
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => navigate('/employer/jobs/create')}
        >
          <PlusCircle size={18} /> Đăng tin mới
        </button>
      </div>

      {error && <div className="mgmt-error">{error}</div>}

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        pagination={pagination}
        searchValue={keyword}
        onSearchChange={setKeyword}
        placeholder="Tìm kiếm tin tuyển dụng của bạn..."
        emptyText="Bạn chưa có tin tuyển dụng nào"
        filters={
          <select className="mgmt-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {toOptions(JOB_STATUS).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        }
      />
    </>
  );
};
