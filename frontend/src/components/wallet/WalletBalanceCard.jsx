import React from 'react';
import { FiPlusCircle, FiFileText, FiTrendingUp, FiTrendingDown, FiShield } from 'react-icons/fi';
import { Coins } from 'lucide-react';
import './WalletBalanceCard.css';

/**
 * Thẻ hiển thị số dư ví Token chính của ứng viên.
 * Thiết kế giao diện hiện đại, nổi bật với gradient vàng kim / xanh tím sang trọng,
 * hiển thị số dư lớn, thống kê nạp/tiêu và các nút thao tác chính.
 */
export const WalletBalanceCard = ({
  balance = 0,
  totalDeposited = 0,
  totalConsumed = 0,
  onDepositClick,
  onViewFeesClick,
  loading = false,
}) => {
  return (
    <div className="wallet-balance-card">
      <div className="wallet-balance-card__glow-bg" />

      <div className="wallet-balance-card__top">
        <div className="wallet-balance-card__badge">
          <FiShield className="wallet-balance-card__badge-icon" />
          <span>Ví Ứng Viên Chính Thức</span>
        </div>
        <div className="wallet-balance-card__rate-hint">
          Quy đổi: <strong>1.000 ₫ = 1 Token</strong>
        </div>
      </div>

      <div className="wallet-balance-card__main">
        <div className="wallet-balance-card__coin-container">
          <div className="wallet-balance-card__coin-glow">
            <Coins className="wallet-balance-card__coin-icon" />
          </div>
        </div>

        <div className="wallet-balance-card__info">
          <span className="wallet-balance-card__label">Số dư Token khả dụng</span>
          <div className="wallet-balance-card__balance-row">
            <span className="wallet-balance-card__balance-number">
              {loading ? '...' : Number(balance).toLocaleString('vi-VN')}
            </span>
            <span className="wallet-balance-card__balance-unit">Token</span>
          </div>
          <p className="wallet-balance-card__subtext">
            Sử dụng để mở khóa liên hệ Nhà tuyển dụng, đẩy CV và gắn huy hiệu hồ sơ nổi bật.
          </p>
        </div>

        <div className="wallet-balance-card__actions">
          <button
            type="button"
            className="wallet-balance-card__btn-deposit"
            onClick={onDepositClick}
            id="wallet-card-deposit-btn"
          >
            <FiPlusCircle className="wallet-btn-icon" />
            <span>Nạp thêm Token</span>
          </button>
          <button
            type="button"
            className="wallet-balance-card__btn-fees"
            onClick={onViewFeesClick}
            id="wallet-card-fees-btn"
          >
            <FiFileText className="wallet-btn-icon" />
            <span>Xem bảng giá tiện ích</span>
          </button>
        </div>
      </div>

      <div className="wallet-balance-card__divider" />

      <div className="wallet-balance-card__stats">
        <div className="wallet-stat-item">
          <div className="wallet-stat-icon wallet-stat-icon--deposit">
            <FiTrendingUp />
          </div>
          <div className="wallet-stat-content">
            <span className="wallet-stat-label">Tổng token đã nạp</span>
            <span className="wallet-stat-value text-deposit">
              +{Number(totalDeposited).toLocaleString('vi-VN')} Token
            </span>
          </div>
        </div>

        <div className="wallet-stat-item">
          <div className="wallet-stat-icon wallet-stat-icon--consume">
            <FiTrendingDown />
          </div>
          <div className="wallet-stat-content">
            <span className="wallet-stat-label">Tổng token đã dùng</span>
            <span className="wallet-stat-value text-consume">
              -{Number(totalConsumed).toLocaleString('vi-VN')} Token
            </span>
          </div>
        </div>

        <div className="wallet-stat-item wallet-stat-item--policy">
          <span className="wallet-policy-note">
            ⚡ Không giới hạn thời hạn sử dụng • Bảo mật giao dịch với SePay VietQR
          </span>
        </div>
      </div>
    </div>
  );
};
