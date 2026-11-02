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
  { id: 'cat-it', name: 'Công nghệ thông tin', icon: 'Monitor', count: 'IT' },
  { id: 'cat-finance', name: 'Tài chính / Kế toán', icon: 'Calculator', count: 'Kế toán' },
  { id: 'cat-marketing', name: 'Marketing / Truyền thông', icon: 'Megaphone', count: 'Marketing' },
  { id: 'cat-sales', name: 'Kinh doanh / Bán lẻ', icon: 'ShoppingCart', count: 'Sales' },
  { id: 'cat-hr', name: 'Nhân sự / Hành chính', icon: 'Building2', count: 'HR' },
  { id: 'cat-design', name: 'Thiết kế / Đồ họa', icon: 'Compass', count: 'Design' },
  { id: 'cat-support', name: 'Chăm sóc khách hàng', icon: 'Headphones', count: 'CSKH' },
];

export const COMPANY_SECTORS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'it', label: 'Công nghệ thông tin' },
  { id: 'finance', label: 'Tài chính & Ngân hàng' },
  { id: 'retail', label: 'Bán lẻ & Tiêu dùng' },
  { id: 'logistics', label: 'Vận tải & Logistics' },
];

export const HIGHLIGHT_CATEGORIES = [
  { id: 'cat-it', name: 'Công nghệ thông tin', iconName: 'Monitor', jobCount: '100+' },
  { id: 'cat-finance', name: 'Tài chính / Ngân hàng', iconName: 'Calculator', jobCount: '50+' },
  { id: 'cat-marketing', name: 'Marketing & PR', iconName: 'Megaphone', jobCount: '40+' },
  { id: 'cat-sales', name: 'Kinh doanh & Bán hàng', iconName: 'ShoppingCart', jobCount: '60+' },
  { id: 'cat-hr', name: 'Nhân sự & Hành chính', iconName: 'Building2', jobCount: '30+' },
  { id: 'cat-design', name: 'Thiết kế & Sáng tạo', iconName: 'Compass', jobCount: '25+' },
  { id: 'cat-support', name: 'Chăm sóc khách hàng', iconName: 'Headphones', jobCount: '35+' },
  { id: 'cat-all', name: 'Tất cả ngành nghề', iconName: 'Briefcase', jobCount: 'Toàn quốc' },
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

export const FEATURED_JOBS = [];
export const FEATURED_COMPANIES = [];
export const PLATFORM_STATS = [];
