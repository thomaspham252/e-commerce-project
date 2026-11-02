import React, { useState, useEffect } from 'react';
import {
  getEmployerPackages,
  savePackage,
  togglePackageStatus,
} from '../../services/employerPackageService.js';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../../services/apiClient';
import { PackageManageModal } from '../../components/admin/PackageManageModal.jsx';
import { DataTable } from '../../components/common/DataTable.jsx';
import { FiPlus, FiEdit2, FiCheck, FiX, FiCheckCircle, FiMinusCircle } from 'react-icons/fi';
import './AdminPackagesPage.css';

/**
 * Trang Quản lý Danh mục Gói dịch vụ Nhà tuyển dụng phía Admin.
 */
export const AdminPackagesPage = () => {
  const [packagesList, setPackagesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const data = await getEmployerPackages({ includeInactive: true });
      setPackagesList(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const handleCreateNew = () => {
    setEditingPackage(null);
    setModalOpen(true);
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setModalOpen(true);
  };

  const handleSavePackage = async (packageData) => {
    await savePackage(packageData);
    toast.success(packageData.id ? 'Đã cập nhật gói dịch vụ' : 'Đã thêm gói dịch vụ mới');
    await loadPackages();
  };

  const handleToggleStatus = async (pkg) => {
    try {
      const updated = await togglePackageStatus(pkg.id);
      toast.success(updated.isActive ? `Đã mở bán ${pkg.name}` : `Đã tạm ngưng ${pkg.name}`);
      await loadPackages();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const formatLimit = (value, unit) => (value == null ? 'Không giới hạn' : `${value} ${unit}`);

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const columns = [
    {
      header: 'Tên gói dịch vụ',
      accessor: 'name',
      render: (row) => {
        const benefits = [
          row.canHighlightJobs && 'Nổi bật tin',
          row.canPrioritizeJobs && 'Ưu tiên hiển thị',
          row.canSearchCandidates && 'Tìm ứng viên',
          row.includedTokens > 0 && `Tặng ${row.includedTokens} token`,
        ].filter(Boolean);
        return (
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{row.name}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
              {benefits.length === 0 && <span style={{ fontSize: '12px', color: '#94a3b8' }}>Gói cơ bản</span>}
              {benefits.map((label) => (
                <span
                  key={label}
                  style={{
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Giá bán',
      accessor: 'priceVND',
      render: (row) => (
        <span style={{ fontWeight: 600, color: '#059669', fontSize: '14px' }}>
          {formatVND(row.priceVND)}
        </span>
      ),
    },
    {
      header: 'Thời hạn',
      accessor: 'durationDays',
      render: (row) => <span>{row.durationDays} ngày</span>,
    },
    {
      header: 'Hạn mức tin',
      accessor: 'jobPostLimit',
      render: (row) => <span>{formatLimit(row.jobPostLimit, 'tin đăng')}</span>,
    },
    {
      header: 'Lượt xem CV',
      accessor: 'cvViewLimit',
      render: (row) => <span>{formatLimit(row.cvViewLimit, 'lượt')}</span>,
    },
    {
      header: 'Nhắn tin ứng viên',
      accessor: 'canDirectContact',
      render: (row) =>
        row.canDirectContact ? (
          <span style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
            <FiCheckCircle /> Có
          </span>
        ) : (
          <span style={{ color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
            <FiMinusCircle /> Không
          </span>
        ),
    },
    {
      header: 'Trạng thái',
      accessor: 'isActive',
      render: (row) => (
        <button
          type="button"
          className={`toggle-switch-btn ${row.isActive ? 'active' : 'inactive'}`}
          onClick={() => handleToggleStatus(row)}
          title="Bấm để bật hoặc tắt gói dịch vụ này"
        >
          {row.isActive ? <FiCheck /> : <FiX />}
          <span>{row.isActive ? 'Đang mở bán' : 'Đã tạm ngưng'}</span>
        </button>
      ),
    },
    {
      header: 'Thao tác',
      accessor: 'actions',
      render: (row) => (
        <div className="table-action-btns">
          <button
            type="button"
            className="action-icon-btn primary"
            onClick={() => handleEdit(row)}
            title="Chỉnh sửa thông tin gói"
          >
            <FiEdit2 size={13} />
            <span>Sửa</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-packages-page">
      <div className="packages-page-header">
        <div>
          <h2 className="packages-page-title">Quản lý Gói dịch vụ NTD</h2>
          <p className="packages-page-desc">
            Cấu hình danh mục gói cước tuyển dụng: giá bán, thời hạn, hạn mức tin đăng, lượt xem CV và quyền lợi.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleCreateNew}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <FiPlus size={16} />
          <span>Thêm gói dịch vụ mới</span>
        </button>
      </div>

      <div className="packages-table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Đang tải danh mục gói cước...
          </div>
        ) : (
          <DataTable columns={columns} data={packagesList} />
        )}
      </div>

      {/* Modal Thêm/Sửa gói */}
      <PackageManageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSavePackage}
        initialData={editingPackage}
      />
    </div>
  );
};
