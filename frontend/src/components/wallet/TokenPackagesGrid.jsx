import React from 'react';
import { Sparkles } from 'lucide-react';
import { FiInfo } from 'react-icons/fi';
import { TokenPackageCard } from './TokenPackageCard';
import './TokenPackagesGrid.css';

/**
 * Danh sách gói nạp token của ứng viên.
 * Thiết kế đồng bộ với EmployerPricingPage:
 * - Header với badge và tiêu đề trang
 * - Grid layout hiển thị các TokenPackageCard
 * - Section chính sách phía dưới
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

  // Sắp xếp các gói theo số token từ nhỏ đến lớn
  const sortedPackages = [...packages].sort((a, b) => a.tokens - b.tokens);

  return (
    <div className="token-packages-grid-container">
      {/* Header giống EmployerPricingPage */}
      <div className="token-packages-grid-header">
        <div className="token-pkg-badge-header">
          <Sparkles size={14} /> Gói Tuyển Dụng Doanh Nghiệp
        </div>
        <h1 className="token-packages-grid-title">Bảng Giá Gói Nạp Token Ứng Viên</h1>
        <p className="token-packages-grid-subtitle">
          Dùng token để mở liên hệ nhà tuyển dụng, đẩy CV lên đầu và gắn huy hiệu nổi bật.
          Quy đổi trực tiếp 1.000 ₫ = 1 token.
        </p>
      </div>

      {/* Grid các gói token */}
      <div className="token-packages-grid">
        {sortedPackages.map((pkg) => (
          <TokenPackageCard
            key={pkg.id}
            pkg={pkg}
            onSelectPackage={handleProceed}
            loading={loading}
          />
        ))}
      </div>

      {/* Section chính sách */}
      <div className="token-pkg-policy-section">
        <div className="policy-box">
          <FiInfo className="policy-box-icon text-green" />
          <div>
            <h4>Kích Hoạt Tự Động & Không Giới Hạn Thời Gian</h4>
            <p>
              Token được kích hoạt tự động ngay lập tức sau khi thanh toán thành công qua VietQR SePay. 
              Token không có thời hạn sử dụng và có thể dùng bất cứ lúc nào.
            </p>
          </div>
        </div>

        <div className="policy-box">
          <FiInfo className="policy-box-icon text-blue" />
          <div>
            <h4>Công Dụng & Quy Đổi</h4>
            <p>
              Quy đổi cố định: 1.000 ₫ = 1 token. 
              Dùng token để mở khóa liên hệ nhà tuyển dụng (30 token/lượt), đẩy CV lên đầu danh sách, 
              gắn huy hiệu nổi bật và các tính năng cao cấp khác.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
