/**
 * Dữ liệu mẫu (Mock Data) độc lập cho Trang chủ ứng viên
 * Tuân thủ Hiến pháp dự án (Nguyên tắc VI & VII):
 * - Không sử dụng logo thương hiệu có bản quyền
 * - Sử dụng avatar chữ viết tắt trên nền trung tính, có sẵn prop companyLogo/logoUrl để nhận ảnh thật khi cần
 */

export const JOBS = [
  {
    id: "job-1",
    title: "Frontend Developer (ReactJS)",
    companyName: "VNG Corporation",
    companyInitials: "VNG",
    companyLogo: "/images/companies/vng.png",
    salary: "15 - 25 Triệu",
    location: "Hà Nội",
    isSaved: false,
    isHot: true,
    isNew: true,
    timeAgo: "Hôm nay"
  },
  {
    id: "job-2",
    title: "Backend Engineer (Java/Spring)",
    companyName: "FPT Software",
    companyInitials: "FPT",
    companyLogo: "/images/companies/fpt.png",
    salary: "20 - 35 Triệu",
    location: "Hồ Chí Minh",
    isSaved: false,
    isHot: true,
    isNew: false,
    timeAgo: "1 ngày trước"
  },
  {
    id: "job-3",
    title: "UI/UX Designer",
    companyName: "MoMo",
    companyInitials: "MM",
    companyLogo: "/images/companies/momo.png",
    salary: "15 - 20 Triệu",
    location: "Đà Nẵng",
    isSaved: false,
    isHot: false,
    isNew: true,
    timeAgo: "Hôm nay"
  },
  {
    id: "job-4",
    title: "Fullstack Web Developer",
    companyName: "Shopee Vietnam",
    companyInitials: "SP",
    companyLogo: "/images/companies/shoppe.png",
    salary: "30 - 50 Triệu",
    location: "Hà Nội",
    isSaved: false,
    isHot: false,
    isNew: false,
    timeAgo: "3 ngày trước"
  },
  {
    id: "job-5",
    title: "Data Analyst",
    companyName: "Tiki",
    companyInitials: "TK",
    companyLogo: "/images/companies/tiki.png",
    salary: "18 - 30 Triệu",
    location: "Hồ Chí Minh",
    isSaved: false,
    isHot: false,
    isNew: false,
    timeAgo: "1 tuần trước"
  },
  {
    id: "job-6",
    title: "System Admin",
    companyName: "Viettel",
    companyInitials: "VT",
    companyLogo: "/images/companies/viettel.png",
    salary: "12 - 20 Triệu",
    location: "Hà Nội",
    isSaved: false,
    isHot: false,
    isNew: false,
    timeAgo: "1 tuần trước"
  }
];

export const CATEGORIES = [
  { id: "cat-1", name: "IT - Phần mềm", jobCount: 1250, iconName: "monitor" },
  { id: "cat-2", name: "Kế toán / Kiểm toán", jobCount: 840, iconName: "calculator" },
  { id: "cat-3", name: "Marketing / Truyền thông", jobCount: 1100, iconName: "megaphone" },
  { id: "cat-4", name: "Bán hàng / Kinh doanh", jobCount: 2300, iconName: "shopping-cart" }
];

export const EMPLOYERS = [
  { id: "emp-1", name: "VNG Corporation", initials: "VNG", logoUrl: "/images/companies/vng.png" },
  { id: "emp-2", name: "FPT Software", initials: "FPT", logoUrl: "/images/companies/fpt.png" },
  { id: "emp-3", name: "Viettel", initials: "VT", logoUrl: "/images/companies/viettel.png" },
  { id: "emp-4", name: "MoMo", initials: "MM", logoUrl: "/images/companies/momo.png" },
  { id: "emp-5", name: "Shopee Vietnam", initials: "SP", logoUrl: "/images/companies/shoppe.png" },
  { id: "emp-6", name: "Tiki", initials: "TK", logoUrl: "/images/companies/tiki.png" }
];
