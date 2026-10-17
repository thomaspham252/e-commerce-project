import React from 'react';
import { FiArrowRight, FiInfo, FiZap } from 'react-icons/fi';
import { Coins, Sparkles } from 'lucide-react';
import './ServiceFeeTable.css';

/**
 * Bảng biểu phí tính năng sử dụng Token của Ứng viên.
 * Minh bạch chi phí cho từng tính năng, hiển thị số Token tương ứng và nút "Thử dùng ngay".
 */
export const ServiceFeeTable = ({
  serviceFees = [],
  onTryFeature,
  loading = false,
}) => {
  return (
    <div className="service-fee-container">
      <div className="service-fee-header">
        <div>
          <h3 className="service-fee-title">
            <Coins className="inline-icon text-amber" /> Bảng Giá Tiện Ích Ứng Tuyển
          </h3>
          <p className="service-fee-desc">
            Toàn bộ các tính năng có phí dành cho ứng viên được quy đổi minh bạch bằng Token. Chỉ trừ token khi bạn thực sự bấm kích hoạt.
          </p>
        </div>
        <div className="service-fee-rate-badge">
          <FiZap /> 1 Token = 1.000 ₫ (Không phí duy trì)
        </div>
      </div>

      {loading ? (
        <div className="service-fee-loading">Đang tải biểu phí dịch vụ...</div>
      ) : (
        <div className="service-fee-grid">
          {serviceFees.map((fee) => (
            <div key={fee.featureKey} className="service-fee-card" id={`fee-card-${fee.featureKey.toLowerCase()}`}>
              <div className="service-fee-card__top">
                {fee.badge && (
                  <span className="service-fee-badge">
                    <Sparkles size={12} /> {fee.badge}
                  </span>
                )}
                <div className="service-fee-cost">
                  <span className="cost-number">{fee.tokenCost}</span>
                  <span className="cost-unit">Token</span>
                </div>
              </div>

              <h4 className="service-fee-card__name">{fee.featureName}</h4>
              <p className="service-fee-card__desc">{fee.description}</p>

              <div className="service-fee-card__equivalent">
                Tương đương: <strong>{(fee.tokenCost * 1000).toLocaleString('vi-VN')} ₫</strong>
              </div>

              <div className="service-fee-card__footer">
                <button
                  type="button"
                  className="service-fee-btn-try"
                  onClick={() => onTryFeature?.(fee)}
                  id={`btn-try-feature-${fee.featureKey.toLowerCase()}`}
                >
                  <span>Thử dùng ngay</span>
                  <FiArrowRight />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="service-fee-policy-banner">
        <FiInfo className="policy-icon" />
        <div>
          <strong>Chính sách bảo vệ quyền lợi ứng viên:</strong> Nếu tiện ích gặp sự cố kỹ thuật hoặc nhà tuyển dụng đã đóng tin trước khi xem hồ sơ của bạn, hệ thống sẽ tự động hoàn lại 100% số Token đã trừ vào ví của bạn.
        </div>
      </div>
    </div>
  );
};
