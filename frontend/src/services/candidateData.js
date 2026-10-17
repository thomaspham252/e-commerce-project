/* Dữ liệu mô phỏng cho luồng ứng viên: chi tiết tin, hồ sơ CV, lịch sử ứng tuyển */

export const COMPANY_PROFILES = {
  "VNG Corporation": {
    industry: "Công nghệ / Internet",
    size: "3.000 - 5.000 nhân viên",
    website: "vng.com.vn",
    address: "Z06 Đường số 13, Tân Thuận Đông, Quận 7, TP. Hồ Chí Minh",
    founded: 2004,
    description:
      "VNG là một trong những công ty công nghệ lớn nhất Việt Nam, hoạt động trong bốn lĩnh vực chính: trò chơi trực tuyến, nền tảng kết nối, thanh toán điện tử và dịch vụ đám mây."
  },
  "FPT Software": {
    industry: "Gia công phần mềm",
    size: "Trên 10.000 nhân viên",
    website: "fptsoftware.com",
    address: "Toà F-Ville, Khu công nghệ cao Hoà Lạc, Thạch Thất, Hà Nội",
    founded: 1999,
    description:
      "FPT Software là công ty xuất khẩu phần mềm hàng đầu Việt Nam, cung cấp dịch vụ chuyển đổi số cho hơn 1.000 khách hàng tại 30 quốc gia."
  },
  MoMo: {
    industry: "Fintech / Ví điện tử",
    size: "1.000 - 3.000 nhân viên",
    website: "momo.vn",
    address: "Toà nhà Phú Mỹ Hưng, Quận 7, TP. Hồ Chí Minh",
    founded: 2007,
    description:
      "MoMo là siêu ứng dụng thanh toán số một Việt Nam với hơn 31 triệu người dùng, cung cấp hệ sinh thái thanh toán, tài chính và thương mại điện tử."
  },
  "Shopee Vietnam": {
    industry: "Thương mại điện tử",
    size: "5.000 - 10.000 nhân viên",
    website: "careers.shopee.vn",
    address: "Toà Saigon Centre, Quận 1, TP. Hồ Chí Minh",
    founded: 2015,
    description:
      "Shopee là nền tảng thương mại điện tử hàng đầu Đông Nam Á và Đài Loan, mang đến trải nghiệm mua sắm trực tuyến an toàn và thuận tiện."
  },
  Tiki: {
    industry: "Thương mại điện tử",
    size: "1.000 - 3.000 nhân viên",
    website: "tuyendung.tiki.vn",
    address: "52 Út Tịch, Phường 4, Tân Bình, TP. Hồ Chí Minh",
    founded: 2010,
    description:
      "Tiki là sàn thương mại điện tử Việt Nam nổi tiếng với dịch vụ giao hàng nhanh TikiNOW và cam kết hàng chính hãng 100%."
  },
  Viettel: {
    industry: "Viễn thông / Công nghệ",
    size: "Trên 10.000 nhân viên",
    website: "vietteltelecom.vn",
    address: "Số 1 Trần Hữu Dực, Mỹ Đình, Nam Từ Liêm, Hà Nội",
    founded: 1989,
    description:
      "Tập đoàn Công nghiệp - Viễn thông Quân đội Viettel là nhà mạng lớn nhất Việt Nam, đầu tư mạnh vào hạ tầng số, AI và an toàn thông tin."
  }
};

