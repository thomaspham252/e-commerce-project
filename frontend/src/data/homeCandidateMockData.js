/**
 * Dữ liệu mẫu (Mock Data) độc lập cho Trang chủ ứng viên JobViet
 * Tuân thủ quy chuẩn thiết kế:
 * - Avatar chữ viết tắt nền trung tính cho thương hiệu doanh nghiệp (prop logoUrl sẵn sàng nhận ảnh thật)
 * - Không sử dụng hình ảnh stock người
 * - Phân chia rõ ràng theo danh mục, vị trí, tab
 */

export const HERO_POPULAR_KEYWORDS = [
  'ReactJS',
  'Java Backend',
  'Marketing Executive',
  'Kế toán tổng hợp',
  'Data Analyst',
  'Chăm sóc khách hàng',
  'UI/UX Designer'
];

export const HERO_SIDEBAR_CATEGORIES = [
  { id: 'cat-it', name: 'Công nghệ thông tin', icon: 'Monitor', count: '1.450+' },
  { id: 'cat-finance', name: 'Tài chính / Kế toán', icon: 'Calculator', count: '890+' },
  { id: 'cat-marketing', name: 'Marketing / Truyền thông', icon: 'Megaphone', count: '1.120+' },
  { id: 'cat-sales', name: 'Kinh doanh / Bán lẻ', icon: 'ShoppingCart', count: '2.340+' },
  { id: 'cat-hr', name: 'Nhân sự / Hành chính', icon: 'Building2', count: '650+' },
  { id: 'cat-design', name: 'Thiết kế / Đồ họa', icon: 'Compass', count: '480+' },
  { id: 'cat-support', name: 'Chăm sóc khách hàng', icon: 'Headphones', count: '920+' }
];

export const LOCATION_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'hanoi', label: 'Hà Nội' },
  { id: 'hcm', label: 'TP. Hồ Chí Minh' },
  { id: 'danang', label: 'Đà Nẵng' },
  { id: 'remote', label: 'Làm việc từ xa' }
];

