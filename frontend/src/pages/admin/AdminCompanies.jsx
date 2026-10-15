import { useState } from 'react';
import { toast } from 'react-toastify';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { adminService } from '../../services/adminService';
import { getErrorMessage } from '../../services/apiClient';
import { usePagedList } from '../../hooks/usePagedList';
import { COMPANY_STATUS_LABELS, toOptions } from '../../utils/statusLabels';
import { formatDate } from '../../utils/formatDate';

export const AdminCompanies = () => {
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const { rows, loading, error, keyword, setKeyword, reload, pagination } =
    usePagedList(adminService.getCompanies, { status });

  const verify = async (next) => {
    const action = next === 'VERIFIED' ? 'xác minh' : 'từ chối';
    if (!window.confirm(`Bạn chắc chắn muốn ${action} doanh nghiệp "${selected.name}"?`)) return;
    setSaving(true);
    try {
      await adminService.verifyCompany(selected.id, next);
      toast.success(`Đã ${action} doanh nghiệp ${selected.name}`);
      setSelected(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { header: 'Doanh nghiệp', accessor: 'name', width: '22%' },
    { header: 'Email chủ TK', accessor: 'ownerEmail', width: '20%' },
    { header: 'Mã số thuế', render: (row) => row.taxCode || '—', width: '13%' },
    { header: 'Địa chỉ', render: (row) => row.address || '—', width: '20%' },
    { header: 'Trạng thái', render: (row) => <StatusBadge status={COMPANY_STATUS_LABELS[row.verificationStatus]} />, width: '13%' },
    {
      header: 'Thao tác',
      width: '12%',
      render: (row) => (
        <button className="btn btn-outline mgmt-btn" onClick={() => setSelected(row)}>
          {row.verificationStatus === 'PENDING' ? 'Xét duyệt' : 'Chi tiết'}
        </button>
      ),
    },
  ];

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Quản lý doanh nghiệp</h2>
      </div>

      {error && <div className="mgmt-error">{error}</div>}

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        pagination={pagination}
        searchValue={keyword}
        onSearchChange={setKeyword}
        placeholder="Tìm theo tên, email, mã số thuế..."
        filters={
          <select className="mgmt-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {toOptions(COMPANY_STATUS_LABELS).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        }
      />

      <Modal
        isOpen={!!selected}
        title={selected?.name}
        onClose={() => setSelected(null)}
        footer={
          selected && (
            <>
              {selected.verificationStatus !== 'REJECTED' && (
                <button className="btn btn-outline mgmt-btn-danger" disabled={saving} onClick={() => verify('REJECTED')}>
                  Từ chối
                </button>
              )}
              {selected.verificationStatus !== 'VERIFIED' && (
                <button className="btn btn-primary" disabled={saving} onClick={() => verify('VERIFIED')}>
                  Xác minh
                </button>
              )}
            </>
          )
        }
      >
        {selected && (
          <dl className="mgmt-detail-grid">
            <dt>Trạng thái</dt><dd><StatusBadge status={COMPANY_STATUS_LABELS[selected.verificationStatus]} /></dd>
            <dt>Tên pháp lý</dt><dd>{selected.legalName || '—'}</dd>
            <dt>Mã số thuế</dt><dd>{selected.taxCode || '—'}</dd>
            <dt>Chủ tài khoản</dt><dd>{selected.ownerEmail}</dd>
            <dt>Ngành nghề</dt><dd>{selected.industry || '—'}</dd>
            <dt>Quy mô</dt><dd>{selected.size || '—'}</dd>
            <dt>Địa chỉ</dt><dd>{selected.address || '—'}</dd>
            <dt>Website</dt><dd>{selected.website || '—'}</dd>
            <dt>Giấy phép KD</dt>
            <dd>
              {selected.businessLicenseUrl
                ? <a href={selected.businessLicenseUrl} target="_blank" rel="noreferrer">Xem giấy phép</a>
                : 'Chưa cung cấp'}
            </dd>
            <dt>Ngày xác minh</dt><dd>{formatDate(selected.verifiedAt)}</dd>
            <dt>Giới thiệu</dt><dd>{selected.description || '—'}</dd>
          </dl>
        )}
      </Modal>
    </>
  );
};
