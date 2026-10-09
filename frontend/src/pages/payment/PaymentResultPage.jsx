import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { getPaymentOrder, createPaymentOrder } from '../../services/paymentService';
import { formatCurrencyVND } from '../../utils/formatCurrency';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiClock,
  FiXCircle,
  FiArrowLeft,
  FiRefreshCw,
  FiPhoneCall,
  FiMail,
  FiMessageSquare,
} from 'react-icons/fi';
import './PaymentResultPage.css';

/**
 * Màn hình kết quả thanh toán (PaymentResultPage) dùng chung.
 * Xử lý và hiển thị tương ứng với 4 trạng thái:
 * 1. SUCCESS: Thanh toán thành công
 * 2. EXPIRED: Đơn hàng hết hạn
 * 3. WRONG_AMOUNT: Chuyển sai số tiền (thiếu/thừa tiền)
 * 4. CANCELLED: Đơn hàng đã huỷ
 */
export const PaymentResultPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRecreating, setIsRecreating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await getPaymentOrder(orderId);
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  // Xử lý tạo lại đơn thanh toán mới khi đơn cũ hết hạn
  const handleRecreateOrder = async () => {
    if (!order) return;
    try {
      setIsRecreating(true);
      const newOrder = await createPaymentOrder({
        orderType: order.orderType,
        serviceName: order.serviceName,
        amount: order.amount,
        userId: order.userId,
        userName: order.userName,
        userEmail: order.userEmail,
        userRole: order.userRole,
      });
      navigate(`/thanh-toan/${newOrder.orderId}`);
    } catch (err) {
      alert(`Không thể tạo đơn mới: ${err.message}`);
    } finally {
      setIsRecreating(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-result-container loading-state">
        <div className="result-spinner"></div>
        <p>Đang tải kết quả giao dịch...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="payment-result-container error-state">
        <FiXCircle className="error-icon" />
        <h2>Không tìm thấy thông tin đơn hàng</h2>
        <p>{error || 'Mã đơn thanh toán không hợp lệ hoặc đã bị xoá.'}</p>
        <Link to="/" className="btn-action primary">
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  const isSuccess = order.status === 'SUCCESS';
  const isWrongAmount = order.status === 'WRONG_AMOUNT';
  const isExpired = order.status === 'EXPIRED';
  const isCancelled = order.status === 'CANCELLED';

  const returnPath = order.orderType === 'EMPLOYER_PACKAGE' ? '/employer/jobs' : '/';
  const returnLabel =
    order.orderType === 'EMPLOYER_PACKAGE'
      ? 'Về trang quản lý tuyển dụng'
      : 'Về ví token / Trang chủ';

  return (
    <div className="payment-result-page">
      <div className="payment-result-card">
        {/* ================= BIẾN THỂ: THÀNH CÔNG ================= */}
        {isSuccess && (
          <div className="result-body success">
            <div className="result-icon-wrapper success-bg">
              <FiCheckCircle className="result-icon success-color" />
            </div>
            <h1 className="result-title">Thanh toán thành công!</h1>
            <p className="result-subtitle">
              Hệ thống đã nhận được tiền chuyển khoản và kích hoạt dịch vụ cho tài khoản của bạn.
            </p>

            <div className="result-details-box">
              <div className="detail-row">
                <span className="detail-label">Mã đơn hàng</span>
                <span className="detail-value mono bold">{order.orderId}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Dịch vụ</span>
                <span className="detail-value">{order.serviceName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Số tiền đã thanh toán</span>
                <span className="detail-value amount-success bold">
                  {formatCurrencyVND(order.amount)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Trạng thái</span>
                <StatusBadge status={order.status} />
              </div>
              <div className="detail-row">
                <span className="detail-label">Thời gian giao dịch</span>
                <span className="detail-value">
                  {new Date().toLocaleString('vi-VN')}
                </span>
              </div>
            </div>

            <div className="result-actions">
              <Link to={returnPath} className="btn-action primary">
                {returnLabel}
              </Link>
              <Link to="/admin/payments" className="btn-action secondary">
                Xem trong Quản lý Giao dịch (Admin)
              </Link>
            </div>
          </div>
        )}

        {/* ================= BIẾN THỂ: SAI SỐ TIỀN ================= */}
        {isWrongAmount && (
          <div className="result-body wrong-amount">
            <div className="result-icon-wrapper warning-bg">
              <FiAlertTriangle className="result-icon warning-color" />
            </div>
            <h1 className="result-title warning-text">Giao dịch cần hỗ trợ - Sai số tiền</h1>
            <p className="result-subtitle">
              Hệ thống đã ghi nhận giao dịch của bạn nhưng số tiền thực nhận không khớp với giá trị đơn hàng.
            </p>

            <div className="result-details-box">
              <div className="detail-row">
                <span className="detail-label">Mã đơn hàng</span>
                <span className="detail-value mono bold">{order.orderId}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Số tiền đơn hàng yêu cầu</span>
                <span className="detail-value bold">{formatCurrencyVND(order.amount)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Số tiền hệ thống thực nhận</span>
                <span className="detail-value wrong-amount-text bold">
                  {formatCurrencyVND(order.actualAmount || Math.round(order.amount * 0.8))}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Trạng thái</span>
                <StatusBadge status={order.status} />
              </div>
            </div>

            {/* Khung hướng dẫn hỗ trợ khách hàng */}
            <div className="support-contact-box">
              <h4 className="support-title">Hướng dẫn giải quyết:</h4>
              <p className="support-desc">
                Vui lòng không tiếp tục chuyển khoản thêm. Hãy liên hệ ngay với bộ phận chăm sóc khách hàng của JobViet kèm theo ảnh chụp màn hình chuyển khoản để được hoàn tiền hoặc kích hoạt dịch vụ thủ công:
              </p>
              <div className="support-channels">
                <div className="channel-item">
                  <FiPhoneCall className="channel-icon" />
                  <span>Hotline: <strong>1900 6868</strong> (8:00 - 21:00)</span>
                </div>
                <div className="channel-item">
                  <FiMail className="channel-icon" />
                  <span>Email: <strong>hotro@jobviet.vn</strong></span>
                </div>
                <div className="channel-item">
                  <FiMessageSquare className="channel-icon" />
                  <span>Zalo OA: <strong>JobViet Support</strong></span>
                </div>
              </div>
            </div>

            <div className="result-actions">
              <button
                type="button"
                onClick={() => navigate(`/thanh-toan/${order.orderId}`)}
                className="btn-action secondary"
              >
                <FiArrowLeft /> Quay lại trang thanh toán
              </button>
              <Link to="/" className="btn-action primary">
                Về trang chủ
              </Link>
            </div>
          </div>
        )}

        {/* ================= BIẾN THỂ: HẾT HẠN ================= */}
        {isExpired && (
          <div className="result-body expired">
            <div className="result-icon-wrapper muted-bg">
              <FiClock className="result-icon muted-color" />
            </div>
            <h1 className="result-title muted-text">Đơn hàng đã hết hạn thanh toán</h1>
            <p className="result-subtitle">
              Đơn hàng đã quá thời hạn giữ chỗ 15 phút. Mã QR và thông tin chuyển khoản cũ đã bị khóa để đảm bảo an toàn.
            </p>

            <div className="result-details-box">
              <div className="detail-row">
                <span className="detail-label">Mã đơn hàng</span>
                <span className="detail-value mono bold">{order.orderId}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Dịch vụ</span>
                <span className="detail-value">{order.serviceName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Số tiền</span>
                <span className="detail-value bold">{formatCurrencyVND(order.amount)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Trạng thái</span>
                <StatusBadge status={order.status} />
              </div>
            </div>

            <div className="expired-warning-note">
              ⚠️ <strong>Lưu ý:</strong> Vui lòng <strong>không chuyển khoản</strong> vào mã đơn này nữa. Hãy bấm nút dưới đây để tạo một đơn thanh toán mới.
            </div>

            <div className="result-actions">
              <button
                type="button"
                onClick={handleRecreateOrder}
                className="btn-action primary"
                disabled={isRecreating}
              >
                <FiRefreshCw className={isRecreating ? 'spin-icon' : ''} />
                <span>{isRecreating ? 'Đang tạo đơn mới...' : 'Tạo đơn thanh toán mới'}</span>
              </button>
              <Link to="/" className="btn-action secondary">
                Hủy và về trang chủ
              </Link>
            </div>
          </div>
        )}

        {/* ================= BIẾN THỂ: ĐÃ HUỶ ================= */}
        {isCancelled && (
          <div className="result-body cancelled">
            <div className="result-icon-wrapper danger-bg">
              <FiXCircle className="result-icon danger-color" />
            </div>
            <h1 className="result-title danger-text">Đơn thanh toán đã bị huỷ</h1>
            <p className="result-subtitle">
              Bạn hoặc hệ thống đã huỷ yêu cầu thanh toán cho đơn hàng này.
            </p>

            <div className="result-details-box">
              <div className="detail-row">
                <span className="detail-label">Mã đơn hàng</span>
                <span className="detail-value mono bold">{order.orderId}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Trạng thái</span>
                <StatusBadge status={order.status} />
              </div>
            </div>

            <div className="result-actions">
              <button
                type="button"
                onClick={handleRecreateOrder}
                className="btn-action primary"
                disabled={isRecreating}
              >
                <FiRefreshCw /> Tạo lại đơn thanh toán
              </button>
              <Link to="/" className="btn-action secondary">
                Quay về trang chủ
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