export const JOB_DETAILS = {
  "job-1": {
    jobType: "Toàn thời gian",
    level: "Nhân viên",
    experience: "2 - 4 năm",
    quantity: 3,
    deadline: "31/10/2026",
    postedDate: "08/10/2026",
    views: 1240,
    applicants: 38,
    skills: ["ReactJS", "TypeScript", "Redux", "TailwindCSS", "REST API"],
    description: [
      "Phát triển và bảo trì các tính năng giao diện cho hệ sinh thái sản phẩm Zalo trên nền tảng web.",
      "Phối hợp cùng Designer và Backend để hiện thực hoá thiết kế thành sản phẩm chạy thực tế.",
      "Tối ưu hiệu năng trang, đảm bảo điểm Lighthouse trên 90 và trải nghiệm mượt trên thiết bị di động.",
      "Tham gia code review, viết unit test và góp ý cải tiến quy trình phát triển của nhóm."
    ],
    requirements: [
      "Tối thiểu 2 năm kinh nghiệm làm việc với ReactJS trong môi trường sản phẩm thực tế.",
      "Thành thạo JavaScript ES6+, HTML5, CSS3 và hiểu rõ cơ chế render của React.",
      "Có kinh nghiệm với TypeScript, quản lý state (Redux / Zustand) và công cụ build hiện đại (Vite, Webpack).",
      "Biết sử dụng Git theo quy trình nhóm, quen với CI/CD là một lợi thế.",
      "Kỹ năng giao tiếp tốt, chủ động và có tinh thần học hỏi công nghệ mới."
    ],
    benefits: [
      "Thu nhập 15 - 25 triệu, xét tăng lương 2 lần mỗi năm theo năng lực.",
      "Thưởng hiệu suất quý, thưởng tháng 13 và cổ phiếu ESOP cho nhân sự xuất sắc.",
      "Bảo hiểm sức khoẻ VNG Care cho bản thân và người thân trong gia đình.",
      "Làm việc hybrid 2 ngày mỗi tuần, trang bị MacBook Pro và màn hình phụ.",
      "Ngân sách đào tạo 10 triệu mỗi năm cho khoá học và hội thảo công nghệ."
    ]
  },
  "job-2": {
    jobType: "Toàn thời gian",
    level: "Nhân viên",
    experience: "3 - 5 năm",
    quantity: 5,
    deadline: "15/11/2026",
    postedDate: "07/10/2026",
    views: 2180,
    applicants: 64,
    skills: ["Java", "Spring Boot", "MySQL", "Docker", "Microservices"],
    description: [
      "Thiết kế và phát triển các service backend cho dự án khách hàng Nhật Bản theo kiến trúc microservices.",
      "Viết API RESTful, tối ưu truy vấn cơ sở dữ liệu và đảm bảo thời gian phản hồi dưới 200ms.",
      "Tham gia phân tích yêu cầu nghiệp vụ cùng Business Analyst và khách hàng.",
      "Triển khai, theo dõi hệ thống trên môi trường cloud và xử lý sự cố khi phát sinh."
    ],
    requirements: [
      "Ít nhất 3 năm kinh nghiệm phát triển ứng dụng với Java và Spring Boot.",
      "Hiểu sâu về OOP, design pattern, multithreading và tối ưu hiệu năng JVM.",
      "Kinh nghiệm làm việc với MySQL hoặc PostgreSQL, viết query phức tạp và tối ưu index.",
      "Quen với Docker, Kubernetes hoặc một nền tảng cloud (AWS, Azure, GCP).",
      "Tiếng Anh hoặc tiếng Nhật giao tiếp tốt để làm việc trực tiếp với khách hàng."
    ],
    benefits: [
      "Lương 20 - 35 triệu kèm phụ cấp dự án onsite nước ngoài.",
      "Cơ hội onsite tại Nhật Bản, Singapore từ 6 tháng đến 2 năm.",
      "Bảo hiểm FPT Care, khám sức khoẻ định kỳ hằng năm.",
      "Hỗ trợ toàn bộ chi phí thi chứng chỉ AWS, Oracle, JLPT.",
      "Môi trường quy mô lớn, lộ trình thăng tiến rõ ràng theo khung năng lực."
    ]
  },
  "job-3": {
    jobType: "Toàn thời gian",
    level: "Nhân viên",
    experience: "2 - 3 năm",
    quantity: 2,
    deadline: "25/10/2026",
    postedDate: "08/10/2026",
    views: 980,
    applicants: 27,
    skills: ["Figma", "Design System", "User Research", "Prototyping"],
    description: [
      "Thiết kế giao diện và trải nghiệm cho các luồng thanh toán trên ứng dụng MoMo.",
      "Xây dựng và duy trì design system dùng chung giữa các nhóm sản phẩm.",
      "Thực hiện nghiên cứu người dùng, phỏng vấn và kiểm thử khả năng sử dụng.",
      "Làm việc chặt chẽ với Product Manager và Developer từ khâu ý tưởng đến khi lên sản phẩm."
    ],
    requirements: [
      "Từ 2 năm kinh nghiệm thiết kế sản phẩm số, có portfolio thể hiện quy trình tư duy.",
      "Thành thạo Figma, biết tạo component, auto-layout và prototype tương tác.",
      "Hiểu nguyên tắc thiết kế mobile trên cả iOS và Android.",
      "Có khả năng bảo vệ quyết định thiết kế bằng dữ liệu và insight người dùng.",
      "Ưu tiên ứng viên từng làm sản phẩm fintech hoặc có lượng người dùng lớn."
    ],
    benefits: [
      "Thu nhập 15 - 20 triệu, review lương mỗi 6 tháng.",
      "Thưởng theo kết quả sản phẩm và chỉ số tăng trưởng người dùng.",
      "Bảo hiểm sức khoẻ mở rộng, ngân sách chăm sóc tinh thần hằng năm.",
      "Thời gian làm việc linh hoạt, 15 ngày phép mỗi năm.",
      "Tham gia các workshop thiết kế cùng chuyên gia trong và ngoài nước."
    ]
  },
  "job-4": {
    jobType: "Toàn thời gian",
    level: "Trưởng nhóm",
    experience: "5 năm trở lên",
    quantity: 2,
    deadline: "05/11/2026",
    postedDate: "05/10/2026",
    views: 3050,
    applicants: 91,
    skills: ["NodeJS", "ReactJS", "GraphQL", "AWS", "System Design"],
    description: [
      "Dẫn dắt nhóm 5 - 7 kỹ sư phát triển tính năng cho nền tảng bán hàng của Shopee.",
      "Chịu trách nhiệm thiết kế kiến trúc cho cả frontend và backend của sản phẩm phụ trách.",
      "Đặt chuẩn chất lượng code, quy trình review và hướng dẫn thành viên ít kinh nghiệm hơn.",
      "Phối hợp đa khu vực với các nhóm tại Singapore và Indonesia."
    ],
    requirements: [
      "Trên 5 năm kinh nghiệm fullstack, trong đó có ít nhất 1 năm ở vai trò dẫn dắt kỹ thuật.",
      "Thành thạo NodeJS và ReactJS, hiểu rõ đánh đổi khi thiết kế hệ thống phân tán.",
      "Kinh nghiệm xử lý hệ thống lưu lượng lớn, caching và message queue.",
      "Tư duy sản phẩm tốt, biết ưu tiên việc theo giá trị mang lại cho người dùng.",
      "Tiếng Anh thành thạo cả nói và viết."
    ],
    benefits: [
      "Thu nhập 30 - 50 triệu kèm gói cổ phiếu hằng năm.",
      "Thưởng cuối năm lên đến 4 tháng lương theo kết quả kinh doanh.",
      "Bảo hiểm cao cấp cho nhân viên, vợ hoặc chồng và con.",
      "Hỗ trợ chi phí đi lại và ăn trưa tại văn phòng trung tâm Quận 1.",
      "Cơ hội luân chuyển công tác giữa các thị trường Đông Nam Á."
    ]
  },
  "job-5": {
    jobType: "Toàn thời gian",
    level: "Nhân viên",
    experience: "1 - 3 năm",
    quantity: 4,
    deadline: "20/10/2026",
    postedDate: "01/10/2026",
    views: 1620,
    applicants: 53,
    skills: ["SQL", "Python", "Power BI", "A/B Testing", "Thống kê"],
    description: [
      "Phân tích hành vi người dùng trên sàn Tiki để đưa ra khuyến nghị cho đội sản phẩm.",
      "Xây dựng dashboard theo dõi các chỉ số vận hành và kinh doanh theo ngày.",
      "Thiết kế và đánh giá kết quả các thử nghiệm A/B trước khi triển khai rộng.",
      "Trình bày kết quả phân tích cho các bên liên quan bằng ngôn ngữ dễ hiểu."
    ],
    requirements: [
      "Từ 1 năm kinh nghiệm ở vị trí phân tích dữ liệu hoặc tương đương.",
      "Viết SQL tốt, biết tối ưu truy vấn trên bộ dữ liệu hàng chục triệu dòng.",
      "Sử dụng được Python (pandas, numpy) để xử lý và làm sạch dữ liệu.",
      "Nắm vững kiến thức thống kê cơ bản, hiểu ý nghĩa p-value và khoảng tin cậy.",
      "Tỉ mỉ, cẩn thận và có khả năng kể chuyện bằng dữ liệu."
    ],
    benefits: [
      "Lương 18 - 30 triệu thoả thuận theo năng lực thực tế.",
      "Thưởng theo hiệu quả dự án phân tích mang lại.",
      "Voucher mua sắm Tiki hằng tháng cho nhân viên.",
      "Làm việc 5 ngày mỗi tuần, được chọn khung giờ bắt đầu linh hoạt.",
      "Hỗ trợ học phí các khoá dữ liệu và chứng chỉ phân tích."
    ]
  },
  "job-6": {
    jobType: "Toàn thời gian",
    level: "Nhân viên",
    experience: "2 - 4 năm",
    quantity: 6,
    deadline: "30/11/2026",
    postedDate: "01/10/2026",
    views: 870,
    applicants: 19,
    skills: ["Linux", "Networking", "Ansible", "Zabbix", "Bảo mật"],
    description: [
      "Quản trị, vận hành hệ thống máy chủ Linux tại trung tâm dữ liệu của Viettel.",
      "Theo dõi, cảnh báo và xử lý sự cố hạ tầng theo cơ chế trực luân phiên 24/7.",
      "Tự động hoá công việc vận hành bằng script và công cụ cấu hình tập trung.",
      "Thực hiện sao lưu, phục hồi và rà soát an toàn thông tin định kỳ."
    ],
    requirements: [
      "Từ 2 năm kinh nghiệm quản trị hệ thống Linux trong môi trường sản xuất.",
      "Hiểu rõ về mạng TCP/IP, DNS, firewall và load balancer.",
      "Sử dụng được ít nhất một công cụ tự động hoá như Ansible, Puppet hoặc Chef.",
      "Có kinh nghiệm với hệ thống giám sát Zabbix, Grafana, Prometheus.",
      "Sẵn sàng tham gia trực hệ thống theo ca."
    ],
    benefits: [
      "Thu nhập 12 - 20 triệu kèm phụ cấp trực ca và làm ngoài giờ.",
      "Chế độ phúc lợi theo quy định của tập đoàn, thưởng các ngày lễ lớn.",
      "Được đào tạo và cấp chứng chỉ hệ thống, bảo mật miễn phí.",
      "Môi trường ổn định lâu dài, xét nâng bậc theo thâm niên và năng lực.",
      "Hỗ trợ nhà ở và xe đưa rước cho nhân sự làm việc tại Hoà Lạc."
    ]
  }
};

