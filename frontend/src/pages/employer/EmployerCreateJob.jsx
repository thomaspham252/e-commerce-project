import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JobForm } from '../../components/common/JobForm';
import { useEmployerPackage } from '../../context/EmployerPackageContext.jsx';
import { PackageLimitModal } from '../../components/employer/PackageLimitModal.jsx';
import { FiBriefcase } from 'react-icons/fi';

/**
 * Trang Đăng tin tuyển dụng mới của Nhà tuyển dụng.
 * Tích hợp kiểm tra hạn mức tin đăng của gói và hiển thị PackageLimitModal khi vượt giới hạn.
 */
export const EmployerCreateJob = () => {
  const navigate = useNavigate();
  const { subscription, checkPermission, incrementUsage } = useEmployerPackage();

  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [modalReason, setModalReason] = useState('LIMIT_REACHED');

  const handleSubmit = async (data) => {
    // Kiểm tra quyền hạn đăng tin của gói
    const perm = await checkPermission('POST_JOB');
    if (!perm.allowed) {
      setModalReason(perm.reason || 'LIMIT_REACHED');
      setLimitModalOpen(true);
      return;
    }

    console.log('Dữ liệu form:', data);
    await incrementUsage();
    alert('Đăng tin thành công! Tin của bạn đang chờ duyệt.');
    navigate('/employer/jobs');
  };

  const handleSimulateLimit = () => {
    setModalReason('LIMIT_REACHED');
    setLimitModalOpen(true);
  };

  return (
    <>
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <h2 className="page-title">Đăng tin tuyển dụng mới</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Điền thông tin chi tiết để thu hút ứng viên phù hợp nhất.
          </p>
        </div>

        {/* Thanh trạng thái hạn mức tin */}
        {subscription && (
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '13px',
            }}
          >
            <span style={{ color: '#475569' }}>
              <FiBriefcase style={{ color: '#2563eb', marginRight: '4px' }} />
              Gói: <strong>{subscription.packageName}</strong> (Đã dùng{' '}
              <strong>{subscription.usedJobPosts}/{subscription.maxJobPosts}</strong> tin)
            </span>
            <button
              type="button"
              onClick={handleSimulateLimit}
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
              title="Nhấn để thử nghiệm popup khi hết tin đăng"
            >
              Thử nghiệm báo hết hạn mức
            </button>
          </div>
        )}
      </div>

      <JobForm onSubmit={handleSubmit} isLoading={false} />

      {/* Modal cảnh báo giới hạn gói */}
      <PackageLimitModal
        isOpen={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        reason={modalReason}
        currentSubscription={subscription}
      />
    </>
  );
};
