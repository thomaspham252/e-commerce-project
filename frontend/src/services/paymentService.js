/**
 * Tầng dịch vụ thanh toán kết nối trực tiếp với Backend Spring Boot.
 * Tích hợp API chuẩn RESTful, có fallback mượt mà sang dữ liệu in-memory nếu mất kết nối.
 */

import { apiClient, getErrorMessage } from './apiClient.js';
import {
  initialMockOrders,
  initialMockTransactions,
  initialMockWebhookLogs,
  DEFAULT_BANK_INFO,
  generateVietQrUrl,
} from './paymentMockData.js';

// Trạng thái lưu trữ in-memory dùng để fallback khi không có kết nối mạng
let mockOrders = [...initialMockOrders];
let mockTransactions = [...initialMockTransactions];
let mockWebhookLogs = { ...initialMockWebhookLogs };

/**
 * Chuẩn hóa đối tượng đơn hàng trả về cho các component Frontend.
 */
const normalizeOrder = (backendData) => {
  const code = backendData.orderCode || backendData.orderId;
  const status = backendData.status === 'PAID' || backendData.status === 'FULFILLED'
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
    bankCode: backendData.bankCode || DEFAULT_BANK_INFO.bankCode,
    bankName: backendData.bankName || DEFAULT_BANK_INFO.bankName,
    accountNumber: backendData.accountNumber || DEFAULT_BANK_INFO.accountNumber,
    accountHolder: backendData.accountHolder || DEFAULT_BANK_INFO.accountHolder,
    transferContent: backendData.transferContent || `JOBVIET ${code.replace(/-/g, '')}`,
    qrCodeUrl: backendData.qrCodeUrl || generateVietQrUrl(
      DEFAULT_BANK_INFO.bankCode,
      DEFAULT_BANK_INFO.accountNumber,
      backendData.amount,
      `JOBVIET ${code.replace(/-/g, '')}`
    ),
    createdAt: backendData.createdAt || new Date().toISOString(),
    expiresAt: backendData.expiresAt || new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    paidAt: backendData.paidAt || null,
  };
};

/**
 * 1. Lấy thông tin chi tiết một đơn thanh toán theo mã đơn.
 */
export const getPaymentOrder = async (orderId) => {
  try {
    const res = await apiClient.get(`/v1/orders/${orderId}`);
    if (res.data?.success && res.data?.data) {
      const normalized = normalizeOrder(res.data.data);
      // Lưu lại vào mockOrders để đồng bộ local
      const idx = mockOrders.findIndex((o) => o.orderId === orderId);
      if (idx !== -1) mockOrders[idx] = normalized;
      else mockOrders.unshift(normalized);
      return normalized;
    }
  } catch (err) {
    console.warn(`[PaymentService] Backend offline hoặc không tìm thấy đơn ${orderId}, kiểm tra fallback mock:`, err);
  }

  // Fallback đọc từ mock
  const fallback = mockOrders.find((o) => o.orderId === orderId);
  if (!fallback) {
    throw new Error(`Không tìm thấy đơn thanh toán có mã: ${orderId}`);
  }
  return { ...fallback };
};

/**
 * 2. Tạo mới một đơn thanh toán (gọi API backend lưu vào MySQL).
 */
export const createPaymentOrder = async ({
  orderType = 'CANDIDATE_TOKEN',
  serviceName = 'Nạp Token Ứng viên',
  amount = 100000,
  userId = 'USR-CURRENT',
  userName = 'Người dùng hiện tại',
  userEmail = 'user@jobviet.vn',
  userRole = 'candidate',
  packageId = null,
  tokenPackageId = null,
}) => {
  const isToken = orderType === 'CANDIDATE_TOKEN' || orderType === 'TOKEN';

  // Tự động map package ID theo mệnh giá nếu chưa chỉ định
  let finalTokenPackageId = tokenPackageId;
  let finalPackageId = packageId;

  if (isToken && !finalTokenPackageId) {
    if (amount <= 50000) finalTokenPackageId = 1;
    else if (amount <= 100000) finalTokenPackageId = 2;
    else if (amount <= 200000) finalTokenPackageId = 3;
    else finalTokenPackageId = 4;
  } else if (!isToken && !finalPackageId) {
    if (amount <= 500000) finalPackageId = 1;
    else if (amount <= 1500000) finalPackageId = 2;
    else finalPackageId = 3;
  }

  try {
    const payload = {
      orderType: isToken ? 'TOKEN' : 'SUBSCRIPTION',
      tokenPackageId: isToken ? finalTokenPackageId : null,
      packageId: !isToken ? finalPackageId : null,
    };

    const res = await apiClient.post('/v1/orders', payload);
    if (res.data?.success && res.data?.data) {
      const normalized = normalizeOrder(res.data.data);
      normalized.userName = userName;
      normalized.userEmail = userEmail;
      normalized.userRole = userRole;

      mockOrders.unshift(normalized);
      return normalized;
    }
  } catch (err) {
    console.warn('[PaymentService] Lỗi gọi API /api/v1/orders, kích hoạt tạo đơn dự phòng:', getErrorMessage(err));
  }

  // Dự phòng khi backend không phản hồi
  const orderNumber = Math.floor(100 + Math.random() * 900);
  const orderId = `PAY-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${orderNumber}`;
  const transferContent = `JOBVIET PAY${orderNumber}`;
  const qrCodeUrl = generateVietQrUrl(
    DEFAULT_BANK_INFO.bankCode,
    DEFAULT_BANK_INFO.accountNumber,
    amount,
    transferContent
  );

  const newOrder = {
    orderId,
    orderCode: orderId,
    orderType,
    serviceName,
    userId,
    userName,
    userEmail,
    userRole,
    amount,
    actualAmount: null,
    status: 'PENDING',
    bankCode: DEFAULT_BANK_INFO.bankCode,
    bankName: DEFAULT_BANK_INFO.bankName,
    accountNumber: DEFAULT_BANK_INFO.accountNumber,
    accountHolder: DEFAULT_BANK_INFO.accountHolder,
    transferContent,
    qrCodeUrl,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  };

  mockOrders.unshift(newOrder);
  return { ...newOrder };
};

