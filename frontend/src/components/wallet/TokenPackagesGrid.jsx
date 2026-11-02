import React from 'react';
import './TokenPackagesGrid.css';

/**
 * Danh sách mốc nạp token của ứng viên (4 thẻ card tinh gọn, không icon trang trí).
 * - Bỏ toàn bộ icon trang trí (đồng xu, tia sét, lấp lánh, %, tick xanh, mũi tên).
 * - Gói 120 token làm nổi bật bằng viền đậm và chữ "Phổ biến" (không nền màu).
 * - Gói có thưởng hiển thị gọn: "+{bonus} token thưởng" màu xanh và "Nhận {total} token" màu xám.
 * - Giá tiền định dạng chuẩn "X ₫", không gạch chân.
 * - Chiều cao 4 thẻ bằng nhau, nút "Chọn gói này" thẳng hàng ở đáy thẻ.
 */
export const TokenPackagesGrid = ({
  packages = [],
  selectedPackageId = null,
  onSelectPackage,
  onProceedPayment,
  loading = false,
}) => {
  const handleProceed = (pkg) => {
    onSelectPackage?.(pkg);
    onProceedPayment?.(pkg);
  };

  return (
    <div className="token-packages-grid-container">
      <div className="token-packages-grid-header">
        <div className="token-packages-grid-title-area">
          <h2 className="token-packages-grid-title">Chọn mốc nạp token</h2>
          <p className="token-packages-grid-desc">
            Quy đổi trực tiếp 1.000 ₫ = 1 token.
          </p>
          <p className="token-packages-grid-note">
            Token không có thời hạn sử dụng và được kích hoạt tự động ngay sau khi quét mã VietQR.
          </p>
        </div>
      </div>

      <div className="token-packages-grid">
        {packages.map((pkg) => {
          const isPopular = pkg.isPopular || pkg.tokens === 120;
          const bonus = pkg.bonusTokens || 0;
          const total = pkg.totalTokens || (pkg.tokens + bonus);
          const priceFormatted = Number(pkg.priceVND || pkg.price).toLocaleString('vi-VN');

          return (
            <div
              key={pkg.id}
              className={`token-package-card ${isPopular ? 'token-package-card--popular' : ''}`}
              id={`package-card-${pkg.id}`}
            >
              <div className="token-package-card__top">
                <div className="token-package-card__tag-row">
                  {isPopular ? (
                    <span className="pkg-text-popular">Phổ biến</span>
                  ) : (
                    <span className="pkg-text-placeholder" aria-hidden="true" />
                  )}
                </div>

                <div className="token-package-card__amount-row">
                  <span className="token-package-card__tokens">{pkg.tokens}</span>
                  <span className="token-package-card__unit">token</span>
                </div>

                <div className="token-package-card__reward-row">
                  {bonus > 0 ? (
                    <span className="pkg-reward-text">+{bonus} token thưởng</span>
                  ) : (
                    <span className="pkg-reward-placeholder" aria-hidden="true" />
                  )}
                </div>

                <div className="token-package-card__total-row">
                  {bonus > 0 ? (
                    <span className="pkg-total-receive">
                      Nhận {total.toLocaleString('vi-VN')} token
                    </span>
                  ) : (
                    <span className="pkg-total-placeholder" aria-hidden="true" />
                  )}
                </div>

                <div className="token-package-card__price">
                  <span className="token-package-card__price-value">
                    {priceFormatted} ₫
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="token-package-card__btn"
                onClick={() => handleProceed(pkg)}
                disabled={loading}
                id={`btn-select-pkg-${pkg.id}`}
              >
                Chọn gói này
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
