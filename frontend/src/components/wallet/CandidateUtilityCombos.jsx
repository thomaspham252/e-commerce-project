import React from 'react';
import { Sparkles, Zap, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import {
  UTILITY_COMBOS_CONFIG,
  calculateSavings,
  convertTokenToVnd,
  formatVnd,
} from '../../constants/utilityCombosConfig.js';
import './CandidateUtilityCombos.css';

/**
 * Component hiển thị Bảng giá Combo tiện ích ứng tuyển JobViet.
 * Tab "Biểu phí tiện ích" trong trang Ví Token của ứng viên.
 * - Nội dung bảng giá là cố định trên giao diện, không cấu hình DB.
 * - Tiện ích CHỈ được bán theo gói COMBO, tuyệt đối không có mua lẻ.
 * - Tiết kiệm được tính tự động = giá gốc - giá combo.
 * 
 * @param {object} props
 * @param {Function} props.onSelectCombo - Hàm callback khi ứng viên bấm "Mua combo"
 * @param {number} props.balance - Số dư token hiện tại của ứng viên
 * @param {object} props.benefits - Thông tin quyền lợi tiện ích hiện tại của ứng viên
 * @param {Function} props.onViewMyPackagesClick - Hàm chuyển sang tab "Gói tiện ích của tôi"
 */
export const CandidateUtilityCombos = ({
  onSelectCombo,
  balance = 0,
  benefits = null,
  onViewMyPackagesClick,
}) => {
  return (
    <div className="candidate-utility-combos-container">
      {/* 1. Phần Header: Căn trái tự nhiên, gọn gàng */}
      <div className="utility-combos-header">
        <h2 className="utility-combos-title">Bảng giá tiện ích ứng tuyển</h2>
        <p className="utility-combos-subtitle">
          Toàn bộ các tính năng có phí dành cho ứng viên được quy đổi minh bạch bằng Token.
          Hệ thống chỉ trừ token khi bạn thực sự chủ động bấm kích hoạt.
        </p>

        {/* Khối hiển thị quyền lợi hiện tại của ứng viên */}
        {benefits && (benefits.isBoostActive || benefits.isFeaturedBadgeActive || benefits.isPriorityActive || benefits.contactUnlockQuota > 0 || (benefits.unlockedCompanies && benefits.unlockedCompanies.length > 0)) && (
          <div className="utility-active-benefits-bar">
            <div className="active-benefits-title">
              <CheckCircle2 size={16} />
              <span>Quyền lợi đang áp dụng:</span>
            </div>
            <div className="active-benefits-tags">
              {benefits.isBoostActive && (
                <span className="active-tag tag-boost">Đang đẩy CV (72h)</span>
              )}
              {benefits.isFeaturedBadgeActive && (
                <span className="active-tag tag-badge">Huy hiệu nổi bật</span>
              )}
              {benefits.isPriorityActive && (
                <span className="active-tag tag-priority">Ưu tiên hiển thị</span>
              )}
              {benefits.contactUnlockQuota > 0 && (
                <span className="active-tag tag-quota">Còn {benefits.contactUnlockQuota} lượt chat NTD</span>
              )}
              {onViewMyPackagesClick && (
                <button
                  type="button"
                  className="active-tag-manage-btn"
                  onClick={onViewMyPackagesClick}
                >
                  Xem chi tiết gói của tôi →
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Lưới hiển thị 3 Thẻ Combo (Desktop 3 cột, Mobile xếp dọc) */}
      <div className="utility-combos-grid">
        {UTILITY_COMBOS_CONFIG.map((combo) => {
          const savings = calculateSavings(combo);
          const vndPrice = convertTokenToVnd(combo.priceToken);
          const isFeatured = combo.isFeatured;

          return (
            <div
              key={combo.id}
              className={`utility-combo-card ${isFeatured ? 'utility-combo-card--featured' : ''}`}
              id={`utility-combo-${combo.id.toLowerCase()}`}
            >
              {/* Nhãn định vị gói (Phổ biến, Hiệu quả, Ưu tiên) */}
              <div className="utility-combo-badge-wrapper">
                <span className={`combo-tag ${isFeatured ? 'combo-tag--featured' : 'combo-tag--standard'}`}>
                  {isFeatured ? <Zap size={13} className="tag-icon" /> : null}
                  {combo.badge}
                </span>
              </div>

              {/* Tên Combo */}
              <h3 className="combo-name">{combo.name}</h3>

              {/* Khu vực giá Token lớn, giá gốc gạch ngang và Badge Tiết kiệm tự động tính */}
              <div className="combo-price-block">
                <div className="combo-price-main">
                  <span className="combo-price-token">{combo.priceToken}</span>
                  <span className="combo-price-unit">Token</span>
                  {combo.originalPriceToken > combo.priceToken && (
                    <span className="combo-original-price">{combo.originalPriceToken}</span>
                  )}
                </div>

                {savings > 0 && (
                  <div className="combo-savings-badge">
                    Tiết kiệm {savings} token
                  </div>
                )}
              </div>

              {/* Giá quy đổi tương đương VNĐ */}
              <div className="combo-vnd-conversion">
                Quy đổi: <strong>{formatVnd(vndPrice)}</strong>
              </div>

              {/* Phân cách */}
              <div className="combo-divider" />

              {/* Danh sách quyền lợi có dấu tick */}
              <div className="combo-benefits-section">
                <p className="combo-benefits-title">Quyền lợi gói bao gồm:</p>
                <ul className="combo-benefits-list">
                  {combo.benefits.map((benefit, idx) => (
                    <li key={idx} className="combo-benefit-item">
                      <CheckCircle2 size={16} className="benefit-check-icon" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Nút hành động Mua combo (Gói giữa nút đen) */}
              <div className="combo-action-footer">
                <button
                  type="button"
                  className={`btn-combo-buy ${
                    combo.actionButtonColor === 'black'
                      ? 'btn-combo-buy--black'
                      : 'btn-combo-buy--primary'
                  }`}
                  onClick={() => onSelectCombo && onSelectCombo(combo)}
                >
                  Mua combo
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Khối thông tin bổ trợ: Chính sách bảo vệ & Quy đổi minh bạch */}
      <div className="utility-combos-policies-grid">
        <div className="utility-policy-card">
          <div className="policy-icon-wrapper policy-icon-wrapper--shield">
            <ShieldCheck size={22} />
          </div>
          <div className="policy-content">
            <h4 className="policy-title">Chính sách bảo vệ quyền lợi ứng viên</h4>
            <p className="policy-description">
              Hoàn 100% token đã trừ nếu tiện ích gặp sự cố kỹ thuật hoặc nhà tuyển dụng đã đóng tin trước khi mở xem hồ sơ của bạn.
            </p>
          </div>
        </div>

        <div className="utility-policy-card">
          <div className="policy-icon-wrapper policy-icon-wrapper--refresh">
            <RefreshCw size={22} />
          </div>
          <div className="policy-content">
            <h4 className="policy-title">Quy đổi Token minh bạch</h4>
            <p className="policy-description">
              Tỷ lệ quy đổi cố định 1.000 đ = 1 token. Token nạp vào không có thời hạn sử dụng và hệ thống chỉ trừ khi bạn chủ động kích hoạt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