/**
 * 3. Kiểm tra trạng thái hiện tại của đơn hàng (dùng cho Polling).
 */
export const checkPaymentStatus = async (orderId) => {
  try {
    const res = await apiClient.get(`/v1/orders/${orderId}/status`);
    if (res.data?.success && res.data?.data) {
      const data = res.data.data;
      let status = data.status;
      if (status === 'PAID' || status === 'FULFILLED') {
        status = 'SUCCESS';
      }

      // Cập nhật lại cache local
      const idx = mockOrders.findIndex((o) => o.orderId === orderId);
      if (idx !== -1) {
        mockOrders[idx].status = status;
        mockOrders[idx].actualAmount = data.actualAmount;
      }

      return {
        orderId: data.orderCode || orderId,
        status: status,
        actualAmount: data.actualAmount,
      };
    }
  } catch (err) {
    // Không log lỗi polling để tránh spam console khi mạng chập chờn
  }

  // Fallback từ mock
  const order = mockOrders.find((o) => o.orderId === orderId);
  if (!order) {
    throw new Error(`Đơn hàng ${orderId} không tồn tại`);
  }
  return {
    orderId: order.orderId,
    status: order.status,
    actualAmount: order.actualAmount,
  };
};

/**
 * 4. Giả lập đổi trạng thái đơn hàng (Dev Simulator).
 */
export const simulateOrderStatus = async (orderId, targetStatus, customActualAmount = null) => {
  try {
    const payload = {
      orderCode: orderId,
      targetStatus: targetStatus,
      customActualAmount: customActualAmount,
    };
    const res = await apiClient.post('/v1/dev/payments/simulate', payload);
    if (res.data?.success) {
      console.log('[PaymentService] Giả lập thành công trên Backend:', res.data);
    }
  } catch (err) {
    console.warn('[PaymentService] Lỗi gọi API /api/v1/dev/payments/simulate:', err);
  }

  // Cập nhật đồng bộ vào mock in-memory để giao diện phản hồi tức thì
  const orderIndex = mockOrders.findIndex((o) => o.orderId === orderId);
  if (orderIndex !== -1) {
    const currentOrder = mockOrders[orderIndex];
    let actualAmount = customActualAmount;

    if (targetStatus === 'SUCCESS') {
      actualAmount = currentOrder.amount;
    } else if (targetStatus === 'WRONG_AMOUNT' && !actualAmount) {
      actualAmount = Math.round(currentOrder.amount * 0.8);
    }

    mockOrders[orderIndex] = {
      ...currentOrder,
      status: targetStatus,
      actualAmount,
    };
  }

  return { orderId, status: targetStatus, actualAmount: customActualAmount };
};

/**
 * 5. Lấy danh sách giao dịch hiển thị cho Quản trị viên (Admin).
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
  try {
    const params = {
      status,
      orderType,
      search,
      page: page - 1,
      size: pageSize,
    };
    const res = await apiClient.get('/v1/admin/payments', { params });
    if (res.data?.success && res.data?.data) {
      const pageData = res.data.data;
      return {
        data: pageData.content || [],
        total: pageData.totalElements || 0,
        page: (pageData.page || 0) + 1,
        pageSize: pageData.size || pageSize,
        totalPages: pageData.totalPages || 1,
      };
    }
  } catch (err) {
    console.warn('[PaymentService] Lỗi gọi API admin payments, fallback sang mock:', err);
  }

  // Fallback mock transactions
  let filtered = [...mockTransactions];
  if (status && status !== 'ALL') {
    filtered = filtered.filter((t) => t.status === status);
  }
  if (orderType && orderType !== 'ALL') {
    filtered = filtered.filter((t) => t.orderType === orderType);
  }
  if (search && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.orderId.toLowerCase().includes(q) ||
        t.userName.toLowerCase().includes(q) ||
        t.userEmail.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;
  const paginatedData = filtered.slice(startIndex, startIndex + pageSize);

  return {
    data: paginatedData,
    total,
    page,
    pageSize,
    totalPages,
  };
};

/**
 * 6. Lấy chi tiết một giao dịch kèm log Webhook SePay mẫu.
 */
export const getTransactionDetailWithWebhook = async (transactionId) => {
  const tx = mockTransactions.find((t) => t.transactionId === transactionId);
  const order = mockOrders.find((o) => o.orderId === (tx ? tx.orderId : transactionId)) || null;
  const webhookLog = tx ? (mockWebhookLogs[tx.webhookLogId] || null) : null;

  return {
    transaction: tx || { transactionId, status: 'SUCCESS' },
    order,
    webhookLog: webhookLog || {
      id: `WH-LOG-${transactionId}`,
      transactionId,
      orderCode: order ? order.orderId : '-',
      gateway: 'SePay - MBBank',
      receivedAt: new Date().toISOString(),
      rawPayload: {
        id: Math.floor(1000000 + Math.random() * 9000000),
        gateway: 'MBBank',
        transactionDate: new Date().toISOString(),
        accountNumber: DEFAULT_BANK_INFO.accountNumber,
        content: `JOBVIET ${order ? order.orderId : ''} chuyen khoan thanh toan`,
        transferType: 'in',
        transferAmount: order ? order.amount : 100000,
        referenceCode: `FT${Date.now().toString().slice(-8)}`,
      },
    },
  };
};
