import React, { useState, useEffect } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import { getErrorMessage } from '../../services/apiClient';
import './PackageManageModal.css';

/** Các quyền lợi dạng bật/tắt — khớp cột boolean của bảng packages. */
const BENEFITS = [
  { key: 'canHighlightJobs', label: 'Làm nổi bật tin tuyển dụng' },
  { key: 'canPrioritizeJobs', label: 'Ưu tiên hiển thị tin lên đầu' },
  { key: 'canSearchCandidates', label: 'Tìm kiếm trong kho hồ sơ ứng viên' },
  { key: 'canDirectContact', label: 'Chủ động nhắn tin trực tiếp với ứng viên' },
];

const EMPTY_FORM = {
  name: '',
  price: '',
  durationDays: 30,
  jobPostLimit: 5,
  cvViewLimit: '',
  includedTokens: 0,
  canHighlightJobs: false,
  canPrioritizeJobs: false,
  canSearchCandidates: false,
  canDirectContact: false,
};

/** '' → null (không giới hạn), còn lại đổi sang số. */
const toLimit = (value) => (value === '' || value == null ? null : Number(value));

/**
 * Modal Thêm / Chỉnh sửa Gói dịch vụ Nhà tuyển dụng (lưu vào bảng packages).
 * Kiểm tra tính hợp lệ dữ liệu và thông báo lỗi bằng tiếng Việt.
 */
export const PackageManageModal = ({
  isOpen = false,
  onClose,
  onSave,
  initialData = null,
}) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name || '',
        price: initialData.price ?? initialData.priceVND ?? '',
        durationDays: initialData.durationDays ?? 30,
        jobPostLimit: initialData.jobPostLimit ?? '',
        cvViewLimit: initialData.cvViewLimit ?? '',
        includedTokens: initialData.includedTokens ?? 0,
        canHighlightJobs: Boolean(initialData.canHighlightJobs),
        canPrioritizeJobs: Boolean(initialData.canPrioritizeJobs),
        canSearchCandidates: Boolean(initialData.canSearchCandidates),
        canDirectContact: Boolean(initialData.canDirectContact),
      });
    } else {
      setFormData(EMPTY_FORM);
    }
    setErrors({});
  }, [initialData, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const setField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const newErrors = {};

    const name = formData.name.trim();
    if (name.length < 3 || name.length > 100) {
      newErrors.name = 'Tên gói dịch vụ phải từ 3 đến 100 ký tự';
    }

    const price = Number(formData.price);
    if (formData.price === '' || isNaN(price) || price <= 0) {
      newErrors.price = 'Giá bán phải là số hợp lệ và lớn hơn 0 ₫';
    }

    const duration = Number(formData.durationDays);
    if (formData.durationDays === '' || !Number.isInteger(duration) || duration <= 0) {
      newErrors.durationDays = 'Thời hạn sử dụng phải là số nguyên lớn hơn 0';
    }

    [
      ['jobPostLimit', 'Số tin đăng'],
      ['cvViewLimit', 'Số lượt xem CV'],
      ['includedTokens', 'Số token tặng kèm'],
    ].forEach(([key, label]) => {
      const value = formData[key];
      if (value !== '' && value != null && (!Number.isInteger(Number(value)) || Number(value) < 0)) {
        newErrors[key] = `${label} phải là số nguyên không âm`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSave?.({
        id: formData.id,
        name: formData.name.trim(),
        price: Number(formData.price),
        durationDays: Number(formData.durationDays),
        jobPostLimit: toLimit(formData.jobPostLimit),
        cvViewLimit: toLimit(formData.cvViewLimit),
        includedTokens: Number(formData.includedTokens || 0),
        canHighlightJobs: formData.canHighlightJobs,
        canPrioritizeJobs: formData.canPrioritizeJobs,
        canSearchCandidates: formData.canSearchCandidates,
        canDirectContact: formData.canDirectContact,
      });
      onClose?.();
    } catch (err) {
      setErrors({ submit: getErrorMessage(err) || 'Có lỗi xảy ra khi lưu gói dịch vụ' });
    } finally {
      setSubmitting(false);
    }
  };

  const numberField = (key, label, { placeholder, min = 0, step = 1, required = false, hint } = {}) => (
    <div className="pkg-form-group">
      <label className="pkg-form-label">
        {label} {required && <span className="required">*</span>}
      </label>
      <input
        type="number"
        min={min}
        step={step}
        className={`pkg-form-input ${errors[key] ? 'error' : ''}`}
        placeholder={placeholder}
        value={formData[key]}
        onChange={(e) => setField(key, e.target.value)}
      />
      {errors[key]
        ? <span className="pkg-form-error">{errors[key]}</span>
        : hint && <span style={{ fontSize: '12px', color: '#64748b' }}>{hint}</span>}
    </div>
  );

  return (
    <div className="pkg-modal-overlay" onClick={onClose}>
      <div className="pkg-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="pkg-modal-header">
          <h3 className="pkg-modal-title">
            {initialData ? 'Chỉnh sửa gói dịch vụ NTD' : 'Thêm mới gói dịch vụ NTD'}
          </h3>
          <button type="button" className="pkg-modal-close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="pkg-modal-body">
            <div className="pkg-form-group">
              <label className="pkg-form-label">
                Tên gói dịch vụ <span className="required">*</span>
              </label>
              <input
                type="text"
                maxLength={100}
                className={`pkg-form-input ${errors.name ? 'error' : ''}`}
                placeholder="VD: Gói Khởi Nghiệp, Gói Tăng Tốc..."
                value={formData.name}
                onChange={(e) => setField('name', e.target.value)}
              />
              {errors.name && <span className="pkg-form-error">{errors.name}</span>}
            </div>

            <div className="pkg-form-row">
              {numberField('price', 'Giá bán (VNĐ)', { placeholder: 'VD: 599000', step: 1000, required: true })}
              {numberField('durationDays', 'Thời hạn (Ngày)', { placeholder: 'VD: 30', min: 1, required: true })}
            </div>

            <div className="pkg-form-row">
              {numberField('jobPostLimit', 'Số tin đăng tối đa', { placeholder: 'VD: 5', hint: 'Để trống = không giới hạn' })}
              {numberField('cvViewLimit', 'Số lượt xem CV', { placeholder: 'VD: 50', hint: 'Để trống = không giới hạn' })}
            </div>

            <div className="pkg-form-row">
              {numberField('includedTokens', 'Token tặng kèm', { placeholder: 'VD: 0' })}
            </div>

            <div className="pkg-form-group">
              <label className="pkg-form-label">Quyền lợi của gói</label>
              <div className="pkg-form-row" style={{ flexWrap: 'wrap' }}>
                {BENEFITS.map(({ key, label }) => (
                  <label key={key} className="pkg-form-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData[key]}
                      onChange={(e) => setField(key, e.target.checked)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {errors.submit && <span className="pkg-form-error">{errors.submit}</span>}
          </div>

          <div className="pkg-modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <FiCheck />
              <span>{submitting ? 'Đang lưu...' : 'Lưu gói dịch vụ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
