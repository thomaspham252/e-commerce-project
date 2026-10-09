import { useState } from 'react';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import './QRCodeCard.css';

/**
 * Component hiển thị mã QR VietQR (QRCodeCard).
 * - Hiển thị ảnh QR VietQR chuẩn ngân hàng.
 * - Hỗ trợ trạng thái mờ khi hết hạn hoặc đã thanh toán xong.
 * - Có cơ chế xử lý lỗi khi ảnh QR không tải được.
 *
 * @param {string} qrCodeUrl - Đường dẫn hình ảnh QR VietQR
 * @param {string} status - Trạng thái đơn hàng (PENDING, SUCCESS, EXPIRED,...)
 * @param {string} bankName - Tên ngân hàng nhận
 * @param {string} amountFormatted - Số tiền đã format
 */
export const QRCodeCard = ({ qrCodeUrl, status = 'PENDING', bankName, amountFormatted }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isExpired = status === 'EXPIRED';
  const isSuccess = status === 'SUCCESS';
  const isCancelled = status === 'CANCELLED';

  return (
    <div className="qrcode-card">
      <div className="qrcode-header">
        <span className="vietqr-badge">VietQR PRO</span>
        <span className="napab-badge">Chuyển nhanh 24/7</span>
      </div>

      <div className="qrcode-container">
        {/* Lớp phủ khi đơn đã kết thúc (Hết hạn / Thành công / Đã huỷ) */}
        {isExpired && (
          <div className="qrcode-overlay expired-overlay">
            <FiAlertCircle className="overlay-icon" />
            <span className="overlay-text">Mã QR đã hết hạn</span>
            <span className="overlay-sub">Vui lòng tạo đơn mới</span>
          </div>
        )}

        {isSuccess && (
          <div className="qrcode-overlay success-overlay">
            <FiCheckCircle className="overlay-icon" />
            <span className="overlay-text">Đã thanh toán</span>
            <span className="overlay-sub">Giao dịch thành công</span>
          </div>
        )}

        {isCancelled && (
          <div className="qrcode-overlay cancelled-overlay">
            <FiAlertCircle className="overlay-icon" />
            <span className="overlay-text">Đơn đã bị huỷ</span>
          </div>
        )}

        {/* Trạng thái tải ảnh */}
        {!imageLoaded && !imageError && (
          <div className="qrcode-skeleton">
            <div className="skeleton-spinner"></div>
            <span>Đang tạo mã VietQR...</span>
          </div>
        )}

        {imageError ? (
          <div className="qrcode-fallback">
            <div className="fallback-qr-box">
              <span className="fallback-title">VIETQR</span>
              <span className="fallback-info">{bankName}</span>
              <span className="fallback-amount">{amountFormatted}</span>
            </div>
            <p className="fallback-note">Vui lòng chuyển khoản theo thông tin bên cạnh</p>
          </div>
        ) : (
          <img
            src={qrCodeUrl}
            alt="Mã QR chuyển khoản VietQR"
            className={`qrcode-image ${imageLoaded ? 'loaded' : 'loading'} ${
              isExpired || isCancelled || isSuccess ? 'blurred' : ''
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
        )}
      </div>

      <div className="qrcode-guide">
        <p className="guide-main">Quét mã bằng ứng dụng Ngân hàng hoặc Ví điện tử</p>
        <p className="guide-sub">Hệ thống tự động kích hoạt ngay sau 3 - 5 giây nhận tiền</p>
      </div>
    </div>
  );
};
