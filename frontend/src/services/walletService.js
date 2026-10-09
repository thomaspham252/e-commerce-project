/**
 * Tầng dịch vụ Ví Token của Ứng viên (Wallet Service).
 * Tuân thủ hợp đồng tại specs/003-candidate-token-wallet/contracts/wallet-service.md.
 * Thao tác in-memory, giả lập Promise bất đồng bộ như gọi API thực tế.
 */

import {
  initialCandidateWallet,
  initialTokenPackages,
  initialTokenTransactions,
  initialServiceFees,
} from './walletMockData.js';
import { getTransactions } from './paymentService.js';

// Trạng thái lưu trữ in-memory
let currentWallet = { ...initialCandidateWallet };
let tokenPackages = [...initialTokenPackages];
let tokenTransactions = [...initialTokenTransactions];
let serviceFees = [...initialServiceFees];

const simulateDelay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 1. Lấy thông tin ví và số dư của ứng viên.
 */
export const getWallet = async (_userId = 'USR-UV-01') => {
  await simulateDelay();
  return { ...currentWallet };
};

/**
 * 2. Lấy danh sách các mốc nạp token.
 */
export const getTokenPackages = async () => {
  await simulateDelay();
  return [...tokenPackages];
};

/**
 * 3. Cộng token vào ví sau khi nạp tiền thành công (hoặc qua giả lập).
 */
export const depositTokens = async (
  _userId = 'USR-UV-01',
  packageId = 'pkg-100',
  orderId = null
) => {
  await simulateDelay();
  const pkg = tokenPackages.find((p) => p.id === packageId) || tokenPackages[1];
  const addedTokens = pkg.totalTokens;

  const newBalance = currentWallet.balance + addedTokens;
  currentWallet = {
    ...currentWallet,
    balance: newBalance,
    totalDeposited: currentWallet.totalDeposited + addedTokens,
    updatedAt: new Date().toISOString(),
  };

  const newTx = {
    id: `TX-TOK-${Date.now().toString().slice(-6)}`,
    userId: currentWallet.userId,
    type: 'DEPOSIT',
    amount: addedTokens,
    balanceAfter: newBalance,
    title: 'Nạp token qua VietQR SePay',
    description: `Gói ${pkg.tokens} Token ${
      pkg.bonusTokens > 0 ? `(+${pkg.bonusTokens} tặng thêm)` : ''
    }${orderId ? ` • Đơn: ${orderId}` : ''}`,
    createdAt: new Date().toISOString(),
  };

  tokenTransactions.unshift(newTx);

  return {
    wallet: { ...currentWallet },
    transaction: { ...newTx },
  };
};

/**
 * 4. Trừ token khi ứng viên sử dụng một tính năng có phí.
 */
export const consumeTokens = async (_userId = 'USR-UV-01', featureKey = 'UNLOCK_CONTACT') => {
  await simulateDelay();
  const fee = serviceFees.find((f) => f.featureKey === featureKey);
  if (!fee) {
    throw new Error(`Không tìm thấy biểu phí cho tính năng: ${featureKey}`);
  }

  // Kiểm tra số dư không đủ
  if (currentWallet.balance < fee.tokenCost) {
    return {
      success: false,
      error: 'INSUFFICIENT_BALANCE',
      message: `Số dư không đủ. Cần ${fee.tokenCost} token nhưng bạn chỉ còn ${currentWallet.balance} token.`,
      required: fee.tokenCost,
      current: currentWallet.balance,
      missing: fee.tokenCost - currentWallet.balance,
    };
  }

  const newBalance = currentWallet.balance - fee.tokenCost;
  currentWallet = {
    ...currentWallet,
    balance: newBalance,
    totalConsumed: currentWallet.totalConsumed + fee.tokenCost,
    updatedAt: new Date().toISOString(),
  };

  const newTx = {
    id: `TX-TOK-${Date.now().toString().slice(-6)}`,
    userId: currentWallet.userId,
    type: 'CONSUME',
    amount: -fee.tokenCost,
    balanceAfter: newBalance,
    title: fee.featureName,
    description: fee.description,
    createdAt: new Date().toISOString(),
  };

  tokenTransactions.unshift(newTx);

  return {
    success: true,
    wallet: { ...currentWallet },
    transaction: { ...newTx },
  };
};

