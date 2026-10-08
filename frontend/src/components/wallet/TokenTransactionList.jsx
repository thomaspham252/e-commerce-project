import React, { useState } from 'react';
import {
  FiArrowUpRight,
  FiArrowDownLeft,
  FiGift,
  FiRotateCcw,
  FiCalendar,
  FiClock,
  FiSearch,
} from 'react-icons/fi';
import './TokenTransactionList.css';

/**
 * Danh sách Lịch sử Biến động Token của ứng viên.
 * Hỗ trợ bộ lọc loại (Nạp, Tiêu, Hoàn, Tặng), lọc ngày,
 * hiển thị số dư sau giao dịch, đổi màu trực quan (+ xanh / - đỏ)
 * và tự động co dãn sang giao diện Card trên thiết bị di động (<= 640px).
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

  const handleStartDateChange = (e) => {
    const val = e.target.value;
    setStartDate(val);
    onFilterChange?.({ type: filterType, startDate: val, endDate });
  };

  const handleEndDateChange = (e) => {
    const val = e.target.value;
    setEndDate(val);
    onFilterChange?.({ type: filterType, startDate, endDate: val });
  };

  const handleResetFilters = () => {
    setFilterType('ALL');
    setStartDate('');
    setEndDate('');
    onFilterChange?.({ type: 'ALL', startDate: '', endDate: '' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')} - ${d.getDate().toString().padStart(2, '0')}/${(
      d.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${d.getFullYear()}`;
  };

  const renderBadge = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return (
          <span className="tx-badge tx-badge--deposit">
            <FiArrowDownLeft /> Nạp Token
          </span>
        );
      case 'CONSUME':
        return (
          <span className="tx-badge tx-badge--consume">
            <FiArrowUpRight /> Sử dụng
          </span>
        );
      case 'REFUND':
        return (
          <span className="tx-badge tx-badge--refund">
            <FiRotateCcw /> Hoàn lại
          </span>
        );
      case 'BONUS':
        return (
          <span className="tx-badge tx-badge--bonus">
            <FiGift /> Tặng thưởng
          </span>
        );
      default:
        return <span className="tx-badge tx-badge--default">{type}</span>;
    }
  };

  return (
    <div className="token-tx-container">
      {/* Thanh bộ lọc */}
      <div className="token-tx-filter-bar">
        <div className="token-tx-filter-tabs">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'DEPOSIT', label: 'Nạp token' },
            { id: 'CONSUME', label: 'Tiêu dùng' },
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
          <div className="token-tx-date-input-wrap">
            <FiCalendar className="date-icon" />
            <input
              type="date"
              className="token-tx-date-input"
              value={startDate}
              onChange={handleStartDateChange}
              title="Từ ngày"
              placeholder="Từ ngày"
            />
          </div>
          <span className="date-separator">đến</span>
          <div className="token-tx-date-input-wrap">
            <FiCalendar className="date-icon" />
            <input
              type="date"
              className="token-tx-date-input"
              value={endDate}
              onChange={handleEndDateChange}
              title="Đến ngày"
              placeholder="Đến ngày"
            />
          </div>

          {(filterType !== 'ALL' || startDate || endDate) && (
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

      {/* Trạng thái tải hoặc danh sách trống */}
      {loading ? (
        <div className="token-tx-empty-state">
          <p>Đang tải dữ liệu biến động token...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="token-tx-empty-state">
          <FiSearch className="empty-icon" />
          <h4>Không tìm thấy biến động token nào</h4>
          <p>Không có bản ghi phù hợp với tiêu chí lọc của bạn.</p>
          {(filterType !== 'ALL' || startDate || endDate) && (
            <button
              type="button"
              className="btn-retry-filter"
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
                  <th>Thời gian & Mã GD</th>
                  <th>Loại</th>
                  <th>Nội dung chi tiết</th>
                  <th className="text-right">Biến động</th>
                  <th className="text-right">Số dư sau GD</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <tr key={tx.id} className="token-tx-row">
                      <td className="cell-time">
                        <div className="tx-time-text">
                          <FiClock className="cell-clock-icon" />
                          <span>{formatDate(tx.createdAt)}</span>
                        </div>
                        <span className="tx-code-sub">{tx.id}</span>
                      </td>
                      <td>{renderBadge(tx.type)}</td>
                      <td className="cell-details">
                        <strong className="tx-title">{tx.title}</strong>
                        {tx.description && (
                          <span className="tx-desc">{tx.description}</span>
                        )}
                      </td>
                      <td className="text-right cell-amount">
                        <span
                          className={`tx-amount-text ${
                            isPositive ? 'tx-amount--positive' : 'tx-amount--negative'
                          }`}
                        >
                          {isPositive ? `+${tx.amount}` : tx.amount} Token
                        </span>
                      </td>
                      <td className="text-right cell-balance">
                        <span className="tx-balance-after">
                          {tx.balanceAfter != null
                            ? `${Number(tx.balanceAfter).toLocaleString('vi-VN')} Token`
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
                    <div className="tx-mobile-badge-wrap">
                      {renderBadge(tx.type)}
                      <span className="tx-mobile-id">{tx.id}</span>
                    </div>
                    <span
                      className={`tx-mobile-amount ${
                        isPositive ? 'tx-amount--positive' : 'tx-amount--negative'
                      }`}
                    >
                      {isPositive ? `+${tx.amount}` : tx.amount} Token
                    </span>
                  </div>

                  <div className="tx-mobile-body">
                    <h5 className="tx-mobile-title">{tx.title}</h5>
                    {tx.description && (
                      <p className="tx-mobile-desc">{tx.description}</p>
                    )}
                  </div>

                  <div className="tx-mobile-footer">
                    <span className="tx-mobile-time">
                      <FiClock className="cell-clock-icon" />
                      {formatDate(tx.createdAt)}
                    </span>
                    <span className="tx-mobile-balance">
                      Sau GD:{' '}
                      <strong>
                        {tx.balanceAfter != null
                          ? `${Number(tx.balanceAfter).toLocaleString('vi-VN')} Token`
                          : '—'}
                      </strong>
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
