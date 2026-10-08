import { useState, useEffect, useCallback } from 'react';
import { getTransactions, getTransactionDetailWithWebhook } from '../../services/paymentService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { WebhookLogModal } from '../../components/payment/WebhookLogModal';
import { formatCurrencyVND } from '../../utils/formatCurrency';
import {
  FiFilter,
  FiSearch,
  FiEye,
  FiRefreshCw,
  FiCalendar,
  FiDollarSign,
  FiCheckCircle,
  FiAlertTriangle,
  FiClock,
} from 'react-icons/fi';
import './AdminPayments.css';

/**
 * Trang Quản lý Giao dịch Thanh toán SePay (AdminPayments) dành cho Quản trị viên.
 * - Thống kê nhanh tình trạng giao dịch
 * - Bộ lọc trạng thái, loại đơn và khoảng thời gian
 * - Bảng danh sách chi tiết
 * - Khung modal xem chi tiết đối soát & JSON Webhook log mẫu
 */
export const AdminPayments = () => {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Bộ lọc
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal chi tiết & Webhook
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Lấy danh sách giao dịch từ paymentService
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTransactions({
        status: statusFilter,
        orderType: typeFilter,
        search: searchQuery,
        startDate,
        endDate,
        page: 1,
        pageSize: 50,
      });
      setTransactions(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error('Lỗi khi tải danh sách giao dịch:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, searchQuery, startDate, endDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Mở modal xem chi tiết một giao dịch
  const handleOpenDetail = async (transactionId) => {
    try {
      setModalLoading(true);
      const detail = await getTransactionDetailWithWebhook(transactionId);
      setSelectedDetail(detail);
      setModalOpen(true);
    } catch (err) {
      alert(`Không thể lấy chi tiết giao dịch: ${err.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  // Thống kê nhanh
  const successCount = transactions.filter((t) => t.status === 'SUCCESS').length;
  const pendingCount = transactions.filter((t) => t.status === 'PENDING').length;
  const wrongAmountCount = transactions.filter((t) => t.status === 'WRONG_AMOUNT').length;

  return (
    <div className="admin-payments-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Quản lý giao dịch SePay (VietQR)</h2>
          <p className="page-subtitle">
            Theo dõi, lọc trạng thái dòng tiền và đối soát log Webhook hệ thống
          </p>
        </div>
        <button
          type="button"
          onClick={fetchTransactions}
          className="btn-refresh-list"
          title="Tải lại danh sách"
        >
          <FiRefreshCw className={loading ? 'spin-icon' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Thẻ thống kê tổng quan */}
      <div className="payments-stat-cards">
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-blue">
            <FiDollarSign className="stat-icon text-blue" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Tổng giao dịch</span>
            <span className="stat-value">{total}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-green">
            <FiCheckCircle className="stat-icon text-green" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Đã thanh toán</span>
            <span className="stat-value text-green">{successCount}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-orange">
            <FiAlertTriangle className="stat-icon text-orange" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Sai số tiền</span>
            <span className="stat-value text-orange">{wrongAmountCount}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-yellow">
            <FiClock className="stat-icon text-yellow" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Đang chờ xử lý</span>
            <span className="stat-value text-yellow">{pendingCount}</span>
          </div>
        </div>
      </div>

      {/* Thanh bộ lọc dữ liệu */}
      <div className="payments-filter-toolbar">
        <div className="filter-group-left">
          {/* Ô tìm kiếm */}
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn, mã GD, người dùng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Lọc trạng thái */}
          <div className="select-box">
            <FiFilter className="select-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Lọc theo trạng thái"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="SUCCESS">Đã thanh toán</option>
              <option value="PENDING">Chờ thanh toán</option>
              <option value="WRONG_AMOUNT">Sai số tiền</option>
              <option value="EXPIRED">Hết hạn</option>
              <option value="CANCELLED">Đã huỷ</option>
            </select>
          </div>

          {/* Lọc loại đơn */}
          <div className="select-box">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Lọc theo loại dịch vụ"
            >
              <option value="ALL">Tất cả loại giao dịch</option>
              <option value="CANDIDATE_TOKEN">Nạp Token (Ứng viên)</option>
              <option value="EMPLOYER_PACKAGE">Mua Gói (Nhà tuyển dụng)</option>
            </select>
          </div>
        </div>

        {/* Lọc ngày */}
        <div className="filter-group-right">
          <div className="date-filter-box">
            <FiCalendar className="date-icon" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Từ ngày"
            />
            <span className="date-sep">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="Đến ngày"
            />
          </div>
        </div>
      </div>

      {/* Bảng danh sách giao dịch */}
      <div className="data-table-container">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã đơn hàng</th>
                <th>Khách hàng</th>
                <th>Loại dịch vụ</th>
                <th>Số tiền</th>
                <th>Thực nhận</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-6">
                    <div className="table-inline-spinner"></div>
                    <span>Đang tải dữ liệu giao dịch...</span>
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((row) => (
                  <tr key={row.transactionId}>
                    <td>
                      <span className="mono bold">{row.orderId}</span>
                      <div className="tx-id-sub">GD: {row.transactionId}</div>
                    </td>
                    <td>
                      <div className="user-name-bold">{row.userName}</div>
                      <div className="user-email-muted">{row.userEmail}</div>
                    </td>
                    <td>
                      <span className="badge-type-tag">
                        {row.orderType === 'CANDIDATE_TOKEN' ? 'Token Ứng viên' : 'Gói Tuyển dụng'}
                      </span>
                      <div className="service-name-sub">{row.serviceName}</div>
                    </td>
                    <td className="bold">{formatCurrencyVND(row.expectedAmount)}</td>
                    <td
                      className={`bold ${
                        row.status === 'WRONG_AMOUNT' ? 'text-danger' : 'text-success'
                      }`}
                    >
                      {formatCurrencyVND(row.actualAmount)}
                    </td>
                    <td>
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="time-col">
                      {row.receivedAt
                        ? new Date(row.receivedAt).toLocaleString('vi-VN')
                        : 'Chưa nhận tiền'}
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(row.transactionId)}
                        className="btn-action-view"
                        title="Xem đối soát & log webhook"
                        disabled={modalLoading}
                      >
                        <FiEye />
                        <span>Chi tiết</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center empty-state">
                    <div className="empty-state-content">
                      <FiAlertTriangle className="empty-icon" />
                      <p className="empty-title">Không tìm thấy giao dịch nào phù hợp</p>
                      <p className="empty-hint">
                        Hãy thử điều chỉnh lại bộ lọc trạng thái, loại đơn hoặc từ khóa tìm kiếm.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div className="data-table-pagination">
          <span>
            Hiển thị <strong>{transactions.length}</strong> trong <strong>{total}</strong> giao dịch
          </span>
          <div className="pagination-controls">
            <button className="btn btn-outline" disabled>
              Trang trước
            </button>
            <button className="btn btn-outline" disabled>
              Trang sau
            </button>
          </div>
        </div>
      </div>

      {/* Modal chi tiết và Webhook JSON */}
      <WebhookLogModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        data={selectedDetail}
      />
    </div>
  );
};