export const FEATURED_JOBS = [
  {
    id: 'job-1',
    title: 'Senior Frontend Developer (React/Next.js)',
    companyName: 'VNG Corporation',
    initials: 'VNG',
    logoUrl: '/images/companies/vng.png',
    salary: '25 - 40 Triệu',
    location: 'Hà Nội',
    locationKey: 'hanoi',
    timeAgo: '1 giờ trước',
    badgeType: 'hot',
    badgeText: 'Tuyển gấp',
    tabCategory: 'latest' // 'latest' hoặc 'for_you'
  },
  {
    id: 'job-2',
    title: 'Java Backend Engineer (Spring Cloud)',
    companyName: 'FPT Software',
    initials: 'FPT',
    logoUrl: '/images/companies/fpt.png',
    salary: '22 - 35 Triệu',
    location: 'TP. Hồ Chí Minh',
    locationKey: 'hcm',
    timeAgo: '3 giờ trước',
    badgeType: 'new',
    badgeText: 'Mới đăng',
    tabCategory: 'for_you'
  },
  {
    id: 'job-3',
    title: 'Chuyên viên Marketing Kỹ thuật số (Digital Lead)',
    companyName: 'Viettel Telecom',
    initials: 'VT',
    logoUrl: '/images/companies/viettel.png',
    salary: '18 - 28 Triệu',
    location: 'Hà Nội',
    locationKey: 'hanoi',
    timeAgo: '5 giờ trước',
    badgeType: 'hot',
    badgeText: 'Lương cao',
    tabCategory: 'latest'
  },
  {
    id: 'job-4',
    title: 'Senior Product Designer (UI/UX)',
    companyName: 'MoMo Payment',
    initials: 'MM',
    logoUrl: '/images/companies/momo.png',
    salary: '28 - 45 Triệu',
    location: 'TP. Hồ Chí Minh',
    locationKey: 'hcm',
    timeAgo: 'Hôm nay',
    badgeType: 'new',
    badgeText: 'Đề xuất',
    tabCategory: 'for_you'
  },
  {
    id: 'job-5',
    title: 'Kế toán trưởng chi nhánh miền Trung',
    companyName: 'Masan Group',
    initials: 'MS',
    logoUrl: '/images/companies/image.png',
    salary: '20 - 30 Triệu',
    location: 'Đà Nẵng',
    locationKey: 'danang',
    timeAgo: 'Hôm qua',
    badgeType: null,
    badgeText: null,
    tabCategory: 'latest'
  },
  {
    id: 'job-6',
    title: 'Data Analyst / BI Specialist (Power BI, SQL)',
    companyName: 'Shopee Vietnam',
    initials: 'SP',
    logoUrl: '/images/companies/shoppe.png',
    salary: '18 - 26 Triệu',
    location: 'Làm việc từ xa',
    locationKey: 'remote',
    timeAgo: '2 ngày trước',
    badgeType: 'new',
    badgeText: 'Remote 100%',
    tabCategory: 'for_you'
  },
  {
    id: 'job-7',
    title: 'Trưởng phòng Kinh doanh Doanh nghiệp B2B',
    companyName: 'VNPT Technology',
    initials: 'VNPT',
    logoUrl: '/images/companies/default.svg',
    salary: '25 - 40 Triệu',
    location: 'Hà Nội',
    locationKey: 'hanoi',
    timeAgo: '2 ngày trước',
    badgeType: 'hot',
    badgeText: 'Thưởng cao',
    tabCategory: 'latest'
  },
  {
    id: 'job-8',
    title: 'DevOps / Cloud Engineer (AWS / Kubernetes)',
    companyName: 'Tiki Corporation',
    initials: 'TK',
    logoUrl: '/images/companies/tiki.png',
    salary: '30 - 50 Triệu',
    location: 'TP. Hồ Chí Minh',
    locationKey: 'hcm',
    timeAgo: '3 ngày trước',
    badgeType: 'hot',
    badgeText: 'Hot',
    tabCategory: 'for_you'
  },
  {
    id: 'job-9',
    title: 'Chuyên viên Nhân sự Tuyển dụng (Tech Recruiter)',
    companyName: 'Techcombank',
    initials: 'TCB',
    logoUrl: '/images/companies/default.svg',
    salary: '16 - 25 Triệu',
    location: 'Đà Nẵng',
    locationKey: 'danang',
    timeAgo: '3 ngày trước',
    badgeType: null,
    badgeText: null,
    tabCategory: 'latest'
  }
];

export const COMPANY_SECTORS = [
  { id: 'all', label: 'Tất cả lĩnh vực' },
  { id: 'it', label: 'Công nghệ thông tin' },
  { id: 'finance', label: 'Tài chính - Ngân hàng' },
  { id: 'retail', label: 'Bán lẻ & Tiêu dùng' },
  { id: 'telco', label: 'Viễn thông & Dịch vụ' }
];

export const FEATURED_COMPANIES = [
  {
    id: 'comp-1',
    name: 'VNG Corporation',
    initials: 'VNG',
    sectorKey: 'it',
    sectorName: 'Công nghệ thông tin',
    openJobsCount: 38,
    location: 'TP. HCM & Hà Nội',
    logoUrl: '/images/companies/vng.png'
  },
  {
    id: 'comp-2',
    name: 'FPT Software',
    initials: 'FPT',
    sectorKey: 'it',
    sectorName: 'Công nghệ thông tin',
    openJobsCount: 65,
    location: 'Toàn quốc',
    logoUrl: '/images/companies/fpt.png'
  },
  {
    id: 'comp-3',
    name: 'Techcombank',
    initials: 'TCB',
    sectorKey: 'finance',
    sectorName: 'Tài chính - Ngân hàng',
    openJobsCount: 42,
    location: 'Hà Nội & TP. HCM',
    logoUrl: '/images/companies/default.svg'
  },
  {
    id: 'comp-4',
    name: 'MoMo Payment',
    initials: 'MM',
    sectorKey: 'finance',
    sectorName: 'Fintech & Ví điện tử',
    openJobsCount: 24,
    location: 'TP. Hồ Chí Minh',
    logoUrl: '/images/companies/momo.png'
  },
  {
    id: 'comp-5',
    name: 'Masan Consumer',
    initials: 'MS',
    sectorKey: 'retail',
    sectorName: 'Bán lẻ & Tiêu dùng',
    openJobsCount: 31,
    location: 'Toàn quốc',
    logoUrl: '/images/companies/image.png'
  },
  {
    id: 'comp-6',
    name: 'Shopee Vietnam',
    initials: 'SP',
    sectorKey: 'retail',
    sectorName: 'Thương mại điện tử',
    openJobsCount: 29,
    location: 'TP. HCM & Hà Nội',
    logoUrl: '/images/companies/shoppe.png'
  },
  {
    id: 'comp-7',
    name: 'Viettel Group',
    initials: 'VT',
    sectorKey: 'telco',
    sectorName: 'Viễn thông & Công nghệ',
    openJobsCount: 52,
    location: 'Toàn quốc',
    logoUrl: '/images/companies/viettel.png'
  },
  {
    id: 'comp-8',
    name: 'VNPT Group',
    initials: 'VNPT',
    sectorKey: 'telco',
    sectorName: 'Viễn thông số',
    openJobsCount: 27,
    location: 'Hà Nội',
    logoUrl: '/images/companies/default.svg'
  }
];

