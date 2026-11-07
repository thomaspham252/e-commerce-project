/**
 * Tầng dịch vụ Gói dịch vụ Nhà tuyển dụng (Employer Package Service).
 * Toàn bộ dữ liệu lấy từ database: bảng packages (danh mục gói) và subscriptions (gói NTD đang dùng).
 * Việc kích hoạt gói sau khi thanh toán do backend thực hiện (FulfillmentService).
 */

import { apiClient } from './apiClient.js';
import { employerService } from './employerService.js';

/** Danh sách quyền lợi hiển thị trên thẻ gói, sinh từ các cột của bảng packages. */
const buildFeatures = (pkg) => {
  const features = [
    pkg.jobPostLimit == null
      ? 'Đăng tin tuyển dụng không giới hạn'
      : `Đăng tối đa ${pkg.jobPostLimit} tin tuyển dụng`,
    pkg.cvViewLimit == null ? 'Xem hồ sơ ứng viên không giới hạn' : `Xem tối đa ${pkg.cvViewLimit} hồ sơ ứng viên`,
  ];
  if (pkg.canHighlightJobs) features.push('Làm nổi bật tin tuyển dụng');
  if (pkg.canPrioritizeJobs) features.push('Ưu tiên hiển thị tin lên đầu');
  if (pkg.canSearchCandidates) features.push('Tìm kiếm trong kho hồ sơ ứng viên');
  if (pkg.canDirectContact) features.push('Nhắn tin trực tiếp với ứng viên');
  return features;
};

/** Bổ sung các trường giao diện thẻ gói cần (giữ nguyên các cột DB). */
const toPackageCard = (pkg) => ({
  ...pkg,
  priceVND: Number(pkg.priceVND ?? pkg.price ?? 0),
  maxJobPosts: pkg.jobPostLimit,
  allowRealtimeChat: Boolean(pkg.canDirectContact),
  description: `Thời hạn ${pkg.durationDays} ngày`,
  features: buildFeatures(pkg),
});

/**
 * 1. Lấy danh sách gói dịch vụ tuyển dụng từ database.
 * includeInactive = true (Admin): lấy cả gói đã tạm ngưng.
 */
export const getEmployerPackages = async ({ includeInactive = false } = {}) => {
  const res = await apiClient.get('/v1/packages', { params: includeInactive ? { all: true } : undefined });
  const list = res.data.data || [];
  return includeInactive ? list : list.map(toPackageCard);
};

/**
 * 2. Gói dịch vụ hiện tại của NTD đang đăng nhập (bảng subscriptions).
 * status: ACTIVE | EXPIRED | FREE (chưa từng mua gói). maxJobPosts = null nghĩa là không giới hạn.
 */
export const getCurrentSubscription = async () => employerService.getSubscription();

/**
 * 3. Sau khi thanh toán thành công, backend đã tự kích hoạt gói — chỉ cần tải lại gói hiện tại.
 */
export const subscribePackage = async () => {
  const subscription = await getCurrentSubscription();
  return { success: true, subscription };
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
 * 6. Kiểm tra quyền hạn của NTD (dựa trên gói thật trong DB) để hiện popup PackageLimitModal.
 * Backend cũng kiểm tra lại khi tạo tin nên không thể vượt hạn mức bằng cách bỏ qua bước này.
 */
export const checkPackagePermission = async (actionType = 'POST_JOB') => {
  const sub = await getCurrentSubscription();

  if (sub.status === 'EXPIRED') {
    return {
      allowed: false,
      reason: 'PACKAGE_EXPIRED',
      message: 'Gói dịch vụ của công ty bạn đã hết hạn sử dụng. Vui lòng gia hạn hoặc nâng cấp gói để tiếp tục.',
      subscription: sub,
    };
  }

  if (actionType === 'POST_JOB' && sub.maxJobPosts != null && sub.usedJobPosts >= sub.maxJobPosts) {
    return {
      allowed: false,
      reason: 'LIMIT_REACHED',
      message: sub.status === 'FREE'
        ? `Bạn đã dùng hết ${sub.maxJobPosts} tin đăng miễn phí. Vui lòng mua gói dịch vụ để đăng thêm tin.`
        : `Bạn đã sử dụng hết ${sub.usedJobPosts}/${sub.maxJobPosts} tin đăng của gói hiện tại. Vui lòng nâng cấp gói để đăng thêm tin mới.`,
      subscription: sub,
    };
  }

  if (actionType === 'REALTIME_CHAT' && !sub.allowRealtimeChat) {
    return {
      allowed: false,
      reason: 'NO_PERMISSION',
      message: 'Gói dịch vụ hiện tại của bạn chưa kích hoạt quyền Nhắn tin trực tiếp với ứng viên.',
      subscription: sub,
    };
  }

  if (actionType === 'CV_VIEW') {
    if (!sub.canSearchCandidates) {
      return {
        allowed: false,
        reason: 'NO_PERMISSION',
        message: 'Gói dịch vụ hiện tại của bạn chưa kích hoạt quyền Tìm kiếm và xem kho hồ sơ ứng viên.',
        subscription: sub,
      };
    }
    if (sub.cvViewLimit != null && sub.usedCvViews >= sub.cvViewLimit) {
      return {
        allowed: false,
        reason: 'CV_LIMIT_REACHED',
        message: `Bạn đã sử dụng hết ${sub.usedCvViews}/${sub.cvViewLimit} lượt xem hồ sơ của gói hiện tại. Vui lòng nâng cấp gói.`,
        subscription: sub,
      };
    }
  }

  return { allowed: true, subscription: sub };
};

/**
 * 7. Sau khi tạo tin thành công: tải lại gói để số tin đã dùng (đếm từ DB) cập nhật.
 */
export const incrementJobPostUsage = async () => getCurrentSubscription();
