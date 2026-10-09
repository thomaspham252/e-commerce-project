import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getPaymentOrder, simulateOrderStatus } from '../../services/paymentService';
import { QRCodeCard } from '../../components/payment/QRCodeCard';
import { TransferInfoCard } from '../../components/payment/TransferInfoCard';
import { CountdownTimer } from '../../components/payment/CountdownTimer';
import { PaymentDevSimulator } from '../../components/payment/PaymentDevSimulator';
import { StatusBadge } from '../../components/common/StatusBadge';
import { usePaymentPolling } from '../../hooks/usePaymentPolling';
import { formatCurrencyVND } from '../../utils/formatCurrency';
import { FiShield, FiAlertCircle, FiRefreshCw, FiX } from 'react-icons/fi';
import './PaymentPage.css';

/**
 * Màn hình thanh toán chuyển khoản VietQR (PaymentPage) dùng chung.
 * Tái sử dụng 100% cho cả Ứng viên (nạp token) và Nhà tuyển dụng (mua gói).
 * Tích hợp cơ chế Polling tự động phát hiện thanh toán thành công và chuyển hướng.
 */
export const PaymentPage = () => {
  const { orderId: paramOrderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryType = searchParams.get('type'); // 'token' hoặc 'package'
  const queryOrderId = searchParams.get('orderId');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // 1. Tải hoặc khởi tạo đơn thanh toán
  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Nếu có mã đơn trên URL params hoặc query
      const targetOrderId = paramOrderId || queryOrderId;

      if (targetOrderId) {
        const existingOrder = await getPaymentOrder(targetOrderId);
        setOrder(existingOrder);
      } else {
        // Nếu truy cập bằng ?type=package hoặc mặc định là token
        const isPackage = queryType === 'package';
        const defaultOrder = await getPaymentOrder(
          isPackage ? 'PAY-20261009-002' : 'PAY-20261009-001'
        );
        setOrder(defaultOrder);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [paramOrderId, queryOrderId, queryType]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  // 2. Callback xử lý khi Polling phát hiện trạng thái thay đổi
  const handleStatusChange = useCallback(
    (newStatus) => {
      if (newStatus !== 'PENDING') {
        // Tự động chuyển ngay sang màn hình kết quả tương ứng
        if (order?.orderId) {
          navigate(`/thanh-toan/ket-qua/${order.orderId}`);
        }
      }
    },
    [navigate, order?.orderId]
  );

  // Kích hoạt hook Polling kiểm tra mỗi 3 giây
  const { isPolling, refetch } = usePaymentPolling(
    order?.orderId,
    handleStatusChange,
    3000,
    order?.status === 'PENDING'
  );

  // 3. Xử lý khi hết hạn 15 phút
  const handleExpire = async () => {
    if (!order || order.status !== 'PENDING') return;
    try {
      await simulateOrderStatus(order.orderId, 'EXPIRED');
      navigate(`/thanh-toan/ket-qua/${order.orderId}`);
    } catch (err) {
      console.error('Lỗi khi chuyển trạng thái hết hạn:', err);
    }
  };

  // 4. Xử lý huỷ đơn thanh toán
  const handleCancelOrder = async () => {
    if (!order) return;
    try {
      await simulateOrderStatus(order.orderId, 'CANCELLED');
      setShowCancelModal(false);
      navigate(`/thanh-toan/ket-qua/${order.orderId}`);
    } catch (err) {
      alert(`Lỗi khi huỷ đơn: ${err.message}`);
    }
  };

  // 5. Chuyển đổi nhanh loại dịch vụ để kiểm thử tính dùng chung (SC-002)
  const handleSwitchServiceType = async (type) => {
    try {
      setLoading(true);
      const targetId = type === 'package' ? 'PAY-20261009-002' : 'PAY-20261009-001';
      const fetched = await getPaymentOrder(targetId);
      setOrder(fetched);
      navigate(`/thanh-toan/${targetId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-page-container loading-wrapper">
        <div className="payment-loading-spinner"></div>
        <p className="loading-text">Đang tải cổng thanh toán SePay...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="payment-page-container error-wrapper">
        <FiAlertCircle className="error-icon" />
        <h2>Không thể tải đơn thanh toán</h2>
        <p>{error || 'Đơn hàng không tồn tại'}</p>
        <button type="button" onClick={() => loadOrder()} className="btn-retry">
          <FiRefreshCw /> Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        {/* Thanh chọn nhanh vai trò (Phục vụ thử nghiệm dùng chung) */}
        <div className="role-switch-bar">
          <span className="switch-hint">Thử nghiệm loại dịch vụ:</span>
          <button
            type="button"
            className={`switch-tab ${order.orderType === 'CANDIDATE_TOKEN' ? 'active' : ''}`}
            onClick={() => handleSwitchServiceType('token')}
          >
            Ứng viên: Nạp Token (50.000 ₫)
          </button>
          <button
            type="button"
            className={`switch-tab ${order.orderType === 'EMPLOYER_PACKAGE' ? 'active' : ''}`}
            onClick={() => handleSwitchServiceType('package')}
          >
            Nhà tuyển dụng: Mua Gói (500.000 ₫)
          </button>
        </div>

        {/* Thanh tiêu đề và đếm ngược */}
        <div className="payment-top-bar">
          <div className="order-main-info">
            <div className="service-title-line">
              <h1 className="payment-heading">{order.serviceName}</h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="payment-subheading">
              Người thanh toán: <strong>{order.userName}</strong> ({order.userEmail}) • Số tiền:{' '}
              <strong className="primary-amount">{formatCurrencyVND(order.amount)}</strong>
            </p>
          </div>

          <div className="order-timer-section">
            <CountdownTimer expiresAt={order.expiresAt} onExpire={handleExpire} />
          </div>
        </div>

        {/* Khung nội dung chính: 2 cột (Desktop) hoặc xếp chồng (Mobile) */}
        <div className="payment-grid-layout">
          {/* Cột trái: Mã QR VietQR */}
          <div className="grid-left-col">
            <QRCodeCard
              qrCodeUrl={order.qrCodeUrl}
              status={order.status}
              bankName={order.bankName}
              amountFormatted={formatCurrencyVND(order.amount)}
            />
            <div className="security-guarantee">
              <FiShield className="shield-icon" />
              <span>Cổng chuyển khoản trực tiếp VietQR an toàn & bảo mật 100%</span>
            </div>
          </div>

          {/* Cột phải: Bảng chi tiết chuyển khoản & nút sao chép */}
          <div className="grid-right-col">
            <TransferInfoCard order={order} />

            {/* Thanh tác vụ phụ bên dưới */}
            <div className="payment-footer-actions">
              <button
                type="button"
                onClick={() => refetch()}
                className="btn-footer-check"
                title="Bấm để kiểm tra ngay nếu mạng chậm"
              >
                <FiRefreshCw className={isPolling ? 'spin-icon' : ''} />
                <span>Kiểm tra trạng thái</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="btn-footer-cancel"
              >
                Huỷ đơn thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal xác nhận huỷ đơn */}
      {showCancelModal && (
        <div className="modal-backdrop">
          <div className="cancel-confirm-modal">
            <div className="modal-top">
              <h3>Xác nhận huỷ đơn thanh toán</h3>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setShowCancelModal(false)}
              >
                <FiX />
              </button>
            </div>
            <p className="modal-body-text">
              Bạn có chắc chắn muốn huỷ đơn thanh toán cho{' '}
              <strong>{order.serviceName}</strong> (Mã đơn: {order.orderId}) không?
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-modal-back"
                onClick={() => setShowCancelModal(false)}
              >
                Tiếp tục thanh toán
              </button>
              <button
                type="button"
                className="btn-modal-confirm"
                onClick={handleCancelOrder}
              >
                Xác nhận huỷ đơn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bảng công cụ giả lập kiểm thử kịch bản SePay (Dev Simulator) */}
      <PaymentDevSimulator
        orderId={order.orderId}
        onStatusUpdated={(updated) => {
          setOrder(updated);
          if (updated.status !== 'PENDING') {
            navigate(`/thanh-toan/ket-qua/${updated.orderId}`);
          }
        }}
      />
    </div>
  );
};
