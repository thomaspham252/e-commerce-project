import React, { useState } from 'react';
import { VietnameseDatePicker } from '../common/VietnameseDatePicker.jsx';
import './TokenTransactionList.css';

/**
 * Danh sách Lịch sử biến động token của ứng viên.
 * - Chỉ hiện bộ lọc loại giao dịch và ngày khi có hơn 5 giao dịch. Dưới 5 giao dịch chỉ hiện bảng.
 * - Bộ chọn ngày dd/mm/yyyy bắt đầu từ thứ Hai, ngôn ngữ tiếng Việt.
 * - Tabular-nums cho cột số, căn phải rõ ràng.
 */
export const TokenTransactionList = ({
  transactions = [],
  onFilterChange,
  loading = false,
}) => {
  const [filterType, setFilterType] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleTypeChange = (type) => {
    setFilterType(type);
    onFilterChange?.({ type, startDate, endDate });
  };

  const handleStartDateChange = (val) => {
    setStartDate(val);
    onFilterChange?.({ type: filterType, startDate: val, endDate });
  };

  const handleEndDateChange = (val) => {
    setEndDate(val);
    onFilterChange?.({ type: filterType, startDate, endDate: val });
  };

  const handleResetFilters = () => {
    setFilterType('ALL');
    setStartDate('');
    setEndDate('');
    onFilterChange?.({ type: 'ALL', startDate: '', endDate: '' });
  };

  const hasActiveFilters = filterType !== 'ALL' || Boolean(startDate) || Boolean(endDate);
  // Chỉ hiện bộ lọc khi có hàm onFilterChange và (có hơn 5 giao dịch hoặc đang lọc)
  const showFilters = Boolean(onFilterChange) && (transactions.length > 5 || hasActiveFilters);

  // Định dạng ngày chuẩn Việt Nam: dd/mm/yyyy hh:mm
  const formatDateVN = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Nhãn loại giao dịch: chỉ dùng chữ màu, bỏ nền pill
  const renderTypeText = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return <span className="tx-type-text tx-type--deposit">Nạp token</span>;
      case 'CONSUME':
        return <span className="tx-type-text tx-type--consume">Sử dụng</span>;
      case 'REFUND':
        return <span className="tx-type-text tx-type--refund">Hoàn trả</span>;
      case 'BONUS':
        return <span className="tx-type-text tx-type--bonus">Thưởng</span>;
      default:
        return <span className="tx-type-text">{type}</span>;
    }
  };

  return (
    <div className="token-tx-container">
      {/* Thanh bộ lọc: Chỉ hiện khi có trên 5 giao dịch */}
      {showFilters && (
        <div className="token-tx-filter-bar">
          <div className="token-tx-filter-tabs">
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'DEPOSIT', label: 'Nạp token' },
              { id: 'CONSUME', label: 'Sử dụng' },
              { id: 'REFUND', label: 'Hoàn trả' },
              { id: 'BONUS', label: 'Thưởng' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`token-tx-filter-tab ${
                  filterType === tab.id ? 'token-tx-filter-tab--active' : ''
                }`}
                onClick={() => handleTypeChange(tab.id)}
                id={`filter-tx-tab-${tab.id.toLowerCase()}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="token-tx-date-filters">
            <div className="token-tx-date-field">
              <span className="token-tx-date-label">Từ ngày</span>
              <VietnameseDatePicker
                value={startDate}
                onChange={handleStartDateChange}
                placeholder="dd/mm/yyyy"
                id="tx-start-date"
              />
            </div>

            <div className="token-tx-date-field">
              <span className="token-tx-date-label">Đến ngày</span>
              <VietnameseDatePicker
                value={endDate}
                onChange={handleEndDateChange}
                placeholder="dd/mm/yyyy"
                id="tx-end-date"
              />
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="token-tx-btn-reset"
                onClick={handleResetFilters}
              >
                Đặt lại
              </button>
            )}
          </div>
        </div>
      )}

      {/* Trạng thái tải hoặc danh sách trống */}
      {loading ? (
        <div className="token-tx-empty-state">
          <p>Đang tải dữ liệu biến động token...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="token-tx-empty-state">
          <h4>Không tìm thấy giao dịch nào</h4>
          <p>Không có bản ghi phù hợp với tiêu chí lọc của bạn.</p>
          {hasActiveFilters && (
            <button
              type="button"
              className="token-tx-btn-reset"
              onClick={handleResetFilters}
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Bảng hiển thị trên Desktop / Tablet */}
          <div className="token-tx-table-wrapper">
            <table className="token-tx-table">
              <thead>
                <tr>
                  <th className="col-tx-time">Thời gian</th>
                  <th className="col-tx-id">Mã giao dịch</th>
                  <th className="col-tx-type">Loại</th>
                  <th className="col-tx-desc">Nội dung chi tiết</th>
                  <th className="col-tx-amount text-right">Biến động</th>
                  <th className="col-tx-balance text-right">Số dư sau</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <tr key={tx.id} className="token-tx-row">
                      <td className="col-tx-time">
                        <span className="tx-time-text">{formatDateVN(tx.createdAt)}</span>
                      </td>

                      <td className="col-tx-id">
                        <span className="tx-code-sub">{tx.id}</span>
                      </td>

                      <td className="col-tx-type">{renderTypeText(tx.type)}</td>

                      <td className="col-tx-desc">
                        <div className="tx-details-wrap">
                          <span className="tx-title">{tx.title}</span>
                          {tx.description && (
                            <span className="tx-desc">{tx.description}</span>
                          )}
                        </div>
                      </td>

                      <td className="col-tx-amount text-right">
                        <span
                          className={`tx-amount-text ${
                            isPositive ? 'text-positive' : 'text-negative'
                          }`}
                        >
                          {isPositive ? `+${tx.amount}` : tx.amount} token
                        </span>
                      </td>

                      <td className="col-tx-balance text-right">
                        <span className="tx-balance-after">
                          {tx.balanceAfter != null
                            ? `${Number(tx.balanceAfter).toLocaleString('vi-VN')} token`
                            : '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Dạng thẻ trên Mobile (<= 640px) */}
          <div className="token-tx-cards-mobile">
            {transactions.map((tx) => {
              const isPositive = tx.amount > 0;
              return (
                <div key={tx.id} className="token-tx-card-mobile">
                  <div className="tx-mobile-header">
                    <div className="tx-mobile-type-code">
                      {renderTypeText(tx.type)}
                      <span className="tx-mobile-id">{tx.id}</span>
                    </div>
                    <span
                      className={`tx-mobile-amount ${
                        isPositive ? 'text-positive' : 'text-negative'
                      }`}
                    >
                      {isPositive ? `+${tx.amount}` : tx.amount} token
                    </span>
                  </div>

                  <div className="tx-mobile-body">
                    <span className="tx-mobile-title">{tx.title}</span>
                    {tx.description && (
                      <p className="tx-mobile-desc">{tx.description}</p>
                    )}
                  </div>

                  <div className="tx-mobile-footer">
                    <span className="tx-mobile-time">{formatDateVN(tx.createdAt)}</span>
                    <span className="tx-mobile-balance">
                      Sau GD: {tx.balanceAfter != null ? `${Number(tx.balanceAfter).toLocaleString('vi-VN')} token` : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
