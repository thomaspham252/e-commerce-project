import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { StatusBadge } from '../../components/common/StatusBadge';
import { employerService } from '../../services/employerService';
import { getErrorMessage } from '../../services/apiClient';
import { COMPANY_STATUS_LABELS } from '../../utils/statusLabels';
import '../../components/common/JobForm.css';
import '../../components/common/Modal.css';

const FIELDS = ['name', 'legalName', 'taxCode', 'industry', 'size', 'website', 'address',
  'logo', 'businessLicenseUrl', 'description'];

const STATUS_HINT = {
  PENDING: 'Hồ sơ đang chờ admin xác minh. Bạn sẽ đăng tin được sau khi được xác minh.',
  VERIFIED: 'Doanh nghiệp đã được xác minh. Lưu ý: đổi tên pháp lý, mã số thuế hoặc giấy phép sẽ phải xác minh lại.',
  REJECTED: 'Hồ sơ bị từ chối xác minh. Hãy cập nhật thông tin chính xác và lưu lại để gửi xác minh lại.',
};

/** NTD tạo / cập nhật hồ sơ doanh nghiệp (/employer/company). */
export const EmployerCompanyPage = () => {
  const [company, setCompany] = useState(undefined);
  const [error, setError] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    employerService.getCompany()
      .then((c) => {
        setCompany(c);
        if (c) reset(Object.fromEntries(FIELDS.map((f) => [f, c[f] ?? ''])));
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, [reset]);

  const onSubmit = async (data) => {
    try {
      const saved = await employerService.saveCompany(data);
      setCompany(saved);
      toast.success(company ? 'Đã cập nhật hồ sơ doanh nghiệp' : 'Đã tạo hồ sơ doanh nghiệp, vui lòng chờ admin xác minh');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">Hồ sơ doanh nghiệp</h2>
          {company && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>
              <StatusBadge status={COMPANY_STATUS_LABELS[company.verificationStatus]} />{' '}
              {STATUS_HINT[company.verificationStatus]}
            </p>
          )}
          {company === null && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>
              Bạn chưa có hồ sơ doanh nghiệp. Tạo hồ sơ để admin xác minh trước khi đăng tin.
            </p>
          )}
        </div>
      </div>

      {error && <div className="mgmt-error">{error}</div>}

      {company !== undefined && (
        <form className="job-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-section">
            <h3 className="section-title">Thông tin chung</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Tên doanh nghiệp <span className="required">*</span></label>
                <input className={errors.name ? 'error' : ''}
                  {...register('name', { required: 'Vui lòng nhập tên doanh nghiệp' })} />
                {errors.name && <span className="error-message">{errors.name.message}</span>}
              </div>
              <div className="form-group">
                <label>Ngành nghề</label>
                <input placeholder="VD: IT - Phần mềm" {...register('industry')} />
              </div>
            </div>
            <div className="form-row three-cols">
              <div className="form-group">
                <label>Quy mô</label>
                <select {...register('size')}>
                  <option value="">Chọn quy mô</option>
                  <option value="1-9">1 - 9 nhân viên</option>
                  <option value="10-49">10 - 49 nhân viên</option>
                  <option value="50-99">50 - 99 nhân viên</option>
                  <option value="100-499">100 - 499 nhân viên</option>
                  <option value="500-999">500 - 999 nhân viên</option>
                  <option value="1000+">Trên 1000 nhân viên</option>
                </select>
              </div>
              <div className="form-group">
                <label>Website</label>
                <input placeholder="https://..." {...register('website')} />
              </div>
              <div className="form-group">
                <label>Logo (URL)</label>
                <input placeholder="https://..." {...register('logo')} />
              </div>
            </div>
            <div className="form-group full-width">
              <label>Địa chỉ</label>
              <input {...register('address')} />
            </div>
            <div className="form-group full-width">
              <label>Giới thiệu doanh nghiệp</label>
              <textarea rows="4" {...register('description')}></textarea>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Thông tin pháp lý (dùng để xác minh)</h3>
            <div className="form-row three-cols">
              <div className="form-group">
                <label>Tên pháp lý</label>
                <input placeholder="Công ty TNHH ..." {...register('legalName')} />
              </div>
              <div className="form-group">
                <label>Mã số thuế</label>
                <input className={errors.taxCode ? 'error' : ''} placeholder="10 chữ số"
                  {...register('taxCode', {
                    pattern: { value: /^(\d{10}(-\d{3})?)?$/, message: 'Mã số thuế gồm 10 số (hoặc 10 số-3 số)' },
                  })} />
                {errors.taxCode && <span className="error-message">{errors.taxCode.message}</span>}
              </div>
              <div className="form-group">
                <label>Giấy phép kinh doanh (URL)</label>
                <input placeholder="https://..." {...register('businessLicenseUrl')} />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : company ? 'Lưu thay đổi' : 'Tạo hồ sơ doanh nghiệp'}
            </button>
          </div>
        </form>
      )}
    </>
  );
};
