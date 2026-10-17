import React, { useState, useEffect } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import './PackageManageModal.css';

/**
 * Modal Thêm / Chỉnh sửa Gói dịch vụ Nhà tuyển dụng.
 * Kiểm tra tính hợp lệ dữ liệu và thông báo lỗi bằng tiếng Việt.
 */
export const PackageManageModal = ({
  isOpen = false,
  onClose,
  onSave,
  initialData = null,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    priceVND: '',
    durationDays: 30,
    maxJobPosts: 5,
    allowRealtimeChat: true,
    isPopular: false,
    badge: '',
    description: '',
    featuresText: '',
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name || '',
        priceVND: initialData.priceVND ?? '',
        durationDays: initialData.durationDays ?? 30,
        maxJobPosts: initialData.maxJobPosts ?? 5,
        allowRealtimeChat: Boolean(initialData.allowRealtimeChat),
        isPopular: Boolean(initialData.isPopular),
        badge: initialData.badge || '',
        description: initialData.description || '',
        featuresText: (initialData.features || []).join('\n'),
        isActive: initialData.isActive !== false,
      });
    } else {
      setFormData({
        name: '',
        priceVND: '',
        durationDays: 30,
        maxJobPosts: 5,
        allowRealtimeChat: true,
        isPopular: false,
        badge: '',
        description: '',
        featuresText: 'Đăng tin tuyển dụng tiêu chuẩn\nTìm kiếm và lọc hồ sơ ứng viên\nChat trao đổi realtime với ứng viên',
        isActive: true,
      });
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

  const validate = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = 'Tên gói dịch vụ phải có tối thiểu 3 ký tự';
    }

    const price = Number(formData.priceVND);
    if (formData.priceVND === '' || isNaN(price) || price <= 0) {
      newErrors.priceVND = 'Giá bán phải là số hợp lệ và lớn hơn 0 ₫';
    }

    const duration = Number(formData.durationDays);
    if (formData.durationDays === '' || isNaN(duration) || duration <= 0) {
      newErrors.durationDays = 'Thời hạn sử dụng phải lớn hơn 0 ngày';
    }

    const posts = Number(formData.maxJobPosts);
    if (formData.maxJobPosts === '' || isNaN(posts) || posts < 0) {
      newErrors.maxJobPosts = 'Số lượng tin đăng không được là số âm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const features = formData.featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        priceVND: Number(formData.priceVND),
        durationDays: Number(formData.durationDays),
        maxJobPosts: Number(formData.maxJobPosts),
        features: features.length > 0 ? features : [`Đăng tối đa ${formData.maxJobPosts} tin`],
      };
      delete payload.featuresText;

      await onSave?.(payload);
      onClose?.();
    } catch (err) {
      alert(err.message || 'Có lỗi xảy ra khi lưu gói dịch vụ');
    } finally {
      setSubmitting(false);
    }
  };

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
                className={`pkg-form-input ${errors.name ? 'error' : ''}`}
                placeholder="VD: Gói Khởi Nghiệp, Gói Tăng Tốc..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <span className="pkg-form-error">{errors.name}</span>}
            </div>

            <div className="pkg-form-row">
              <div className="pkg-form-group">
                <label className="pkg-form-label">
                  Giá bán (VNĐ) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  className={`pkg-form-input ${errors.priceVND ? 'error' : ''}`}
                  placeholder="VD: 599000"
                  value={formData.priceVND}
                  onChange={(e) => setFormData({ ...formData, priceVND: e.target.value })}
                />
                {errors.priceVND && <span className="pkg-form-error">{errors.priceVND}</span>}
              </div>

              <div className="pkg-form-group">
                <label className="pkg-form-label">
                  Thời hạn (Ngày) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  className={`pkg-form-input ${errors.durationDays ? 'error' : ''}`}
                  placeholder="VD: 30"
                  value={formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                />
                {errors.durationDays && <span className="pkg-form-error">{errors.durationDays}</span>}
              </div>
            </div>

            <div className="pkg-form-row">
              <div className="pkg-form-group">
                <label className="pkg-form-label">
                  Số tin đăng tối đa <span className="required">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className={`pkg-form-input ${errors.maxJobPosts ? 'error' : ''}`}
                  placeholder="VD: 5"
                  value={formData.maxJobPosts}
                  onChange={(e) => setFormData({ ...formData, maxJobPosts: e.target.value })}
                />
                {errors.maxJobPosts && <span className="pkg-form-error">{errors.maxJobPosts}</span>}
              </div>

              <div className="pkg-form-group">
                <label className="pkg-form-label">Huy hiệu nổi bật (Badge)</label>
                <input
                  type="text"
                  className="pkg-form-input"
                  placeholder="VD: Phổ biến nhất, Tiết kiệm 20%"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                />
              </div>
            </div>

            <div className="pkg-form-group">
              <label className="pkg-form-label">Mô tả ngắn</label>
              <input
                type="text"
                className="pkg-form-input"
                placeholder="VD: Phù hợp doanh nghiệp tuyển dụng quy mô nhỏ và vừa"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="pkg-form-group">
              <label className="pkg-form-label">Danh sách tính năng / quyền lợi (Mỗi dòng 1 mục)</label>
              <textarea
                rows="4"
                className="pkg-form-textarea"
                placeholder="Đăng tối đa 5 tin tuyển dụng&#10;Hiển thị ưu tiên trên trang chủ&#10;Hỗ trợ kỹ thuật 24/7"
                value={formData.featuresText}
                onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
              />
            </div>

            <div className="pkg-form-row">
              <label className="pkg-form-checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.allowRealtimeChat}
                  onChange={(e) => setFormData({ ...formData, allowRealtimeChat: e.target.checked })}
                />
                <span>Hỗ trợ Chat Realtime với ứng viên</span>
              </label>

              <label className="pkg-form-checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                />
                <span>Đánh dấu gói Nổi bật (Highlight)</span>
              </label>
            </div>
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