/**
 * 5. Lấy danh sách lịch sử biến động token có lọc theo loại và ngày.
 */
export const getTokenTransactions = async (
  _userId = 'USR-UV-01',
  { type = 'ALL', startDate = '', endDate = '' } = {}
) => {
  await simulateDelay();
  let list = [...tokenTransactions];

  if (type && type !== 'ALL') {
    list = list.filter((t) => t.type === type);
  }

  if (startDate) {
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    list = list.filter((t) => new Date(t.createdAt).getTime() >= start);
  }

  if (endDate) {
    const end = new Date(endDate).setHours(23, 59, 59, 999);
    list = list.filter((t) => new Date(t.createdAt).getTime() <= end);
  }

  return list;
};

/**
 * 6. Lấy lịch sử các lần nạp tiền ngân hàng của ứng viên từ paymentService.
 */
export const getDepositHistory = async (_userId = 'USR-UV-01') => {
  await simulateDelay();
  const res = await getTransactions({
    orderType: 'CANDIDATE_TOKEN',
    page: 1,
    pageSize: 50,
  });
  return res.data || [];
};

/**
 * 7. Lấy danh sách biểu phí các tính năng dùng token.
 */
export const getServiceFees = async () => {
  await simulateDelay();
  return [...serviceFees];
};

/**
 * 8. Quản lý Admin: Tạo mới hoặc chỉnh sửa gói nạp token.
 */
export const saveTokenPackage = async (packageData) => {
  await simulateDelay();

  const tokens = Number(packageData.tokens);
  const price = Number(packageData.priceVND);
  const bonus = Number(packageData.bonusTokens || 0);

  if (!packageData.tokens || isNaN(tokens) || tokens <= 0) {
    throw new Error('Số token cơ bản phải lớn hơn 0');
  }
  if (!packageData.priceVND || isNaN(price) || price <= 0) {
    throw new Error('Giá nạp tiền phải lớn hơn 0 ₫');
  }
  if (isNaN(bonus) || bonus < 0) {
    throw new Error('Số token thưởng không được âm');
  }

  const existingIndex = tokenPackages.findIndex((p) => p.id === packageData.id);
  const totalTokens = tokens + bonus;

  if (existingIndex >= 0) {
    tokenPackages[existingIndex] = {
      ...tokenPackages[existingIndex],
      ...packageData,
      tokens,
      bonusTokens: bonus,
      totalTokens,
      priceVND: price,
      isActive: packageData.isActive !== false,
    };
    return { ...tokenPackages[existingIndex] };
  } else {
    const newPackage = {
      id: packageData.id || `pkg-tok-${Date.now().toString().slice(-4)}`,
      tokens,
      bonusTokens: bonus,
      totalTokens,
      priceVND: price,
      isPopular: Boolean(packageData.isPopular),
      badgeLabel: packageData.badgeLabel || '',
      description: packageData.description || `Gói nạp ${tokens} Token`,
      isActive: packageData.isActive !== false,
    };
    tokenPackages.push(newPackage);
    return { ...newPackage };
  }
};

/**
 * 9. Quản lý Admin: Bật/tắt trạng thái mở bán gói Token.
 */
export const toggleTokenPackageStatus = async (packageId) => {
  await simulateDelay();
  const pkg = tokenPackages.find((p) => p.id === packageId);
  if (!pkg) {
    throw new Error(`Không tìm thấy gói token có mã: ${packageId}`);
  }
  pkg.isActive = pkg.isActive === false ? true : false;
  return { ...pkg };
};

/**
 * 10. Quản lý Admin: Chỉnh sửa mức trừ token của tính năng ứng viên.
 */
export const saveServiceFee = async (feeData) => {
  await simulateDelay();
  const cost = Number(feeData.tokenCost);
  if (isNaN(cost) || cost <= 0) {
    throw new Error('Mức trừ token phải lớn hơn 0');
  }

  const existing = serviceFees.find((f) => f.featureKey === feeData.featureKey);
  if (!existing) {
    throw new Error(`Không tìm thấy tính năng: ${feeData.featureKey}`);
  }

  existing.tokenCost = cost;
  if (feeData.featureName) existing.featureName = feeData.featureName;
  if (feeData.description) existing.description = feeData.description;

  return { ...existing };
};
