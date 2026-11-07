import React from 'react';
import { FiCheck, FiArrowRight } from 'react-icons/fi';
import { Sparkles, Coins } from 'lucide-react';
import './TokenPackageCard.css';

/**
 * Thẻ hiển thị gói nạp token cho ứng viên.
 * Thiết kế đồng bộ với EmployerPackageCard: layout dọc, badge trên cùng, 
 * nút hành động ở cuối, hiển thị đầy đủ thông tin từ DB.
 */
export const TokenPackageCard = ({
  pkg,
  onSelectPackage,
  loading = false,
}) => {
  const isPopular = pkg.isPopular || pkg.tokens === 100;
  const bonus = pkg.bonusTokens || 0;
  const total = pkg.totalTokens || (pkg.tokens + bonus);
  const priceFormatted = Number(pkg.priceVND || pkg.price).toLocaleString('vi-VN');
  const badgeLabel = pkg.badgeLabel || (isPopular ? 'Phổ biến nhất ⭐' : null);

  return (
    <div
      className={`token-package-card ${isPopular ? 'token-package-card--popular' : ''}`}
      id={`token-package-${pkg.id}`}
    >
      {/* Huy hiệu trên cùng */}
      {badgeLabel ? (
        <div className={`token-pkg-badge ${isPopular ? 'token-pkg-badge--popular' : 'token-pkg-badge--custom'}`}>
          {isPopular ? <Sparkles size={13} /> : null} {badgeLabel}
        </div>
      ) : null}

      <div className="token-pkg-card-top">
        <div className="token-pkg-amount-row">
          <Coins className="token-pkg-icon" />
          <div className="token-pkg-amount">
            <span className="token-pkg-number">{pkg.tokens}</span>
            <span className="token-pkg-unit">token</span>
          </div>
        </div>

        {pkg.description && (
          <p className="token-pkg-desc">{pkg.description}</p>
        )}
      </div>

      <div className="token-pkg-price-row">
        <div className="token-pkg-price">
          <span className="token-pkg-price-number">{priceFormatted}</span>
          <span className="token-pkg-currency">₫</span>
        </div>
      </div>

      <div className="token-pkg-highlights">
        <div className="token-highlight-item">
          <FiCheck className="token-highlight-icon" />
          <span>
            Nhận: <strong>{total.toLocaleString('vi-VN')} token</strong>
          </span>
        </div>
        {bonus > 0 && (
          <div className="token-highlight-item token-highlight-item--bonus">
            <FiCheck className="token-highlight-icon" />
            <span>
              Tặng kèm <strong>+{bonus} token thưởng</strong>
            </span>
          </div>
        )}
      </div>

      <div className="token-pkg-card-footer">
        <button
          type="button"
          className="token-pkg-btn-action"
          onClick={() => onSelectPackage?.(pkg)}
          disabled={loading || !pkg.isActive}
          id={`btn-select-token-pkg-${pkg.id}`}
        >
          <span>Chọn gói này</span>
          <FiArrowRight />
        </button>
      </div>
    </div>
  );
};
