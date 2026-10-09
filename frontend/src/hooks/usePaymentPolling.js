import { useState, useEffect, useCallback, useRef } from 'react';
import { checkPaymentStatus } from '../services/paymentService';

/**
 * Custom Hook: usePaymentPolling
 * Thực hiện kiểm tra định kỳ (polling) trạng thái thanh toán của đơn hàng.
 * Tự động dừng polling khi đơn hàng chuyển sang trạng thái kết thúc (SUCCESS, EXPIRED, WRONG_AMOUNT, CANCELLED).
 *
 * @param {string} orderId - Mã đơn hàng cần theo dõi
 * @param {Function} onStatusChange - Callback được gọi khi trạng thái thay đổi
 * @param {number} intervalMs - Chu kỳ polling (mặc định 3000ms = 3 giây)
 * @param {boolean} enabled - Bật/tắt chế độ polling
 */
export const usePaymentPolling = (
  orderId,
  onStatusChange,
  intervalMs = 3000,
  enabled = true
) => {
  const [currentStatus, setCurrentStatus] = useState('PENDING');
  const [isPolling, setIsPolling] = useState(enabled);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);
  const isMountedRef = useRef(true);

  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const checkStatus = useCallback(async () => {
    if (!orderId) return;

    try {
      const result = await checkPaymentStatus(orderId);
      if (!isMountedRef.current) return;

      if (result.status !== currentStatus) {
        setCurrentStatus(result.status);
        if (onStatusChange) {
          onStatusChange(result.status, result);
        }

        // Tự động dừng polling nếu đơn không còn ở trạng thái PENDING
        if (result.status !== 'PENDING') {
          stopPolling();
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message);
      }
    }
  }, [orderId, currentStatus, onStatusChange, stopPolling]);

  useEffect(() => {
    isMountedRef.current = true;

    if (enabled && orderId) {
      setIsPolling(true);
      // Chạy ngay lần đầu
      checkStatus();
      // Thiết lập chu kỳ polling
      timerRef.current = setInterval(checkStatus, intervalMs);
    }

    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [enabled, orderId, intervalMs, checkStatus]);

  return {
    currentStatus,
    isPolling,
    error,
    stopPolling,
    refetch: checkStatus,
  };
};
