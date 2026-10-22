import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { JobForm } from '../../components/common/JobForm';
import { formValuesToJob, jobToFormValues } from '../../utils/jobFormValues';
import { useEmployerPackage } from '../../context/EmployerPackageContext.jsx';
import { PackageLimitModal } from '../../components/employer/PackageLimitModal.jsx';
import { employerService } from '../../services/employerService';
import { getErrorMessage } from '../../services/apiClient';
import { FiBriefcase } from 'react-icons/fi';
import '../../components/common/Modal.css';

/**
 * Trang Đăng tin / Sửa tin tuyển dụng của Nhà tuyển dụng (/employer/jobs/create, /employer/jobs/:id/edit).
 * Đăng tin mới: kiểm tra hạn mức tin của gói (PackageLimitModal) rồi gửi backend; tin vào trạng thái chờ duyệt.
 * Sửa tin: tin sẽ quay về chờ duyệt lại.
 */
export const EmployerCreateJob = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { subscription, checkPermission, incrementUsage } = useEmployerPackage();

  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [modalReason, setModalReason] = useState('LIMIT_REACHED');
  const [initialData, setInitialData] = useState(null);
  const [company, setCompany] = useState(undefined);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      employerService.getJob(id)
        .then((job) => setInitialData(jobToFormValues(job)))
        .catch((err) => setError(getErrorMessage(err)));
    } else {
      employerService.getCompany()
        .then(setCompany)
        .catch((err) => setError(getErrorMessage(err)));
    }
  }, [id, isEdit]);

  const handleSubmit = async (data) => {
    if (!isEdit) {
      // Kiểm tra quyền hạn đăng tin của gói
      const perm = await checkPermission('POST_JOB');
      if (!perm.allowed) {
        setModalReason(perm.reason || 'LIMIT_REACHED');
        setLimitModalOpen(true);
        return;
      }
    }

    setSaving(true);
    try {
      if (isEdit) {
        await employerService.updateJob(id, formValuesToJob(data));
        toast.success('Đã cập nhật tin. Tin sẽ được admin duyệt lại.');
      } else {
        await employerService.createJob(formValuesToJob(data));
        await incrementUsage();
        toast.success('Đăng tin thành công! Tin của bạn đang chờ duyệt.');
      }
      navigate('/employer/jobs');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const companyBlocked = !isEdit && company !== undefined && company?.verificationStatus !== 'VERIFIED';

  const handleSimulateLimit = () => {
    setModalReason('LIMIT_REACHED');
    setLimitModalOpen(true);
  };

  return (
    <>
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <h2 className="page-title">{isEdit ? 'Sửa tin tuyển dụng' : 'Đăng tin tuyển dụng mới'}</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Điền thông tin chi tiết để thu hút ứng viên phù hợp nhất.
          </p>
        </div>

        {/* Thanh trạng thái hạn mức tin */}
        {!isEdit && subscription && (
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

      {error && <div className="mgmt-error">{error}</div>}

      {companyBlocked && (
        <div className="mgmt-error">
          {company === null
            ? 'Bạn cần tạo hồ sơ doanh nghiệp trước khi đăng tin. '
            : company.verificationStatus === 'REJECTED'
              ? 'Hồ sơ doanh nghiệp bị từ chối xác minh, hãy cập nhật lại để được đăng tin. '
              : 'Doanh nghiệp đang chờ admin xác minh, bạn sẽ đăng tin được sau khi được xác minh. '}
          <Link to="/employer/company">Đi tới hồ sơ doanh nghiệp</Link>
        </div>
      )}

      {(!isEdit || initialData) && !companyBlocked && (
        <JobForm
          key={id || 'new'}
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/employer/jobs')}
          isLoading={saving}
        />
      )}

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
