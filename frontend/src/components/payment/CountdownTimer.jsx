import { useState, useEffect, useCallback } from 'react';
import { FiClock } from 'react-icons/fi';
import './CountdownTimer.css';

/**
 * Component Đồng hồ đếm ngược (CountdownTimer) cho đơn thanh toán.
 * - Nhận thời gian hết hạn (expiresAt) hoặc số giây ban đầu.
 * - Đổi màu cảnh báo đỏ/vàng khi thời gian còn dưới 3 phút (180 giây).
 * - Gọi callback onExpire() khi đếm về 00:00.
 *
 * @param {string|number} expiresAt - Chuỗi thời gian hết hạn (ISO 8601) hoặc timestamp
 * @param {Function} onExpire - Hàm gọi khi thời gian kết thúc
 */
export const CountdownTimer = ({ expiresAt, onExpire }) => {
  const getDiff = useCallback(() => {
    if (!expiresAt) return 15 * 60;
    const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
    return diff > 0 ? diff : 0;
  }, [expiresAt]);

  const [remainingSeconds, setRemainingSeconds] = useState(getDiff);

  useEffect(() => {
    setRemainingSeconds(getDiff());

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onExpire) {
            onExpire();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [getDiff, onExpire]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = remainingSeconds > 0 && remainingSeconds <= 180; // Dưới 3 phút
  const isExpired = remainingSeconds === 0;

  return (
    <div
      className={`countdown-timer-box ${isUrgent ? 'urgent' : ''} ${
        isExpired ? 'expired' : ''
      }`}
    >
      <FiClock className="countdown-icon" />
      <span className="countdown-label">
        {isExpired ? 'Đã hết hạn thanh toán' : 'Thời gian giữ đơn còn lại:'}
      </span>
      <span className="countdown-digits">{formattedTime}</span>
    </div>
  );
};
