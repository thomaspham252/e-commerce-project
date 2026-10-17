import React, { useState } from 'react';
import { FiCheck, FiZap, FiArrowRight, FiShield, FiPercent } from 'react-icons/fi';
import { Sparkles, Coins } from 'lucide-react';
import './TokenPackagesGrid.css';

/**
 * Lưới hiển thị các mốc nạp token của ứng viên.
 * Cho phép chọn mốc (50, 100, 200, 500) và tiến hành nạp tiền qua VietQR SePay.
 */
export const TokenPackagesGrid = ({
  packages = [],
  selectedPackageId = null,
  onSelectPackage,
  onProceedPayment,
  loading = false,
}) => {
  const [internalSelectedId, setInternalSelectedId] = useState(
    selectedPackageId || (packages.find((p) => p.isPopular)?.id || packages[1]?.id || 'pkg-100')
  );

  const activeId = selectedPackageId || internalSelectedId;

  const handleSelect = (pkg) => {
    setInternalSelectedId(pkg.id);
    if (onSelectPackage) {
      onSelectPackage(pkg);
    }
  };

  const handleProceed = (pkg) => {
    handleSelect(pkg);
    if (onProceedPayment) {
      onProceedPayment(pkg);
    }
  };

  return (
    <div className="token-packages-grid-container">
      <div className="token-packages-grid-header">
        <div className="token-packages-grid-title-area">
          <h2 className="token-packages-grid-title">
            <Coins className="inline-icon text-amber" />
            Chọn Mốc Nạp Token
          </h2>
          <p className="token-packages-grid-desc">
            Quy đổi trực tiếp 1.000 ₫ = 1 Token. Nạp mốc càng cao, nhận thêm càng nhiều Token thưởng miễn phí.
          </p>
        </div>
        <div className="token-packages-grid-badge-info">
          <FiZap /> Kích hoạt tự động ngay sau khi quét QR VietQR
        </div>
      </div>

      <div className="token-packages-grid">
        {packages.map((pkg) => {
          const isSelected = activeId === pkg.id;
          const isPopular = pkg.isPopular;

          return (
            <div
              key={pkg.id}
              className={`token-package-card ${isSelected ? 'token-package-card--selected' : ''} ${
                isPopular ? 'token-package-card--popular' : ''
              }`}
              onClick={() => handleSelect(pkg)}
              role="button"
              tabIndex={0}
              id={`package-card-${pkg.id}`}
            >
              {isPopular && (
                <div className="token-package-badge token-package-badge--popular">
                  <Sparkles size={14} /> Phổ biến nhất
                </div>
              )}

              {pkg.bonusTokens > 0 && !isPopular && (
                <div className="token-package-badge token-package-badge--bonus">
                  <FiPercent size={13} /> Tặng +{pkg.bonusTokens} Token
                </div>
              )}

              <div className="token-package-card__header">
                <div className="token-package-card__amount">
                  <span className="token-package-card__tokens">{pkg.tokens}</span>
                  <span className="token-package-card__unit">Token</span>
                </div>
                {pkg.bonusTokens > 0 && (
                  <div className="token-package-card__bonus-pill">
                    +{pkg.bonusTokens} thưởng
                  </div>
                )}
              </div>

              <div className="token-package-card__total-receive">
                Tổng nhận:{' '}
                <strong>{pkg.totalTokens.toLocaleString('vi-VN')} Token</strong>
              </div>

              <div className="token-package-card__price">
                <span className="token-package-card__price-value">
                  {pkg.priceVND.toLocaleString('vi-VN')}
                </span>
                <span className="token-package-card__currency">₫</span>
              </div>

              <p className="token-package-card__desc">{pkg.description}</p>

              <div className="token-package-card__features">
                <div className="token-package-feature-item">
                  <FiCheck className="feature-check" />
                  <span>Cộng số dư tức thì</span>
                </div>
                <div className="token-package-feature-item">
                  <FiCheck className="feature-check" />
                  <span>Không thời hạn sử dụng</span>
                </div>
                <div className="token-package-feature-item">
                  <FiCheck className="feature-check" />
                  <span>Thanh toán VietQR tiện lợi</span>
                </div>
              </div>

              <button
                type="button"
                className={`token-package-card__btn ${
                  isSelected ? 'token-package-card__btn--active' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleProceed(pkg);
                }}
                disabled={loading}
                id={`btn-select-pkg-${pkg.id}`}
              >
                <span>{isSelected ? 'Tiếp tục thanh toán' : 'Chọn mốc này'}</span>
                <FiArrowRight />
              </button>
            </div>
          );
        })}
      </div>

      <div className="token-packages-footer-note">
        <FiShield className="footer-note-icon" />
        <span>
          Giao dịch được bảo vệ và xử lý tức thì qua cổng thanh toán SePay. Token sẽ được cộng tự động vào ví của bạn ngay khi giao dịch thành công.
        </span>
      </div>
    </div>
  );
};
