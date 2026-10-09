import React, { useState, useEffect } from 'react';
import {
  getTokenPackages,
  saveTokenPackage,
  toggleTokenPackageStatus,
  getServiceFees,
  saveServiceFee,
} from '../../services/walletService.js';
import { TokenConfigModal } from '../../components/admin/TokenConfigModal.jsx';
import { DataTable } from '../../components/common/DataTable.jsx';
import { FiPlus, FiEdit2, FiCheck, FiX, FiLayers, FiZap } from 'react-icons/fi';
import './AdminTokenConfigPage.css';

/**
 * Trang Quản lý Cấu hình Token phía Admin.
 * Cho phép thiết lập danh mục Gói nạp Token và Biểu phí tiêu thụ Token cho ứng viên.
 */
export const AdminTokenConfigPage = () => {
  const [packages, setPackages] = useState([]);
  const [serviceFees, setServiceFees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('PACKAGE'); // 'PACKAGE' hoặc 'FEE'
  const [editingItem, setEditingItem] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pkgs, fees] = await Promise.all([getTokenPackages(), getServiceFees()]);
      setPackages(pkgs);
      setServiceFees(fees);
    } catch (err) {
      console.error('Lỗi tải dữ liệu cấu hình token:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePackage = () => {
    setEditingItem(null);
    setModalMode('PACKAGE');
    setModalOpen(true);
  };

  const handleEditPackage = (pkg) => {
    setEditingItem(pkg);
    setModalMode('PACKAGE');
    setModalOpen(true);
  };

  const handleEditFee = (fee) => {
    setEditingItem(fee);
    setModalMode('FEE');
    setModalOpen(true);
  };

  const handleToggleStatus = async (pkg) => {
    try {
      await toggleTokenPackageStatus(pkg.id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Lỗi cập nhật trạng thái gói token');
    }
  };

  const handleSaveModal = async (payload) => {
    if (modalMode === 'PACKAGE') {
      await saveTokenPackage(payload);
    } else {
      await saveServiceFee(payload);
    }
    await loadData();
  };

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const packageColumns = [
    {
      header: 'Gói Token',
      accessor: 'tokens',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{row.tokens} Token</span>
            {row.isPopular && (
              <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '11px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px' }}>
                Phổ biến
              </span>
            )}
            {row.badgeLabel && (
              <span style={{ background: '#ecfdf5', color: '#047857', fontSize: '11px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px' }}>
                {row.badgeLabel}
              </span>
            )}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            {row.description}
          </div>
        </div>
      ),
    },
    {
      header: 'Token Thưởng',
      accessor: 'bonusTokens',
      render: (row) => (
        <span style={{ color: row.bonusTokens > 0 ? '#059669' : '#64748b', fontWeight: 500 }}>
          +{row.bonusTokens} Token
        </span>
      ),
    },
    {
      header: 'Tổng nhận',
      accessor: 'totalTokens',
      render: (row) => (
        <span style={{ fontWeight: 700, color: '#2563eb' }}>
          {row.totalTokens} Token
        </span>
      ),
    },
    {
      header: 'Giá bán (VND)',
      accessor: 'priceVND',
      render: (row) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>
          {formatVND(row.priceVND)}
        </span>
      ),
    },
    {
      header: 'Trạng thái',
      accessor: 'isActive',
      render: (row) => (
        <button
          type="button"
          className={`toggle-switch-btn ${row.isActive !== false ? 'active' : 'inactive'}`}
          onClick={() => handleToggleStatus(row)}
        >
          {row.isActive !== false ? <FiCheck /> : <FiX />}
          <span>{row.isActive !== false ? 'Đang mở bán' : 'Tạm ngưng'}</span>
        </button>
      ),
    },
    {
      header: 'Thao tác',
      accessor: 'actions',
      render: (row) => (
        <button
          type="button"
          className="action-icon-btn primary"
          onClick={() => handleEditPackage(row)}
        >
          <FiEdit2 size={13} />
          <span>Sửa</span>
        </button>
      ),
    },
  ];

  const feeColumns = [
    {
      header: 'Mã tính năng',
      accessor: 'featureKey',
      render: (row) => (
        <code style={{ background: '#f1f5f9', padding: '3px 6px', borderRadius: '4px', fontSize: '12px', color: '#0f172a' }}>
          {row.featureKey}
        </code>
      ),
    },
    {
      header: 'Tên tiện ích / dịch vụ',
      accessor: 'featureName',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{row.featureName}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{row.description}</div>
        </div>
      ),
    },
    {
      header: 'Mức trừ Token / lượt',
      accessor: 'tokenCost',
      render: (row) => (
        <span style={{ fontWeight: 700, color: '#d97706', fontSize: '14px' }}>
          -{row.tokenCost} Token
        </span>
      ),
    },
    {
      header: 'Thao tác',
      accessor: 'actions',
      render: (row) => (
        <button
          type="button"
          className="action-icon-btn primary"
          onClick={() => handleEditFee(row)}
        >
          <FiEdit2 size={13} />
          <span>Điều chỉnh phí</span>
        </button>
      ),
    },
  ];

  return (
    <div className="admin-token-config-page">
      <div className="token-config-header">
        <div>
          <h2 className="token-config-title">Cấu hình Ví Token & Tiêu thụ Token</h2>
          <p className="token-config-desc">
            Quản trị danh mục gói nạp tiền lấy Token và biểu phí tiêu thụ tiện ích của Ứng viên.
          </p>
        </div>
      </div>

      {/* Phần 1: Danh sách các gói nạp token */}
      <div className="token-config-section">
        <div className="token-section-header">
          <div>
            <h3 className="token-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiLayers color="#2563eb" />
              <span>Danh mục Gói nạp Token (Ứng viên)</span>
            </h3>
            <p className="token-section-desc">
              Các mốc nạp token hiển thị trên trang Ví của ứng viên.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCreatePackage}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <FiPlus size={16} />
            <span>Thêm gói Token</span>
          </button>
        </div>

        <DataTable columns={packageColumns} data={packages} searchable={false} />
      </div>

      {/* Phần 2: Biểu phí trừ token các tiện ích */}
      <div className="token-config-section">
        <div className="token-section-header">
          <div>
            <h3 className="token-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiZap color="#d97706" />
              <span>Biểu phí Tiêu thụ Token của Tính năng ứng viên</span>
            </h3>
            <p className="token-section-desc">
              Số lượng Token bị trừ khi ứng viên sử dụng các quyền lợi và tiện ích đặc biệt trên hệ thống.
            </p>
          </div>
        </div>

        <DataTable columns={feeColumns} data={serviceFees} searchable={false} />
      </div>

      {/* Modal chỉnh sửa gói token hoặc biểu phí */}
      <TokenConfigModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveModal}
        initialData={editingItem}
        mode={modalMode}
      />
    </div>
  );
};
