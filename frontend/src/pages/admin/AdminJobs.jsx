import { useState } from 'react';
import { toast } from 'react-toastify';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { adminService } from '../../services/adminService';
import { getErrorMessage } from '../../services/apiClient';
import { usePagedList } from '../../hooks/usePagedList';
import { JOB_STATUS, toOptions } from '../../utils/statusLabels';
import { formatDate } from '../../utils/formatDate';
import { formatSalaryRange } from '../../utils/formatSalary';
import './AdminJobs.css';

export const AdminJobs = () => {
  const [status, setStatus] = useState('PENDING_REVIEW');
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const { rows, loading, error, keyword, setKeyword, reload, pagination } =
    usePagedList(adminService.getJobs, { status });

  const open = (job) => {
    setSelected(job);
    setReason('');
  };

  const review = async (approved) => {
    if (!approved && !reason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    setSaving(true);
    try {
      await adminService.reviewJob(selected.id, approved, approved ? null : reason.trim());
      toast.success(approved ? 'Đã duyệt tin, tin đã được đăng' : 'Đã từ chối tin tuyển dụng');
      setSelected(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const renderAiBadge = (row) => {
    const label = row.moderationLabel;
    const score = row.moderationScore ? Math.round(row.moderationScore * 100) : null;

    if (label === 'an_toan') {
      return (
        <span className="admin-ai-badge admin-ai-badge-safe" title="Tin an toàn, không phát hiện dấu hiệu vi phạm">
          <span>🟢</span>
          <span>An toàn</span>
          {score && <small>({score}%)</small>}
        </span>
      );
    }
    if (label === 'nghi_van') {
      return (
        <span className="admin-ai-badge admin-ai-badge-suspicious" title={row.moderationReasons || 'Có dấu hiệu nghi vấn cần lưu ý'}>
          <span>🟡</span>
          <span>Nghi vấn</span>
          {score && <small>({score}%)</small>}
        </span>
      );
    }
    if (label === 'nguy_co_cao') {
      return (
        <span className="admin-ai-badge admin-ai-badge-danger" title={row.moderationReasons || 'Cảnh báo: Nguy cơ lừa đảo hoặc vi phạm quy định cao'}>
          <span>🔴</span>
          <span>Nguy cơ cao</span>
          {score && <small>({score}%)</small>}
        </span>
      );
    }
    return (
      <span className="admin-ai-badge admin-ai-badge-unscanned" title="Chưa được gán nhãn qua mô hình AI">
        <span>⚪</span>
        <span>Chưa quét</span>
      </span>
    );
  };

  const columns = [
    { header: 'Tên công việc', accessor: 'title', width: '20%' },
    { header: 'Doanh nghiệp', accessor: 'companyName', width: '15%' },
    {
      header: 'Đánh giá AI (PhoBERT)',
      width: '16%',
      render: (row) => renderAiBadge(row),
    },
    { header: 'Địa điểm', accessor: 'location', width: '11%' },
    { header: 'Hồ sơ', render: (row) => <strong>{row.applicationCount}</strong>, width: '6%' },
    { header: 'Trạng thái', render: (row) => <StatusBadge status={JOB_STATUS[row.status]?.label} />, width: '11%' },
    { header: 'Ngày đăng', render: (row) => formatDate(row.createdAt), width: '10%' },
    {
      header: 'Thao tác',
      width: '11%',
      render: (row) => (
        <button className="btn btn-outline mgmt-btn" onClick={() => open(row)}>
          {row.status === 'PENDING_REVIEW' ? 'Duyệt' : 'Chi tiết'}
        </button>
      ),
    },
  ];

  const takeDown = async () => {
    if (!reason.trim()) {
      toast.error('Vui lòng nhập lý do gỡ tin');
      return;
    }
    if (!window.confirm(`Gỡ tin "${selected.title}"? Tin sẽ bị đóng và NTD sẽ thấy lý do.`)) return;
    setSaving(true);
    try {
      await adminService.takeDownJob(selected.id, reason.trim());
      toast.success('Đã gỡ tin tuyển dụng');
      setSelected(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const pending = selected?.status === 'PENDING_REVIEW';
  const showing = selected?.status === 'OPEN';

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Quản lý tin tuyển dụng</h2>
      </div>

      {error && <div className="mgmt-error">{error}</div>}

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        pagination={pagination}
        searchValue={keyword}
        onSearchChange={setKeyword}
        placeholder="Tìm theo tên công việc hoặc doanh nghiệp..."
        emptyText={status === 'PENDING_REVIEW' ? 'Không có tin nào đang chờ duyệt' : 'Không có dữ liệu'}
        filters={
          <select className="mgmt-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {toOptions(JOB_STATUS).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        }
      />

      <Modal
        isOpen={!!selected}
        title={selected?.title}
        width={680}
        onClose={() => setSelected(null)}
        footer={
          pending ? (
            <>
              <button className="btn btn-outline mgmt-btn-danger" disabled={saving} onClick={() => review(false)}>
                Từ chối
              </button>
              <button className="btn btn-primary" disabled={saving} onClick={() => review(true)}>
                Duyệt tin
              </button>
            </>
          ) : showing && (
            <button className="btn btn-outline mgmt-btn-danger" disabled={saving} onClick={takeDown}>
              Gỡ tin vi phạm
            </button>
          )
        }
      >
        {selected && (
          <>
            {selected.moderationLabel && (
              <div className={`admin-ai-mod-banner mod-${selected.moderationLabel}`}>
                <div className="admin-ai-mod-header">
                  <div className="admin-ai-mod-badge-wrap">
                    <span className="admin-ai-mod-icon">
                      {selected.moderationLabel === 'an_toan' ? '🛡️' : (selected.moderationLabel === 'nghi_van' ? '⚠️' : '🚨')}
                    </span>
                    <strong>
                      AI PhoBERT Đánh giá: {
                        selected.moderationLabel === 'an_toan' ? 'AN TOÀN' :
                        selected.moderationLabel === 'nghi_van' ? 'NGHI VẤN / CẦN LƯU Ý' : 'NGUY CƠ CAO (LỪA ĐẢO / VI PHẠM)'
                      }
                    </strong>
                    {selected.moderationScore && (
                      <span className="admin-ai-mod-score">
                        (Độ tin cậy: {Math.round(selected.moderationScore * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
                {selected.moderationReasons && (
                  <div className="admin-ai-mod-reasons">
                    <strong>Chi tiết phân tích & cảnh báo:</strong>
                    <p>{selected.moderationReasons}</p>
                  </div>
                )}
              </div>
            )}

            <dl className="mgmt-detail-grid">
              <dt>Doanh nghiệp</dt><dd>{selected.companyName}</dd>
              <dt>Trạng thái</dt><dd><StatusBadge status={JOB_STATUS[selected.status]?.label} /></dd>
              <dt>Đánh giá AI</dt><dd>{renderAiBadge(selected)}</dd>
              <dt>Địa điểm</dt><dd>{selected.location}</dd>
              <dt>Mức lương</dt><dd>{formatSalaryRange(selected.salaryMin, selected.salaryMax)}</dd>
              <dt>Cấp bậc</dt><dd>{selected.level || '—'}</dd>
              <dt>Hình thức</dt><dd>{selected.jobType || '—'}</dd>
              <dt>Số lượng</dt><dd>{selected.vacancies}</dd>
              <dt>Hạn nộp</dt><dd>{formatDate(selected.deadline)}</dd>
              <dt>Mô tả</dt><dd style={{ whiteSpace: 'pre-line' }}>{selected.description || '—'}</dd>
              <dt>Yêu cầu</dt><dd style={{ whiteSpace: 'pre-line' }}>{selected.requirements || '—'}</dd>
              {selected.rejectionReason && (<><dt>Lý do từ chối / gỡ</dt><dd>{selected.rejectionReason}</dd></>)}
            </dl>
            {pending && (
              <div className="mgmt-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label htmlFor="reject-reason" style={{ margin: 0 }}>Lý do từ chối (bắt buộc khi từ chối)</label>
                  {selected.moderationReasons && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ fontSize: 11, padding: '2px 8px', height: 'auto', cursor: 'pointer' }}
                      onClick={() => setReason(selected.moderationReasons)}
                      title="Tự động điền lý do vi phạm phát hiện bởi AI"
                    >
                      📋 Điền lý do từ AI
                    </button>
                  )}
                </div>
                <textarea id="reject-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
                  placeholder="VD: Mô tả công việc chưa rõ ràng, phát hiện thu phí ứng viên..." />
              </div>
            )}
            {showing && (
              <div className="mgmt-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label htmlFor="takedown-reason" style={{ margin: 0 }}>Lý do gỡ tin (bắt buộc khi gỡ)</label>
                  {selected.moderationReasons && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ fontSize: 11, padding: '2px 8px', height: 'auto', cursor: 'pointer' }}
                      onClick={() => setReason(selected.moderationReasons)}
                      title="Tự động điền lý do vi phạm phát hiện bởi AI"
                    >
                      📋 Điền lý do từ AI
                    </button>
                  )}
                </div>
                <textarea id="takedown-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
                  placeholder="VD: Tin có nội dung lừa đảo, thu phí ứng viên..." />
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  );
};
