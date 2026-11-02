import React from 'react';
import './WalletBalanceCard.css';

/**
 * Khối hiển thị số dư ví token của ứng viên.
 * - Nền phẳng đơn sắc xanh lá đậm (#0B4F37), không gradient, không bóng mờ, bo góc 10px.
 * - Số dư 48px kèm dòng giải thích số lượt mở khóa liên hệ NTD.
 * - Nút chính nền trắng chữ xanh đậm, nút phụ viền mảnh cùng kích thước.
 * - Thanh tỉ lệ 6px (đỏ nhạt #FFB4A8 và xanh sáng #8FE3BA).
 * - Dải 3 cột số liệu ngăn cách bằng đường kẻ mảnh, số liệu tabular-nums.
 */
export const WalletBalanceCard = ({
  balance = 0,
  totalDeposited = 0,
  totalConsumed = 0,
  lastDepositDate = '—',
  unlockCost = 30,
  onDepositClick,
  onViewFeesClick,
  loading = false,
}) => {
  const numericBalance = Number(balance) || 0;
  const numericDeposited = Number(totalDeposited) || 0;
  const numericConsumed = Number(totalConsumed) || 0;

  // Tính số lần mở khóa liên hệ NTD có thể thực hiện
  const unlockCount = Math.floor(numericBalance / (unlockCost || 30));
  const unlockExplanation = unlockCount > 0
    ? `Đủ cho ${unlockCount} lần mở khóa liên hệ nhà tuyển dụng`
    : 'Chưa đủ cho 1 lần mở khóa liên hệ nhà tuyển dụng';

  // Tính tỉ lệ thanh tiến độ đã dùng trên tổng nạp
  const totalBase = numericDeposited > 0 ? numericDeposited : (numericConsumed + numericBalance);
  const consumedPercent = totalBase > 0
    ? Math.min(100, Math.max(0, Math.round((numericConsumed / totalBase) * 100)))
    : 0;
  const remainingPercent = 100 - consumedPercent;

  return (
    <div className="wallet-balance-card">
      <div className="wallet-balance-card__top">
        <div className="wallet-balance-card__main-info">
          <span className="wallet-balance-card__label">Số dư khả dụng</span>
          <div className="wallet-balance-card__amount-row">
            <span className="wallet-balance-card__number">
              {loading ? '—' : numericBalance.toLocaleString('vi-VN')}
            </span>
            <span className="wallet-balance-card__unit">token</span>
          </div>
          <p className="wallet-balance-card__explanation">
            {unlockExplanation}
          </p>
        </div>

        <div className="wallet-balance-card__actions">
          <button
            type="button"
            className="wallet-btn-primary"
            onClick={onDepositClick}
            id="wallet-card-deposit-btn"
          >
            Nạp thêm token
          </button>
          {onViewFeesClick && (
            <button
              type="button"
              className="wallet-btn-secondary"
              onClick={onViewFeesClick}
              id="wallet-card-fees-btn"
            >
              Biểu phí tiện ích
            </button>
          )}
        </div>
      </div>

      {/* Thanh ngang tỉ lệ đã dùng / tổng nạp */}
      <div className="wallet-balance-card__progress-wrap">
        <div
          className="wallet-balance-card__progress-bar"
          role="progressbar"
          aria-valuenow={consumedPercent}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          {consumedPercent > 0 && (
            <div
              className="wallet-progress-segment wallet-progress-segment--consumed"
              style={{ width: `${consumedPercent}%` }}
            />
          )}
          {remainingPercent > 0 && (
            <div
              className="wallet-progress-segment wallet-progress-segment--remaining"
              style={{ width: `${remainingPercent}%` }}
            />
          )}
        </div>
        <div className="wallet-balance-card__progress-caption">
          Đã dùng {numericConsumed.toLocaleString('vi-VN')} trên {numericDeposited.toLocaleString('vi-VN')} token đã nạp
        </div>
      </div>

      {/* Dải 3 cột số liệu ngăn cách bằng đường kẻ mảnh */}
      <div className="wallet-balance-card__footer">
        <div className="wallet-stat-col">
          <span className="wallet-stat-label">Đã nạp</span>
          <span className="wallet-stat-value text-deposit">
            +{numericDeposited.toLocaleString('vi-VN')} token
          </span>
        </div>

        <div className="wallet-stat-col">
          <span className="wallet-stat-label">Đã dùng</span>
          <span className="wallet-stat-value text-consumed">
            −{numericConsumed.toLocaleString('vi-VN')} token
          </span>
        </div>

        <div className="wallet-stat-col">
          <span className="wallet-stat-label">Nạp gần nhất</span>
          <span className="wallet-stat-value text-last-date">
            {lastDepositDate}
          </span>
        </div>
      </div>
    </div>
  );
};
