/**
 * Tầng dịch vụ thanh toán mô phỏng (Mock Payment Service).
 * Tuân thủ hợp đồng tại specs/002-sepay-qr-payment/contracts/payment-service.md.
 * Cung cấp các phương thức bất đồng bộ (async/await) giả lập tương tác với backend.
 */

import {
  initialMockOrders,
  initialMockTransactions,
  initialMockWebhookLogs,
  DEFAULT_BANK_INFO,
  generateVietQrUrl,
} from './paymentMockData.js';

// Trạng thái lưu trữ in-memory để cập nhật khi chạy giả lập
let orders = [...initialMockOrders];
let transactions = [...initialMockTransactions];
let webhookLogs = { ...initialMockWebhookLogs };

// Giả lập độ trễ mạng nhẹ (150ms)
const simulateDelay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 1. Lấy thông tin chi tiết một đơn thanh toán theo mã đơn.
 */
export const getPaymentOrder = async (orderId) => {
  await simulateDelay();
  const order = orders.find((o) => o.orderId === orderId);
  if (!order) {
    throw new Error(`Không tìm thấy đơn thanh toán có mã: ${orderId}`);
  }
  return { ...order };
};

/**
 * 2. Tạo mới một đơn thanh toán (nạp token ứng viên hoặc mua gói nhà tuyển dụng).
 */
export const createPaymentOrder = async ({
  orderType = 'CANDIDATE_TOKEN',
  serviceName = 'Nạp Token Ứng viên',
  amount = 100000,
  userId = 'USR-CURRENT',
  userName = 'Người dùng hiện tại',
  userEmail = 'user@jobviet.vn',
  userRole = 'candidate',
}) => {
  await simulateDelay();
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

  orders.unshift(newOrder);

  // Tạo transaction tương ứng ở trạng thái chờ
  const newTx = {
    transactionId: `TX-${Math.floor(1000000 + Math.random() * 9000000)}`,
    orderId,
    orderType,
    serviceName,
    userName,
    userEmail,
    expectedAmount: amount,
    actualAmount: 0,
    referenceCode: '-',
    status: 'PENDING',
    receivedAt: null,
    webhookLogId: `WH-LOG-${orderNumber}`,
  };
  transactions.unshift(newTx);

  webhookLogs[`WH-LOG-${orderNumber}`] = {
    id: `WH-LOG-${orderNumber}`,
    transactionId: newTx.transactionId,
    orderCode: orderId,
    gateway: 'SePay - MBBank',
    receivedAt: null,
    rawPayload: {
      status: 'WAITING_FOR_PAYMENT',
      message: 'Chưa nhận được giao dịch chuyển khoản từ ngân hàng',
    },
  };

  return { ...newOrder };
};

/**
 * 3. Kiểm tra trạng thái hiện tại của đơn hàng (dùng cho Polling).
 */
export const checkPaymentStatus = async (orderId) => {
  await simulateDelay(100);
  const order = orders.find((o) => o.orderId === orderId);
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
 * 4. Giả lập đổi trạng thái đơn hàng (Dành cho Dev Simulator).
 */
export const simulateOrderStatus = async (orderId, targetStatus, customActualAmount = null) => {
  await simulateDelay();
  const orderIndex = orders.findIndex((o) => o.orderId === orderId);
  if (orderIndex === -1) {
    throw new Error(`Không tìm thấy đơn hàng: ${orderId}`);
  }

  const currentOrder = orders[orderIndex];
  let actualAmount = customActualAmount;

  if (targetStatus === 'SUCCESS') {
    actualAmount = currentOrder.amount;
  } else if (targetStatus === 'WRONG_AMOUNT' && !actualAmount) {
    // Mặc định thiếu 20% tiền nếu không chỉ định
    actualAmount = Math.round(currentOrder.amount * 0.8);
  }

  const updatedOrder = {
    ...currentOrder,
    status: targetStatus,
    actualAmount,
  };
  orders[orderIndex] = updatedOrder;

  // Cập nhật đồng bộ vào bảng transaction đối soát
  const txIndex = transactions.findIndex((t) => t.orderId === orderId);
  if (txIndex !== -1) {
    const currentTx = transactions[txIndex];
    const updatedTx = {
      ...currentTx,
      status: targetStatus,
      actualAmount: actualAmount || 0,
      receivedAt: ['SUCCESS', 'WRONG_AMOUNT'].includes(targetStatus)
        ? new Date().toISOString()
        : null,
      referenceCode: ['SUCCESS', 'WRONG_AMOUNT'].includes(targetStatus)
        ? `FT${Date.now().toString().slice(-8)}`
        : '-',
    };
    transactions[txIndex] = updatedTx;

    // Cập nhật webhook log mô phỏng
    if (webhookLogs[currentTx.webhookLogId]) {
      webhookLogs[currentTx.webhookId] = {
        ...webhookLogs[currentTx.webhookLogId],
        receivedAt: updatedTx.receivedAt,
        rawPayload: {
          id: Math.floor(1000000 + Math.random() * 9000000),
          gateway: 'MBBank',
          transactionDate: new Date().toISOString(),
          accountNumber: DEFAULT_BANK_INFO.accountNumber,
          content: `${currentOrder.transferContent} chuyen khoan mo phong`,
          transferType: 'in',
          transferAmount: updatedTx.actualAmount,
          accumulated: 20000000,
          referenceCode: updatedTx.referenceCode,
          description: `Mô phỏng trạng thái: ${targetStatus}`,
        },
      };
    }
  }

  return { ...updatedOrder };
};

/**
 * 5. Lấy danh sách giao dịch hiển thị cho Quản trị viên (Admin) kèm phân trang và lọc.
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
  await simulateDelay();

  let filtered = [...transactions];

  // Lọc theo trạng thái
  if (status && status !== 'ALL') {
    filtered = filtered.filter((t) => t.status === status);
  }

  // Lọc theo loại đơn
  if (orderType && orderType !== 'ALL') {
    filtered = filtered.filter((t) => t.orderType === orderType);
  }

  // Lọc theo ngày
  if (startDate) {
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    filtered = filtered.filter((t) => t.receivedAt && new Date(t.receivedAt).getTime() >= start);
  }
  if (endDate) {
    const end = new Date(endDate).setHours(23, 59, 59, 999);
    filtered = filtered.filter((t) => t.receivedAt && new Date(t.receivedAt).getTime() <= end);
  }

  // Tìm kiếm theo mã đơn hoặc tên
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
  await simulateDelay();
  const tx = transactions.find((t) => t.transactionId === transactionId);
  if (!tx) {
    throw new Error(`Không tìm thấy giao dịch: ${transactionId}`);
  }

  const order = orders.find((o) => o.orderId === tx.orderId) || null;
  const webhookLog = webhookLogs[tx.webhookLogId] || null;

  return {
    transaction: { ...tx },
    order,
    webhookLog,
  };
};