export const HIGHLIGHT_CATEGORIES = [
  { id: 'cat-1', name: 'Công nghệ thông tin', jobCount: '1.450', iconName: 'Monitor' },
  { id: 'cat-2', name: 'Tài chính / Kế toán', jobCount: '890', iconName: 'Calculator' },
  { id: 'cat-3', name: 'Marketing / Truyền thông', jobCount: '1.120', iconName: 'Megaphone' },
  { id: 'cat-4', name: 'Kinh doanh / Bán lẻ', jobCount: '2.340', iconName: 'ShoppingCart' },
  { id: 'cat-5', name: 'Nhân sự / Hành chính', jobCount: '650', iconName: 'Building2' },
  { id: 'cat-6', name: 'Thiết kế / Đồ họa', jobCount: '480', iconName: 'Compass' },
  { id: 'cat-7', name: 'Vận hành / Logistics', jobCount: '730', iconName: 'Briefcase' },
  { id: 'cat-8', name: 'Chăm sóc khách hàng', jobCount: '920', iconName: 'Headphones' }
];

export const CANDIDATE_TOOLS = [
  {
    id: 'tool-cv',
    title: 'Tạo CV chuyên nghiệp',
    description: 'Thiết kế hồ sơ chuẩn nhận diện tuyển dụng chỉ trong 5 phút với định dạng tối ưu.',
    actionText: 'Tạo CV ngay',
    link: '#',
    iconName: 'FileText'
  },
  {
    id: 'tool-recommend',
    title: 'Gợi ý việc làm phù hợp',
    description: 'Hệ thống tự động phân tích kỹ năng và đề xuất vị trí tuyển dụng tương thích nhất.',
    actionText: 'Xem việc làm phù hợp',
    link: '#',
    iconName: 'Sparkles'
  },
  {
    id: 'tool-salary',
    title: 'Tham khảo mức lương thị trường',
    description: 'Tra cứu khoảng thu nhập trung bình theo ngành nghề và cấp bậc kinh nghiệm thực tế.',
    actionText: 'Tra cứu mức lương',
    link: '#',
    iconName: 'Banknote'
  }
];

export const PLATFORM_STATS = [
  {
    id: 'stat-jobs',
    value: '18.500+',
    label: 'Cơ hội việc làm đang tuyển',
    iconName: 'Briefcase'
  },
  {
    id: 'stat-companies',
    value: '5.200+',
    label: 'Doanh nghiệp uy tín đồng hành',
    iconName: 'Building2'
  },
  {
    id: 'stat-candidates',
    value: '350.000+',
    label: 'Ứng viên tìm được việc làm',
    iconName: 'Users'
  },
  {
    id: 'stat-rate',
    value: '98.5%',
    label: 'Phản hồi tích cực từ nhà tuyển dụng',
    iconName: 'ShieldCheck'
  }
];
