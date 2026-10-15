import React from 'react';
import {
  Search,
  MapPin,
  Flame,
  Sparkles,
  Banknote,
  Heart,
  Briefcase,
  Clock,
  Star,
  Zap,
  Rocket,
  Shield,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Monitor,
  Calculator,
  Megaphone,
  ShoppingCart,
  Building2,
  User,
  Check,
  X,
  Compass,
  FileText,
  Send,
  MessageSquare
} from 'lucide-react';

/**
 * Bản đồ ánh xạ tên biểu tượng sang component lucide-react tương ứng
 * Tập trung tại một nơi duy nhất để dễ quản lý, thay đổi hoặc mở rộng
 */
const ICON_MAP = {
  // Biểu tượng thông dụng & tìm kiếm
  search: Search,
  'map-pin': MapPin,
  location: MapPin,
  arrow: ArrowRight,
  'arrow-right': ArrowRight,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,

  // Badge & trạng thái tin tuyển dụng
  flame: Flame,
  hot: Flame,
  sparkles: Sparkles,
  new: Sparkles,
  banknote: Banknote,
  salary: Banknote,
  briefcase: Briefcase,
  clock: Clock,
  heart: Heart,
  star: Star,
  zap: Zap,
  fast: Zap,

  // Giá trị cốt lõi & tính năng
  rocket: Rocket,
  shield: Shield,
  lightbulb: Lightbulb,

  // Ngành nghề tuyển dụng
  monitor: Monitor,
  tech: Monitor,
  it: Monitor,
  calculator: Calculator,
  accounting: Calculator,
  megaphone: Megaphone,
  marketing: Megaphone,
  'shopping-cart': ShoppingCart,
  sales: ShoppingCart,

  // Khác
  building: Building2,
  user: User,
  check: Check,
  close: X,
  compass: Compass,
  file: FileText,
  send: Send,
  message: MessageSquare
};

/**
 * Quy chuẩn kích cỡ icon theo yêu cầu hệ thống thiết kế:
 * - meta / badge: 16px (thẻ trạng thái, địa điểm, lương, đánh giá sao, huy hiệu)
 * - job: 20px (thẻ việc làm, nút lưu tin, mũi tên điều hướng)
 * - category: 28px (thẻ ngành nghề nổi bật)
 */
const SIZE_PRESETS = {
  meta: 16,
  badge: 16,
  sm: 16,
  job: 20,
  md: 20,
  category: 28,
  lg: 28,
  feature: 28,
  xl: 32
};

/**
 * Component Icon chuẩn của JobViet
 * Đảm bảo 100% sử dụng lucide-react, strokeWidth mặc định 1.75
 *
 * @param {string} name - Tên biểu tượng (ví dụ: 'search', 'map-pin', 'flame', 'sparkles')
 * @param {number|string} size - Kích thước (số px hoặc preset: 'meta' (16), 'job' (20), 'category' (28))
 * @param {number} strokeWidth - Độ dày nét viền, mặc định chuẩn mực 1.75
 * @param {string} color - Mã màu tùy chỉnh
 * @param {string} className - Lớp CSS bổ sung
 */
export const Icon = ({
  name,
  size = 'job',
  strokeWidth = 1.75,
  color,
  className = '',
  style = {},
  ...rest
}) => {
  if (!name) return null;

  const normalizedName = String(name).toLowerCase().trim();
  const IconComponent = ICON_MAP[normalizedName] || Sparkles;

  const pixelSize = typeof size === 'number' ? size : (SIZE_PRESETS[size] || 20);

  return (
    <IconComponent
      size={pixelSize}
      strokeWidth={strokeWidth}
      color={color}
      className={`jobviet-icon jobviet-icon-${normalizedName} ${className}`}
      style={style}
      aria-hidden="true"
      {...rest}
    />
  );
};
