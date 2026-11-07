/**
 * Tầng dịch vụ thanh toán kết nối trực tiếp với Backend Spring Boot (/api/v1/orders/*, /api/v1/admin/payments/*).
 * Toàn bộ thông tin ngân hàng, nội dung chuyển khoản và mã VietQR được backend xử lý và lưu trong cơ sở dữ liệu.
 */

import { apiClient, getAuthSession } from './apiClient.js';

/**
 * Chuẩn hóa đối tượng đơn hàng trả về từ Backend cho các component Frontend.
 */
const normalizeOrder = (backendData) => {
  const code = backendData.orderCode || backendData.orderId;
  const status =
    backendData.status === 'PAID' || backendData.status === 'FULFILLED'
      ? 'SUCCESS'
      : backendData.status;

  return {
    orderId: code,
    orderCode: code,
    orderType: backendData.orderType,
    serviceName: backendData.serviceName || 'Dịch vụ JobViet',
    amount: Number(backendData.amount),
    actualAmount: backendData.actualAmount ? Number(backendData.actualAmount) : null,
    status: status,
    bankCode: backendData.bankCode,
    bankName: backendData.bankName,
    accountNumber: backendData.accountNumber,
    accountHolder: backendData.accountHolder,
    transferContent: backendData.transferContent,
    qrCodeUrl: backendData.qrCodeUrl,
    createdAt: backendData.createdAt || new Date().toISOString(),
    expiresAt: backendData.expiresAt || null,
    paidAt: backendData.paidAt || null,
  };
};

/**
 * 1. Lấy thông tin chi tiết một đơn thanh toán theo mã đơn từ Backend.
 */
export const getPaymentOrder = async (orderId) => {
  const session = getAuthSession();
  const res = await apiClient.get(`/v1/orders/${orderId}`, {
    headers: session?.id ? { 'X-User-Id': session.id } : {},
  });
  if (res.data?.success && res.data?.data) {
    return normalizeOrder(res.data.data);
  }
  throw new Error(res.data?.message || `Không tìm thấy đơn thanh toán có mã: ${orderId}`);
};

/**
 * 2. Tạo mới một đơn thanh toán (gọi API backend lưu vào MySQL).
 */
export const createPaymentOrder = async ({
  orderType = 'CANDIDATE_TOKEN',
  packageId = null,
  tokenPackageId = null,
}) => {
  const isToken = orderType === 'CANDIDATE_TOKEN' || orderType === 'TOKEN';

  if (isToken && !tokenPackageId) {
    throw new Error('Vui lòng chọn gói nạp Token cụ thể');
  }
  if (!isToken && !packageId) {
    throw new Error('Vui lòng chọn gói dịch vụ tuyển dụng cụ thể');
  }

  const payload = {
    orderType: isToken ? 'TOKEN' : 'SUBSCRIPTION',
    tokenPackageId: isToken ? tokenPackageId : null,
    packageId: !isToken ? packageId : null,
  };

  const res = await apiClient.post('/v1/orders', payload);
  if (res.data?.success && res.data?.data) {
    return normalizeOrder(res.data.data);
  }
  throw new Error(res.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng thanh toán.');
};

/**
 * 3. Kiểm tra trạng thái hiện tại của đơn hàng từ Backend (dùng cho Polling).
 */
export const checkPaymentStatus = async (orderId) => {
  const session = getAuthSession();
  const res = await apiClient.get(`/v1/orders/${orderId}/status`, {
    headers: session?.id ? { 'X-User-Id': session.id } : {},
  });
  if (res.data?.success && res.data?.data) {
    const data = res.data.data;
    let status = data.status;
    if (status === 'PAID' || status === 'FULFILLED') {
      status = 'SUCCESS';
    }
    return {
      orderId: data.orderCode || orderId,
      status: status,
      actualAmount: data.actualAmount,
    };
  }
  throw new Error(res.data?.message || `Không thể kiểm tra trạng thái đơn hàng ${orderId}`);
};

/**
 * 4. Huỷ đơn thanh toán trên Backend Spring Boot (/api/v1/orders/{orderCode}/cancel).
 */
export const cancelPaymentOrder = async (orderId) => {
  const session = getAuthSession();
  const res = await apiClient.post(`/v1/orders/${orderId}/cancel`, {}, {
    headers: session?.id ? { 'X-User-Id': session.id } : {},
  });
  return res.data;
};

/**
 * 5. Giả lập đổi trạng thái đơn hàng qua API Dev trên Backend (/api/v1/dev/payments/simulate).
 */
export const simulateOrderStatus = async (orderId, targetStatus, customActualAmount = null) => {
  const payload = {
    orderCode: orderId,
    targetStatus: targetStatus,
    customActualAmount: customActualAmount,
  };
  const res = await apiClient.post('/v1/dev/payments/simulate', payload);
  return res.data;
};

/**
 * Chuẩn hóa một dòng giao dịch từ API /v1/admin/payments cho giao diện Admin.
 */
const normalizeAdminTransaction = (row) => ({
  transactionId: row.id,
  orderId: row.orderCode,
  orderType: row.orderType,
  serviceName: row.serviceName,
  userName: row.userName,
  userEmail: row.userEmail,
  expectedAmount: Number(row.expectedAmount ?? 0),
  actualAmount: Number(row.actualAmount ?? 0),
  amount: Number(row.actualAmount ?? 0),
  amountMismatch: row.status === 'SUCCESS' && Number(row.actualAmount) !== Number(row.expectedAmount),
  referenceCode: row.referenceCode,
  gateway: row.gateway,
  status: row.status,
  createdAt: row.createdAt,
  receivedAt: row.paidAt,
});

/**
 * 6. Lấy danh sách giao dịch cho Quản trị viên (Admin) từ database.
 */
export const getTransactions = async ({
  status = 'ALL',
  orderType = 'ALL',
  startDate = '',
  endDate = '',
  search = '',
  page = 1,
  pageSize = 10,
} = {}) => {
  const params = {
    status,
    orderType,
    search: search?.trim() || undefined,
    from: startDate || undefined,
    to: endDate || undefined,
    page: page - 1,
    size: pageSize,
  };
  const res = await apiClient.get('/v1/admin/payments', { params });
  const pageData = res.data.data;
  return {
    data: (pageData.content || []).map(normalizeAdminTransaction),
    total: pageData.totalElements || 0,
    page: (pageData.page || 0) + 1,
    pageSize: pageData.size || pageSize,
    totalPages: pageData.totalPages || 1,
  };
};

/**
 * 7. Thống kê nhanh toàn bộ giao dịch cho Admin.
 */
export const getTransactionSummary = async () => {
  const res = await apiClient.get('/v1/admin/payments/summary');
  return res.data.data;
};

/**
 * 8. Chi tiết một giao dịch.
 */
export const getTransactionDetailWithWebhook = async (transaction) => ({
  transaction,
  order: null,
  webhookLog: null,
});
