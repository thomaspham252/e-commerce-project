import React from 'react';
import { Sparkles } from 'lucide-react';
import { FiCheck, FiArrowRight, FiInfo } from 'react-icons/fi';
import './ServiceFeeTable.css';

/**
 * Bảng biểu phí tính năng sử dụng Token của Ứng viên (Combo packages).
 * Thiết kế đồng bộ 100% với giao diện combo trong ảnh tham khảo.
 */
export const ServiceFeeTable = ({
  serviceFees = [],
  onTryFeature,
  loading = false,
}) => {
  // Mapping tên combo và thông tin
  const comboData = {
    'UNLOCK_CONTACT': {
      name: 'Nội bật',
      oldPrice: 45,
      savings: 10,
      features: ['Đẩy CV 72h', 'Huy hiệu nội bật']
    },
    'BOOST_CV_72H': {
      name: 'Liên hệ nhanh',
      oldPrice: 75,
      savings: 15,
      features: ['Đẩy CV 72h', 'Huy hiệu nội bật', 'Mở khóa liên hệ NTD'],
      isPopular: true
    },
    'BOOST_CV': {
      name: 'Liên hệ nhanh',
      oldPrice: 75,
      savings: 15,
      features: ['Đẩy CV 72h', 'Huy hiệu nội bật', 'Mở khóa liên hệ NTD'],
      isPopular: true
    },
    'URGENT_APPLY': {
      name: 'Toàn diện',
      oldPrice: 110,
      savings: 30,
      features: ['Đẩy CV 72h', 'Huy hiệu nội bật', 'Ưu tiên hiển thị', 'Mở khóa liên hệ NTD', 'AI Resume Score']
    }
  };

  // Tìm gói phổ biến nhất
  const popularFee = serviceFees.find(f => comboData[f.featureKey]?.isPopular) || serviceFees[1];

  return (
    <div className="service-fee-container">
      {/* Header giống TokenPackagesGrid */}
      <div className="service-fee-header">
        <div className="service-fee-badge-header">
          <Sparkles size={14} /> Tiện Ích Tuyển Dụng
        </div>
        <h1 className="service-fee-title">Bảng Giá Tiện Ích Ứng Tuyển</h1>
        <p className="service-fee-subtitle">
          Toàn bộ các tính năng có phí dành cho ứng viên được quy đổi minh bạch bằng Token. 
          Chỉ trừ token khi bạn thực sự bấm kích hoạt.
        </p>
      </div>

      {loading ? (
        <div className="service-fee-loading">Đang tải biểu phí dịch vụ từ hệ thống...</div>
      ) : (
        <div className="service-fee-grid">
          {serviceFees.map((fee) => {
            const combo = comboData[fee.featureKey] || {
              name: fee.featureName,
              oldPrice: fee.tokenCost + 20,
              savings: 10,
              features: [fee.description]
            };
            const isPopular = combo.isPopular || fee.featureKey === popularFee?.featureKey;
            
            return (
              <div 
                key={fee.featureKey} 
                className={`service-fee-card ${isPopular ? 'service-fee-card--popular' : ''}`}
                id={`fee-card-${fee.featureKey.toLowerCase()}`}
              >
                {/* Badge trên cùng */}
                {fee.badge && (
                  <div className={`service-fee-badge ${isPopular ? 'service-fee-badge--popular' : 'service-fee-badge--custom'}`}>
                    {isPopular && <Sparkles size={13} />} {fee.badge}
                  </div>
                )}

                {/* Phần trên: Tên combo */}
                <div className="service-fee-card-top">
                  <h4 className="service-fee-combo-name">{combo.name}</h4>
                </div>

                {/* Số token và giá cũ */}
                <div className="service-fee-token-row">
                  <div className="service-fee-token-display">
                    <span className="service-fee-token-number">{fee.tokenCost}</span>
                    <span className="service-fee-token-unit">Token</span>
                    <span className="service-fee-token-old">{combo.oldPrice}</span>
                  </div>
                  <span className="service-fee-savings-badge">
                    Tiết kiệm {combo.savings} token
                  </span>
                </div>

                {/* Danh sách tính năng */}
                <div className="service-fee-features-list">
                  {combo.features.map((feature, idx) => (
                    <div key={idx} className="service-fee-feature-item">
                      <FiCheck className="feature-check-icon" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Giá VNĐ */}
                <div className="service-fee-price-display">
                  <span className="service-fee-price-number">
                    {(fee.tokenCost * 1000).toLocaleString('vi-VN')}
                  </span>
                  <span className="service-fee-price-unit">₫</span>
                </div>

                {/* Footer với nút */}
                <div className="service-fee-card-footer">
                  <button
                    type="button"
                    className={`service-fee-btn-action ${isPopular ? 'service-fee-btn-action--popular' : ''}`}
                    onClick={() => onTryFeature?.(fee)}
                    id={`btn-try-feature-${fee.featureKey.toLowerCase()}`}
                  >
                    <span>Mua combo</span>
                    <FiArrowRight />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Section chính sách */}
      <div className="service-fee-policy-section">
        <div className="policy-box">
          <FiInfo className="policy-box-icon text-green" />
          <div>
            <h4>Chính sách bảo vệ quyền lợi ứng viên</h4>
            <p>
              Nếu tiện ích gặp sự cố kỹ thuật hoặc nhà tuyển dụng đã đóng tin trước khi xem hồ sơ của bạn, 
              hệ thống sẽ tự động hoàn lại 100% số Token đã trừ vào ví của bạn.
            </p>
          </div>
        </div>

        <div className="policy-box">
          <FiInfo className="policy-box-icon text-blue" />
          <div>
            <h4>Quy đổi Token minh bạch</h4>
            <p>
              Quy đổi cố định: 1.000 ₫ = 1 token. Token không có thời hạn sử dụng và được bảo toàn 
              trong tài khoản của bạn. Chỉ trừ khi bạn chủ động kích hoạt tính năng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
