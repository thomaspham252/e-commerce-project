import React, { useState, useEffect } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import './TokenConfigModal.css';

/**
 * Modal cấu hình Gói nạp Token hoặc Phí dịch vụ tiêu thụ Token của ứng viên.
 */
export const TokenConfigModal = ({
  isOpen = false,
  onClose,
  onSave,
  initialData = null,
  mode = 'PACKAGE', // 'PACKAGE' hoặc 'FEE'
}) => {
  const [formData, setFormData] = useState({
    tokens: '',
    bonusTokens: 0,
    priceVND: '',
    isPopular: false,
    badgeLabel: '',
    description: '',
    // Dành cho mode FEE
    featureKey: '',
    featureName: '',
    tokenCost: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (mode === 'PACKAGE') {
        setFormData({
          id: initialData.id,
          tokens: initialData.tokens ?? '',
          bonusTokens: initialData.bonusTokens ?? 0,
          priceVND: initialData.priceVND ?? '',
          isPopular: Boolean(initialData.isPopular),
          badgeLabel: initialData.badgeLabel || '',
          description: initialData.description || '',
        });
      } else {
        setFormData({
          featureKey: initialData.featureKey || '',
          featureName: initialData.featureName || '',
          tokenCost: initialData.tokenCost ?? '',
          description: initialData.description || '',
        });
      }
    } else {
      setFormData({
        tokens: 100,
        bonusTokens: 10,
        priceVND: 99000,
        isPopular: false,
        badgeLabel: '',
        description: 'Gói nạp token tiêu chuẩn',
        featureKey: '',
        featureName: '',
        tokenCost: 10,
      });
    }
    setErrors({});
  }, [initialData, mode, isOpen]);

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

    if (mode === 'PACKAGE') {
      const tokens = Number(formData.tokens);
      if (formData.tokens === '' || isNaN(tokens) || tokens <= 0) {
        newErrors.tokens = 'Số lượng Token cơ bản phải lớn hơn 0';
      }

      const price = Number(formData.priceVND);
      if (formData.priceVND === '' || isNaN(price) || price <= 0) {
        newErrors.priceVND = 'Giá bán phải là số hợp lệ và lớn hơn 0 ₫';
      }

      const bonus = Number(formData.bonusTokens || 0);
      if (isNaN(bonus) || bonus < 0) {
        newErrors.bonusTokens = 'Số token thưởng không được âm';
      }
    } else {
      const cost = Number(formData.tokenCost);
      if (formData.tokenCost === '' || isNaN(cost) || cost <= 0) {
        newErrors.tokenCost = 'Mức trừ token phải lớn hơn 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (mode === 'PACKAGE') {
        const payload = {
          ...formData,
          tokens: Number(formData.tokens),
          bonusTokens: Number(formData.bonusTokens || 0),
          priceVND: Number(formData.priceVND),
        };
        await onSave?.(payload);
      } else {
        const payload = {
          ...formData,
          tokenCost: Number(formData.tokenCost),
        };
        await onSave?.(payload);
      }
      onClose?.();
    } catch (err) {
      alert(err.message || 'Lỗi khi lưu cấu hình');
    } finally {
      setSubmitting(false);
    }
  };

  const calculatedTotal = Number(formData.tokens || 0) + Number(formData.bonusTokens || 0);

  return (
    <div className="tok-modal-overlay" onClick={onClose}>
      <div className="tok-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="tok-modal-header">
          <h3 className="tok-modal-title">
            {mode === 'PACKAGE'
              ? initialData
                ? 'Chỉnh sửa Gói nạp Token'
                : 'Thêm mới Gói nạp Token'
              : 'Điều chỉnh Biểu phí Tính năng Token'}
          </h3>
          <button type="button" className="tok-modal-close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="tok-modal-body">
            {mode === 'PACKAGE' ? (
              <>
                <div className="tok-form-row">
                  <div className="tok-form-group">
                    <label className="tok-form-label">
                      Số Token cơ bản <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      className={`tok-form-input ${errors.tokens ? 'error' : ''}`}
                      value={formData.tokens}
                      onChange={(e) => setFormData({ ...formData, tokens: e.target.value })}
                    />
                    {errors.tokens && <span className="tok-form-error">{errors.tokens}</span>}
                  </div>

                  <div className="tok-form-group">
                    <label className="tok-form-label">Token thưởng thêm (Bonus)</label>
                    <input
                      type="number"
                      min="0"
                      className={`tok-form-input ${errors.bonusTokens ? 'error' : ''}`}
                      value={formData.bonusTokens}
                      onChange={(e) => setFormData({ ...formData, bonusTokens: e.target.value })}
                    />
                    {errors.bonusTokens && <span className="tok-form-error">{errors.bonusTokens}</span>}
                  </div>
                </div>

                <div className="tok-calculation-preview">
                  <span>Tổng số token thực nhận của ứng viên:</span>
                  <strong style={{ fontSize: '15px' }}>{calculatedTotal} Token</strong>
                </div>

                <div className="tok-form-group">
                  <label className="tok-form-label">
                    Giá nạp (VNĐ) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    className={`tok-form-input ${errors.priceVND ? 'error' : ''}`}
                    placeholder="VD: 99000"
                    value={formData.priceVND}
                    onChange={(e) => setFormData({ ...formData, priceVND: e.target.value })}
                  />
                  {errors.priceVND && <span className="tok-form-error">{errors.priceVND}</span>}
                </div>

                <div className="tok-form-group">
                  <label className="tok-form-label">Huy hiệu ưu đãi (Badge)</label>
                  <input
                    type="text"
                    className="tok-form-input"
                    placeholder="VD: Phổ biến nhất, Tặng thêm 20 Token"
                    value={formData.badgeLabel}
                    onChange={(e) => setFormData({ ...formData, badgeLabel: e.target.value })}
                  />
                </div>

                <div className="tok-form-group">
                  <label className="tok-form-label">Mô tả gói</label>
                  <input
                    type="text"
                    className="tok-form-input"
                    placeholder="VD: Phù hợp ứng viên đang tìm việc tích cực"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="tok-form-group">
                  <label className="tok-form-label">Tên tính năng dịch vụ</label>
                  <input
                    type="text"
                    className="tok-form-input"
                    disabled
                    value={formData.featureName}
                    style={{ background: '#f8fafc', color: '#64748b' }}
                  />
                </div>

                <div className="tok-form-group">
                  <label className="tok-form-label">
                    Mức tiêu thụ Token cho mỗi lượt <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    className={`tok-form-input ${errors.tokenCost ? 'error' : ''}`}
                    value={formData.tokenCost}
                    onChange={(e) => setFormData({ ...formData, tokenCost: e.target.value })}
                  />
                  {errors.tokenCost && <span className="tok-form-error">{errors.tokenCost}</span>}
                </div>

                <div className="tok-form-group">
                  <label className="tok-form-label">Mô tả tính năng</label>
                  <input
                    type="text"
                    className="tok-form-input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>

          <div className="tok-modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <FiCheck />
              <span>{submitting ? 'Đang lưu...' : 'Lưu cấu hình'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