export const CVS = [
  {
    id: "cv-1",
    name: "CV_NguyenVanAn_Frontend.pdf",
    updatedAt: "05/10/2026",
    size: "412 KB",
    isDefault: true
  },
  {
    id: "cv-2",
    name: "CV_NguyenVanAn_Fullstack.pdf",
    updatedAt: "28/09/2026",
    size: "386 KB",
    isDefault: false
  },
  {
    id: "cv-3",
    name: "CV_English_NguyenVanAn.pdf",
    updatedAt: "12/09/2026",
    size: "355 KB",
    isDefault: false
  }
];

export const APPLICATION_STATUS = {
  SUBMITTED: "Đã ứng tuyển",
  REVIEWING: "Đang xem xét",
  INTERVIEW: "Phỏng vấn",
  REJECTED: "Từ chối",
  HIRED: "Đã tuyển"
};

export const APPLICATIONS = [
  {
    id: "app-1",
    jobId: "job-2",
    jobTitle: "Backend Engineer (Java/Spring)",
    companyName: "FPT Software",
    companyLogo: "/images/companies/fpt.png",
    location: "Hồ Chí Minh",
    salary: "20 - 35 Triệu",
    cvName: "CV_NguyenVanAn_Fullstack.pdf",
    appliedAt: "06/10/2026",
    status: APPLICATION_STATUS.INTERVIEW,
    note: "Phỏng vấn vòng 2 lúc 14:00 ngày 12/10/2026 tại toà F-Ville."
  },
  {
    id: "app-2",
    jobId: "job-4",
    jobTitle: "Fullstack Web Developer",
    companyName: "Shopee Vietnam",
    companyLogo: "/images/companies/shoppe.png",
    location: "Hà Nội",
    salary: "30 - 50 Triệu",
    cvName: "CV_English_NguyenVanAn.pdf",
    appliedAt: "03/10/2026",
    status: APPLICATION_STATUS.REVIEWING,
    note: "Nhà tuyển dụng đã xem hồ sơ của bạn."
  },
  {
    id: "app-3",
    jobId: "job-5",
    jobTitle: "Data Analyst",
    companyName: "Tiki",
    companyLogo: "/images/companies/tiki.png",
    location: "Hồ Chí Minh",
    salary: "18 - 30 Triệu",
    cvName: "CV_NguyenVanAn_Frontend.pdf",
    appliedAt: "28/09/2026",
    status: APPLICATION_STATUS.REJECTED,
    note: "Hồ sơ chưa phù hợp với yêu cầu kinh nghiệm SQL của vị trí."
  },
  {
    id: "app-4",
    jobId: "job-6",
    jobTitle: "System Admin",
    companyName: "Viettel",
    companyLogo: "/images/companies/viettel.png",
    location: "Hà Nội",
    salary: "12 - 20 Triệu",
    cvName: "CV_NguyenVanAn_Fullstack.pdf",
    appliedAt: "20/09/2026",
    status: APPLICATION_STATUS.HIRED,
    note: "Chúc mừng! Bạn đã nhận được thư mời nhận việc."
  }
];
