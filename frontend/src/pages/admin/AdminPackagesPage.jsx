import React, { useState, useEffect } from 'react';
import {
  getEmployerPackages,
  savePackage,
  togglePackageStatus,
} from '../../services/employerPackageService.js';
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
      const data = await getEmployerPackages();
      setPackagesList(data);
    } catch (err) {
      console.error('Lỗi lấy danh sách gói:', err);
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
    await loadPackages();
  };

  const handleToggleStatus = async (pkg) => {
    try {
      await togglePackageStatus(pkg.id);
      await loadPackages();
    } catch (err) {
      alert(err.message || 'Lỗi cập nhật trạng thái gói');
    }
  };

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
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{row.name}</span>
            {row.isPopular && (
              <span
                style={{
                  background: '#fef3c7',
                  color: '#b45309',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                Nổi bật
              </span>
            )}
            {row.badge && (
              <span
                style={{
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                {row.badge}
              </span>
            )}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            {row.description || 'Chưa có mô tả'}
          </div>
        </div>
      ),
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
      accessor: 'maxJobPosts',
      render: (row) => <span>{row.maxJobPosts} tin đăng</span>,
    },
    {
      header: 'Chat Realtime',
      accessor: 'allowRealtimeChat',
      render: (row) =>
        row.allowRealtimeChat ? (
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
            Cấu hình danh mục gói cước tuyển dụng, định giá, số lượng tin đăng và tính năng Chat realtime.
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
