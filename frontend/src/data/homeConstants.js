/**
 * Danh mục và công cụ cố định cho Giao diện Trang chủ JobViet
 */

export const HERO_POPULAR_KEYWORDS = [
  'ReactJS',
  'Java Backend',
  'Marketing Executive',
  'Kế toán tổng hợp',
  'Data Analyst',
  'Chăm sóc khách hàng',
  'UI/UX Designer',
];

export const HERO_SIDEBAR_CATEGORIES = [
  { id: 'cat-it', name: 'Công nghệ thông tin', icon: 'Monitor' },
  { id: 'cat-finance', name: 'Tài chính / Kế toán', icon: 'Calculator' },
  { id: 'cat-marketing', name: 'Marketing / Truyền thông', icon: 'Megaphone' },
  { id: 'cat-sales', name: 'Kinh doanh / Bán lẻ', icon: 'ShoppingCart' },
  { id: 'cat-hr', name: 'Nhân sự / Hành chính', icon: 'Building2' },
  { id: 'cat-design', name: 'Thiết kế / Đồ họa', icon: 'Compass' },
  { id: 'cat-support', name: 'Chăm sóc khách hàng', icon: 'Headphones' },
];

export const COMPANY_SECTORS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'it', label: 'Công nghệ thông tin' },
  { id: 'finance', label: 'Tài chính & Ngân hàng' },
  { id: 'retail', label: 'Bán lẻ & Tiêu dùng' },
  { id: 'logistics', label: 'Vận tải & Logistics' },
];

export const HIGHLIGHT_CATEGORIES = [
  { id: 'cat-it', name: 'Công nghệ thông tin', iconName: 'Monitor', subtitle: 'Tuyển dụng sôi động' },
  { id: 'cat-finance', name: 'Tài chính / Ngân hàng', iconName: 'Calculator', subtitle: 'Đãi ngộ hấp dẫn' },
  { id: 'cat-marketing', name: 'Marketing & PR', iconName: 'Megaphone', subtitle: 'Môi trường sáng tạo' },
  { id: 'cat-sales', name: 'Kinh doanh & Bán hàng', iconName: 'ShoppingCart', subtitle: 'Hoa hồng cạnh tranh' },
  { id: 'cat-hr', name: 'Nhân sự & Hành chính', iconName: 'Building2', subtitle: 'Đa dạng vị trí' },
  { id: 'cat-design', name: 'Thiết kế & Sáng tạo', iconName: 'Compass', subtitle: 'Dự án phong phú' },
  { id: 'cat-support', name: 'Chăm sóc khách hàng', iconName: 'Headphones', subtitle: 'Tuyển dụng liên tục' },
  { id: 'cat-all', name: 'Tất cả ngành nghề', iconName: 'Briefcase', subtitle: 'Cơ hội toàn quốc' },
];

export const CANDIDATE_TOOLS = [
  {
    id: 'tool-cv',
    title: 'Tạo CV chuyên nghiệp',
    description: 'Thiết kế mẫu CV hiện đại, thu hút nhà tuyển dụng chỉ trong vài phút.',
    iconName: 'FileText',
    actionText: 'Tạo CV ngay',
    link: '/ung-vien/tao-cv',
  },
  {
    id: 'tool-job',
    title: 'Tìm việc làm thông minh',
    description: 'Bộ lọc đa tiêu chí giúp bạn tiếp cận nhanh các cơ hội việc làm tốt nhất.',
    iconName: 'Sparkles',
    actionText: 'Khám phá việc làm',
    link: '/viec-lam',
  },
  {
    id: 'tool-company',
    title: 'Doanh nghiệp uy tín',
    description: 'Tra cứu thông tin, văn hóa công ty và chế độ đãi ngộ trước khi ứng tuyển.',
    iconName: 'Banknote',
    actionText: 'Xem doanh nghiệp',
    link: '/cong-ty',
  },
];
