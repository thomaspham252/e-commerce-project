import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { employerService } from '../../services/employerService';
import { getErrorMessage } from '../../services/apiClient';
import { usePagedList } from '../../hooks/usePagedList';
import { APPLICATION_STATUS, toOptions } from '../../utils/statusLabels';
import { formatDate, formatDateTime } from '../../utils/formatDate';

const ACTION_LABELS = {
  INVITED: 'Mời phỏng vấn',
  HIRED: 'Nhận việc',
  REJECTED: 'Từ chối',
};

const statusLabel = (s) => APPLICATION_STATUS[s]?.label || s;

/** Hộp thoại chi tiết hồ sơ + đổi trạng thái. Mở hồ sơ "Chờ xem" sẽ tự chuyển sang "Đang xem xét". */
const ApplicationDetailModal = ({ applicationId, onClose, onChanged }) => {
  const [detail, setDetail] = useState(null);
  const [target, setTarget] = useState('');
  const [note, setNote] = useState('');
  const [interviewAt, setInterviewAt] = useState('');
  const [interviewLocation, setInterviewLocation] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!applicationId) return;
    setDetail(null);
    setTarget('');
    employerService.getApplication(applicationId)
      .then((d) => {
        setDetail(d);
        onChanged(); // trạng thái có thể vừa chuyển sang VIEWED
      })
      .catch((err) => {
        toast.error(getErrorMessage(err));
        onClose();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  const submit = async () => {
    setSaving(true);
    try {
      const updated = await employerService.updateApplicationStatus(applicationId, {
        status: target,
        note: note.trim() || null,
        interviewAt: target === 'INVITED' && interviewAt ? `${interviewAt}:00` : null,
        interviewLocation: target === 'INVITED' ? interviewLocation.trim() || null : null,
      });
      toast.success(`Đã chuyển hồ sơ sang "${statusLabel(target)}"`);
      setDetail(updated);
      setTarget('');
      setNote('');
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const app = detail?.application;

  return (
    <Modal
      isOpen={!!applicationId}
      title={app ? `Hồ sơ: ${app.candidateName}` : 'Đang tải hồ sơ...'}
      width={680}
      onClose={onClose}
      footer={
        target && (
          <>
            <button className="btn btn-outline" disabled={saving} onClick={() => setTarget('')}>Hủy</button>
            <button
              className={`btn ${target === 'REJECTED' ? 'btn-outline mgmt-btn-danger' : 'btn-primary'}`}
              disabled={saving || (target === 'INVITED' && !interviewAt)}
              onClick={submit}
            >
              Xác nhận {ACTION_LABELS[target]?.toLowerCase()}
            </button>
          </>
        )
      }
    >
      {app && (
        <>
          <dl className="mgmt-detail-grid">
            <dt>Vị trí</dt><dd>{app.jobTitle}</dd>
            <dt>Trạng thái</dt><dd><StatusBadge status={statusLabel(app.status)} /></dd>
            <dt>Email</dt><dd><a href={`mailto:${app.candidateEmail}`}>{app.candidateEmail}</a></dd>
            <dt>Điện thoại</dt><dd>{app.candidatePhone || '—'}</dd>
            <dt>Ngày ứng tuyển</dt><dd>{formatDateTime(app.appliedAt)}</dd>
            <dt>CV</dt>
            <dd><a href={app.cvUrl} target="_blank" rel="noreferrer">{app.cvFileName || 'Xem CV'}</a></dd>
            <dt>Thư giới thiệu</dt><dd style={{ whiteSpace: 'pre-line' }}>{app.coverLetter || '—'}</dd>
          </dl>

          {detail.invitations.length > 0 && (
            <>
              <h4 style={{ marginBottom: 8 }}>Lịch phỏng vấn</h4>
              <ul className="mgmt-timeline">
                {detail.invitations.map((i) => (
                  <li key={i.id}>
                    {formatDateTime(i.scheduledAt)} {i.location && `· ${i.location}`} {i.notes && `· ${i.notes}`}
                  </li>
                ))}
              </ul>
            </>
          )}

          {detail.history.length > 0 && (
            <>
              <h4 style={{ marginBottom: 8 }}>Lịch sử xử lý</h4>
              <ul className="mgmt-timeline">
                {detail.history.map((h, idx) => (
                  <li key={idx}>
                    <span className="mgmt-muted">{formatDateTime(h.changedAt)}</span>{' '}
                    {h.fromStatus ? `${statusLabel(h.fromStatus)} → ` : ''}<strong>{statusLabel(h.toStatus)}</strong>
                    {h.note && <> · {h.note}</>}
                  </li>
                ))}
              </ul>
            </>
          )}

          {detail.nextStatuses.length > 0 && !target && (
            <div className="mgmt-actions">
              {detail.nextStatuses.filter((s) => ACTION_LABELS[s]).map((s) => (
                <button
                  key={s}
                  className={`btn btn-outline mgmt-btn ${s === 'REJECTED' ? 'mgmt-btn-danger' : ''}`}
                  onClick={() => setTarget(s)}
                >
                  {ACTION_LABELS[s]}
                </button>
              ))}
            </div>
          )}

          {target && (
            <div style={{ marginTop: 8 }}>
              {target === 'INVITED' && (
                <>
                  <div className="mgmt-field">
                    <label htmlFor="iv-at">Thời gian phỏng vấn *</label>
                    <input id="iv-at" type="datetime-local" value={interviewAt} onChange={(e) => setInterviewAt(e.target.value)} />
                  </div>
                  <div className="mgmt-field">
                    <label htmlFor="iv-loc">Địa điểm / link họp</label>
                    <input id="iv-loc" type="text" value={interviewLocation} onChange={(e) => setInterviewLocation(e.target.value)}
                      placeholder="VD: Tầng 5, 123 Cầu Giấy hoặc link Google Meet" />
                  </div>
                </>
              )}
              <div className="mgmt-field">
                <label htmlFor="app-note">Ghi chú</label>
                <textarea id="app-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
};

export const EmployerApplications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const jobId = searchParams.get('jobId') || '';
  const [status, setStatus] = useState('');
  const [jobs, setJobs] = useState([]);
  const [openId, setOpenId] = useState(null);
  const { rows, loading, error, keyword, setKeyword, reload, pagination } =
    usePagedList(employerService.getApplications, { jobId, status });

  useEffect(() => {
    employerService.getJobs({ size: 100 }).then((res) => setJobs(res.content)).catch(() => {});
  }, []);

  const setJobFilter = (value) => setSearchParams(value ? { jobId: value } : {});

  const columns = [
    { header: 'Ứng viên', width: '22%', render: (row) => (
      <>
        <div style={{ fontWeight: 600 }}>{row.candidateName}</div>
        <div className="mgmt-muted">{row.candidateEmail}</div>
      </>
    ) },
    { header: 'Vị trí ứng tuyển', accessor: 'jobTitle', width: '25%' },
    { header: 'Ngày ứng tuyển', width: '15%', render: (row) => formatDate(row.appliedAt) },
    { header: 'Trạng thái', width: '15%', render: (row) => <StatusBadge status={statusLabel(row.status)} /> },
    {
      header: 'Thao tác',
      width: '23%',
      render: (row) => (
        <div className="mgmt-actions">
          <a className="btn btn-outline mgmt-btn" href={row.cvUrl} target="_blank" rel="noreferrer">Xem CV</a>
          <button className="btn btn-outline mgmt-btn" onClick={() => setOpenId(row.id)}>Xử lý</button>
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
        placeholder="Tìm theo tên hoặc email ứng viên..."
        emptyText="Chưa có hồ sơ ứng tuyển nào"
        filters={
          <>
            <select className="mgmt-select" value={jobId} onChange={(e) => setJobFilter(e.target.value)}>
              <option value="">Tất cả tin tuyển dụng</option>
              {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
            <select className="mgmt-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              {toOptions(APPLICATION_STATUS).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </>
        }
      />

      <ApplicationDetailModal applicationId={openId} onClose={() => setOpenId(null)} onChanged={reload} />
    </>
  );
};
