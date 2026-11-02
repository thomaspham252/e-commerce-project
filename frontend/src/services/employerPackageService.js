/**
 * Tầng dịch vụ Gói dịch vụ Nhà tuyển dụng (Employer Package Service).
 * Tuân thủ hợp đồng tại specs/004-employer-packages-dashboard/contracts/employer-service-contract.md.
 * Thao tác in-memory, giả lập Promise bất đồng bộ như API backend.
 */

import {
  initialEmployerPackages,
  initialEmployerSubscription,
} from './employerPackageMockData.js';

import { apiClient } from './apiClient.js';

let packages = [...initialEmployerPackages];
let currentSubscription = { ...initialEmployerSubscription };

const simulateDelay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 1. Lấy danh sách các gói dịch vụ tuyển dụng từ database MySQL.
 */
export const getEmployerPackages = async ({ includeInactive = false } = {}) => {
  // Admin quản lý gói: luôn lấy từ DB (kể cả gói đã tạm ngưng), lỗi thì báo lên giao diện
  if (includeInactive) {
    const res = await apiClient.get('/v1/packages', { params: { all: true } });
    return res.data.data;
  }
  try {
    const res = await apiClient.get('/v1/packages');
    if (res.data?.success && res.data?.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('[EmployerPackageService] Backend offline, fallback sang mock:', err);
  }
  return packages.filter((p) => p.isActive);
};

/**
 * 2. Lấy thông tin gói dịch vụ hiện tại của Nhà tuyển dụng.
 */
export const getCurrentSubscription = async (_employerId = 'EMP-001') => {
  await simulateDelay();
  // Tính lại remainingDays chính xác theo thời gian hiện tại
  const now = Date.now();
  const end = new Date(currentSubscription.endDate).getTime();
  const diffDays = Math.max(0, Math.ceil((end - now) / (86400 * 1000)));

  currentSubscription = {
    ...currentSubscription,
    remainingDays: diffDays,
    status: diffDays > 0 ? 'ACTIVE' : 'EXPIRED',
  };

  return { ...currentSubscription };
};

/**
 * 3. Kích hoạt mua/gia hạn/nâng cấp gói sau khi thanh toán thành công (Phương án A).
 */
export const subscribePackage = async (
  _employerId = 'EMP-001',
  packageId = 'pkg-emp-pro',
  orderId = null
) => {
  await simulateDelay();
  const targetPkg = packages.find((p) => p.id === packageId);
  if (!targetPkg) {
    throw new Error(`Không tìm thấy gói dịch vụ có mã: ${packageId}`);
  }

  const isSamePackage = currentSubscription.packageId === packageId;
  const now = new Date();

  if (isSamePackage && currentSubscription.status === 'ACTIVE') {
    // Gia hạn: Cộng dồn thời gian và hạn mức tin
    const currentEnd = new Date(currentSubscription.endDate);
    const newEnd = new Date(currentEnd.getTime() + targetPkg.durationDays * 86400 * 1000);
    const newRemainingDays = Math.max(
      0,
      Math.ceil((newEnd.getTime() - Date.now()) / (86400 * 1000))
    );

    currentSubscription = {
      ...currentSubscription,
      endDate: newEnd.toISOString(),
      remainingDays: newRemainingDays,
      maxJobPosts: currentSubscription.maxJobPosts + targetPkg.maxJobPosts,
      allowRealtimeChat: targetPkg.allowRealtimeChat || currentSubscription.allowRealtimeChat,
      status: 'ACTIVE',
      lastOrderId: orderId || currentSubscription.lastOrderId,
    };
  } else {
    // Nâng cấp gói khác: Kích hoạt gói mới ngay lập tức
    const newEnd = new Date(now.getTime() + targetPkg.durationDays * 86400 * 1000);

    currentSubscription = {
      subscriptionId: `SUB-EMP-${Date.now().toString().slice(-6)}`,
      employerId: 'EMP-001',
      companyName: currentSubscription.companyName || 'FPT Software',
      packageId: targetPkg.id,
      packageName: targetPkg.name,
      startDate: now.toISOString(),
      endDate: newEnd.toISOString(),
      remainingDays: targetPkg.durationDays,
      usedJobPosts: 0,
      maxJobPosts: targetPkg.maxJobPosts,
      allowRealtimeChat: targetPkg.allowRealtimeChat,
      status: 'ACTIVE',
      lastOrderId: orderId,
    };
  }

  return {
    success: true,
    subscription: { ...currentSubscription },
  };
};

/**
 * 4. Quản lý Admin: Tạo mới (không có id) hoặc chỉnh sửa gói dịch vụ — lưu vào bảng packages.
 * Trường theo đúng cột DB; jobPostLimit / cvViewLimit để null = không giới hạn.
 */
export const savePackage = async (packageData) => {
  const { id, ...body } = packageData;
  const res = id
    ? await apiClient.put(`/v1/packages/${id}`, body)
    : await apiClient.post('/v1/packages', body);
  return res.data.data;
};

/**
 * 5. Quản lý Admin: Bật/tắt trạng thái mở bán của gói (lưu vào DB).
 */
export const togglePackageStatus = async (packageId) => {
  const res = await apiClient.patch(`/v1/packages/${packageId}/toggle-status`);
  return res.data.data;
};

/**
 * 6. Kiểm tra quyền hạn của NTD để kích hoạt popup PackageLimitModal.
 */
export const checkPackagePermission = async (
  _employerId = 'EMP-001',
  actionType = 'POST_JOB'
) => {
  await simulateDelay(50);
  const sub = await getCurrentSubscription();

  if (sub.status === 'EXPIRED') {
    return {
      allowed: false,
      reason: 'PACKAGE_EXPIRED',
      message: 'Gói dịch vụ của công ty bạn đã hết hạn sử dụng. Vui lòng gia hạn hoặc nâng cấp gói để tiếp tục.',
      subscription: sub,
    };
  }

  if (actionType === 'POST_JOB') {
    if (sub.usedJobPosts >= sub.maxJobPosts) {
      return {
        allowed: false,
        reason: 'LIMIT_REACHED',
        message: `Bạn đã sử dụng hết ${sub.usedJobPosts}/${sub.maxJobPosts} tin đăng của gói hiện tại. Vui lòng nâng cấp gói để đăng thêm tin mới.`,
        subscription: sub,
      };
    }
  }

  if (actionType === 'REALTIME_CHAT') {
    if (!sub.allowRealtimeChat) {
      return {
        allowed: false,
        reason: 'NO_PERMISSION',
        message: 'Gói dịch vụ hiện tại của bạn chưa kích hoạt quyền Nhắn tin Realtime với ứng viên.',
        subscription: sub,
      };
    }
  }

  return { allowed: true, subscription: sub };
};

/**
 * 7. Tăng số lượng tin đăng đã dùng khi NTD tạo tin thành công.
 */
export const incrementJobPostUsage = async (_employerId = 'EMP-001') => {
  await simulateDelay(50);
  currentSubscription.usedJobPosts = Math.min(
    currentSubscription.maxJobPosts,
    currentSubscription.usedJobPosts + 1
  );
  return { ...currentSubscription };
};
