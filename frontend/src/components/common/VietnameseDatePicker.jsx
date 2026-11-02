import React, { useState, useEffect, useRef } from 'react';
import { FiCalendar, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import './VietnameseDatePicker.css';

const MONTH_NAMES = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
];

const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

/**
 * Bộ chọn ngày định dạng Việt Nam:
 * - Hiển thị dạng dd/mm/yyyy, placeholder "dd/mm/yyyy"
 * - Lịch bắt đầu từ thứ Hai (T2 -> CN)
 * - Ngôn ngữ tiếng Việt chuẩn mực
 * - Tương thích ngược hai chiều với giá trị YYYY-MM-DD
 */
export const VietnameseDatePicker = ({
  value = '', // YYYY-MM-DD format
  onChange,
  placeholder = 'dd/mm/yyyy',
  disabled = false,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse YYYY-MM-DD sang Date object
  const parseIsoDate = (isoStr) => {
    if (!isoStr || typeof isoStr !== 'string') return null;
    const parts = isoStr.split('-');
    if (parts.length !== 3) return null;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
    return new Date(y, m, d);
  };

  const selectedDate = parseIsoDate(value);

  // Trạng thái tháng/năm đang xem trong popup
  const today = new Date();
  const [viewYear, setViewYear] = useState(selectedDate ? selectedDate.getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate ? selectedDate.getMonth() : today.getMonth());

  // Trạng thái chuỗi hiển thị trong ô input
  const formatDisplay = (isoStr) => {
    if (!isoStr) return '';
    const parts = isoStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoStr;
  };

  const [inputValue, setInputValue] = useState(formatDisplay(value));

  useEffect(() => {
    setInputValue(formatDisplay(value));
    if (value) {
      const parsed = parseIsoDate(value);
      if (parsed) {
        setViewYear(parsed.getFullYear());
        setViewMonth(parsed.getMonth());
      }
    }
  }, [value]);

  // Đóng khi click ra ngoài
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Chuyển tháng
  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Chọn ngày trên lịch
  const handleSelectDay = (day, isCurrentMonth = true) => {
    if (!isCurrentMonth) return;
    const mStr = String(viewMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const isoString = `${viewYear}-${mStr}-${dStr}`;
    onChange?.(isoString);
    setIsOpen(false);
  };

  // Chọn hôm nay
  const handleSelectToday = (e) => {
    e.stopPropagation();
    const now = new Date();
    const yStr = now.getFullYear();
    const mStr = String(now.getMonth() + 1).padStart(2, '0');
    const dStr = String(now.getDate()).padStart(2, '0');
    const isoString = `${yStr}-${mStr}-${dStr}`;
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    onChange?.(isoString);
    setIsOpen(false);
  };

  // Xóa ngày đã chọn
  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.('');
    setInputValue('');
  };

  // Xử lý khi người dùng gõ trực tiếp dd/mm/yyyy
  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputValue(text);

    // Kiểm tra định dạng dd/mm/yyyy
    const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = text.match(regex);
    if (match) {
      const d = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const y = parseInt(match[3], 10);

      if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1970 && y <= 2100) {
        const isoString = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        onChange?.(isoString);
        setViewYear(y);
        setViewMonth(m - 1);
      }
    } else if (text.trim() === '') {
      onChange?.('');
    }
  };

  // Tính toán ma trận ngày bắt đầu từ thứ Hai (T2 = cột 0, CN = cột 6)
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const startCol = (firstDayOfMonth.getDay() + 6) % 7; // Chuyển 0 (CN) -> 6, 1 (T2) -> 0
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const calendarDays = [];

  // Các ngày cuối tháng trước
  for (let i = startCol - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
    });
  }

  // Các ngày của tháng hiện tại
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    calendarDays.push({
      day: d,
      isCurrentMonth: true,
    });
  }

  // Các ngày bù đầu tháng sau để đủ ô
  const remainingCells = (7 - (calendarDays.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    calendarDays.push({
      day: d,
      isCurrentMonth: false,
    });
  }

  const isTodayDate = (day) => {
    return (
      day === today.getDate() &&
      viewMonth === today.getMonth() &&
      viewYear === today.getFullYear()
    );
  };

  const isSelectedDate = (day) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      viewMonth === selectedDate.getMonth() &&
      viewYear === selectedDate.getFullYear()
    );
  };

  return (
    <div className="vn-datepicker" ref={containerRef}>
      <div className="vn-datepicker__input-wrap">
        <input
          type="text"
          id={id}
          className="vn-datepicker__input"
          value={inputValue}
          onChange={handleInputChange}
          onClick={() => !disabled && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={10}
        />
        {value ? (
          <button
            type="button"
            className="vn-datepicker__clear-btn"
            onClick={handleClear}
            title="Xóa ngày"
            aria-label="Xóa ngày"
          >
            <FiX />
          </button>
        ) : (
          <button
            type="button"
            className="vn-datepicker__icon-btn"
            onClick={() => !disabled && setIsOpen((prev) => !prev)}
            aria-label="Mở lịch chọn ngày"
          >
            <FiCalendar />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="vn-datepicker__popup" role="dialog" aria-modal="true">
          <div className="vn-datepicker__header">
            <button
              type="button"
              className="vn-datepicker__nav-btn"
              onClick={handlePrevMonth}
              aria-label="Tháng trước"
            >
              <FiChevronLeft />
            </button>
            <span className="vn-datepicker__title">
              {MONTH_NAMES[viewMonth]} năm {viewYear}
            </span>
            <button
              type="button"
              className="vn-datepicker__nav-btn"
              onClick={handleNextMonth}
              aria-label="Tháng sau"
            >
              <FiChevronRight />
            </button>
          </div>

          <div className="vn-datepicker__grid">
            {/* Hàng thứ trong tuần bắt đầu từ Thứ Hai */}
            <div className="vn-datepicker__weekdays">
              {DAY_LABELS.map((label) => (
                <div key={label} className="vn-datepicker__weekday">
                  {label}
                </div>
              ))}
            </div>

            {/* Các ô ngày */}
            <div className="vn-datepicker__days">
              {calendarDays.map((item, idx) => {
                const isSelected = item.isCurrentMonth && isSelectedDate(item.day);
                const isCurrent = item.isCurrentMonth && isTodayDate(item.day);

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!item.isCurrentMonth}
                    className={`vn-datepicker__day ${
                      !item.isCurrentMonth ? 'vn-datepicker__day--outside' : ''
                    } ${isCurrent ? 'vn-datepicker__day--today' : ''} ${
                      isSelected ? 'vn-datepicker__day--selected' : ''
                    }`}
                    onClick={() => handleSelectDay(item.day, item.isCurrentMonth)}
                  >
                    {item.day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="vn-datepicker__footer">
            <button
              type="button"
              className="vn-datepicker__action-btn"
              onClick={handleSelectToday}
            >
              Hôm nay
            </button>
            {value && (
              <button
                type="button"
                className="vn-datepicker__action-btn vn-datepicker__action-btn--clear"
                onClick={handleClear}
              >
                Xóa
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

