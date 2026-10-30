package com.fit.project.config;

import com.fit.project.entity.Company;
import com.fit.project.entity.Job;
import com.fit.project.entity.User;
import com.fit.project.enums.JobStatus;
import com.fit.project.enums.SalaryUnit;
import com.fit.project.enums.UserRole;
import com.fit.project.enums.VerificationStatus;
import com.fit.project.repository.CompanyRepository;
import com.fit.project.repository.JobRepository;
import com.fit.project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class JobCatalogSeeder {

    private static final String SAMPLE_PASSWORD = "{noop}123456";

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;

    public record JobSeedItem(
            String companyKey,
            String title,
            String skills,
            int minMillion,
            int maxMillion,
            String level,
            String location,
            String jobType,
            int vacancies,
            String description,
            String requirements
    ) {}

    @Transactional
    public void seedCompaniesAndJobsIfIncomplete() {
        Map<String, Company> companies = ensureCompaniesExist();

        // Cập nhật trường skills cho các công việc hiện có nếu chưa có
        List<Job> existingJobs = jobRepository.findAll();
        for (Job job : existingJobs) {
            if (job.getSkills() == null || job.getSkills().isBlank()) {
                job.setSkills(deriveFallbackSkills(job.getTitle()));
                jobRepository.save(job);
            }
        }

        long currentCount = jobRepository.count();
        if (currentCount >= 100) {
            log.info("Hệ thống đã có {} việc làm (>= 100), không cần seed thêm.", currentCount);
            return;
        }

        List<JobSeedItem> items = getCatalog100Jobs();
        LocalDateTime now = LocalDateTime.now();
        int added = 0;

        for (int i = 0; i < items.size(); i++) {
            JobSeedItem item = items.get(i);
            Company comp = companies.get(item.companyKey());
            if (comp == null) {
                comp = companies.get("techasia");
            }

            // Tránh trùng lặp tiêu đề công việc tại cùng công ty
            boolean exists = jobRepository.findByCompanyIdAndStatus(comp.getId(), JobStatus.OPEN).stream()
                    .anyMatch(j -> j.getTitle().equalsIgnoreCase(item.title()));
            if (exists) {
                continue;
            }

            int daysAgo = 1 + (i % 45);
            LocalDateTime createdAt = now.minusDays(daysAgo).minusHours((i * 3) % 24);
            LocalDate deadline = LocalDate.now().plusDays(30 + (i % 60));

            Job job = Job.builder()
                    .company(comp)
                    .title(item.title())
                    .skills(item.skills())
                    .description(item.description())
                    .requirements(item.requirements())
                    .salaryMin(BigDecimal.valueOf(item.minMillion() * 1_000_000L))
                    .salaryMax(BigDecimal.valueOf(item.maxMillion() * 1_000_000L))
                    .salaryUnit(SalaryUnit.MONTH)
                    .location(item.location())
                    .jobType(item.jobType())
                    .level(item.level())
                    .vacancies(item.vacancies())
                    .workingSchedule("Thứ 2 - Thứ 6 (08:30 - 17:30)")
                    .deadline(deadline)
                    .status(JobStatus.OPEN)
                    .isHighlighted(i % 5 == 0)
                    .isPrioritized(i % 10 == 0)
                    .createdAt(createdAt)
                    .updatedAt(createdAt)
                    .reviewedAt(createdAt.plusHours(2))
                    .build();

            jobRepository.save(job);
            added++;
        }

        log.info("Đã seed bổ sung thành công {} việc làm IT mới. Tổng số việc làm hiện tại: {}",
                added, jobRepository.count());
    }

    private String deriveFallbackSkills(String title) {
        String lower = title.toLowerCase();
        if (lower.contains("java")) return "Java, Spring Boot, Microservices, MySQL, Docker";
        if (lower.contains("react") || lower.contains("frontend")) return "React, TypeScript, JavaScript, CSS3, HTML5";
        if (lower.contains("qa") || lower.contains("tester")) return "Automation Testing, Manual Testing, Selenium, JIRA, Postman";
        if (lower.contains("designer") || lower.contains("ui")) return "Figma, UI/UX, Wireframing, Prototyping, Design Systems";
        if (lower.contains("data")) return "Python, SQL, Spark, Data Engineering, ETL";
        return "Software Development, Git, Agile, Teamwork, Problem Solving";
    }

    private Map<String, Company> ensureCompaniesExist() {
        Map<String, Company> map = new HashMap<>();

        companyRepository.findAll().forEach(c -> {
            String lower = c.getName().toLowerCase();
            if (lower.contains("techasia")) map.put("techasia", c);
            else if (lower.contains("fpt")) map.put("fpt", c);
            else if (lower.contains("newstartup")) map.put("newstartup", c);
        });

        map.put("vng", getOrCreateCompany("hr@vng.com.vn", "VNG Corporation", "Công ty Cổ phần VNG",
                "0303848123", "Z06 Đường số 13, Tân Thuận Đông, Quận 7, TP.HCM", "IT - Phần mềm & Internet", "1000+",
                "https://vng.com.vn", "VNG là công ty công nghệ kỳ lân hàng đầu Việt Nam, phát triển các sản phẩm Zalo, Zing MP3, ZaloPay, VNG Cloud phục vụ hơn 100 triệu người dùng toàn cầu."));

        map.put("viettel", getOrCreateCompany("tuyendung@viettel.vn", "Viettel Digital", "Tổng Công ty Dịch vụ Số Viettel",
                "0108923451", "Số 1 Trần Hữu Dực, Mỹ Đình 2, Nam Từ Liêm, Hà Nội", "Fintech & Viễn thông số", "1000+",
                "https://viettel.vn", "Đơn vị nòng cốt của Tập đoàn Viettel dẫn dắt công cuộc chuyển đổi số quốc gia với hệ sinh thái Viettel Money, Cloud và Big Data."));

        map.put("momo", getOrCreateCompany("talent@momo.vn", "MoMo", "Công ty Cổ phần Dịch vụ Di động Trực tuyến (M-Service)",
                "0305365476", "Tòa nhà Phú Mỹ Hưng, Hoàng Văn Thái, Tân Phú, Quận 7, TP.HCM", "Fintech & Thanh toán điện tử", "1000+",
                "https://momo.vn", "MoMo là siêu ứng dụng thanh toán và tài chính số hàng đầu Việt Nam với hơn 31 triệu người dùng và công nghệ AI/Big Data tiên tiến."));

        map.put("shopee", getOrCreateCompany("recruitment@shopee.vn", "Shopee Vietnam", "Công ty TNHH Shopee Việt Nam",
                "0313498721", "Tòa nhà Saigon Centre, 67 Lê Lợi, Bến Nghé, Quận 1, TP.HCM", "Thương mại điện tử & Logistics", "1000+",
                "https://careers.shopee.vn", "Sàn thương mại điện tử hàng đầu Đông Nam Á, xử lý hàng triệu giao dịch mỗi giây với kiến trúc Microservices và hạ tầng phân tán cực lớn."));

        map.put("tiki", getOrCreateCompany("careers@tiki.vn", "Tiki Corporation", "Công ty Cổ phần Ti Ki",
                "0309532909", "52 Út Tịch, Phường 4, Tân Bình, TP.HCM", "Thương mại điện tử & Công nghệ bán lẻ", "500-999",
                "https://tiki.vn", "Hệ sinh thái TMĐT uy tín hàng đầu Việt Nam, tiên phong áp dụng công nghệ máy học, logistics thông minh và hệ thống quản trị kho tự động."));

        map.put("onemount", getOrCreateCompany("hr@onemount.com", "One Mount Group", "Công ty Cổ phần One Mount Group",
                "0108912345", "Tòa nhà Times City, 458 Minh Khai, Hai Bà Trưng, Hà Nội", "Công nghệ số & Hệ sinh thái tiêu dùng", "1000+",
                "https://onemount.com", "Hệ sinh thái công nghệ kiến tạo nền tảng số toàn diện với VinShop, VinID, OneHousing trên nền tảng Google Cloud và Kubernetes."));

        map.put("vnpt", getOrCreateCompany("recruitment@vnpt.vn", "VNPT-IT", "Công ty Công nghệ Thông tin VNPT",
                "0100684378", "57 Huỳnh Thúc Kháng, Đống Đa, Hà Nội", "Chính phủ số & CNTT Viễn thông", "1000+",
                "https://vnpt.com.vn", "Đơn vị chủ lực nghiên cứu và phát triển phần mềm, giải pháp Chính phủ số, Smart City và Y tế/Giáo dục số của VNPT."));

        map.put("cmc", getOrCreateCompany("tuyendung@cmctelecom.vn", "CMC Telecom", "Công ty Cổ phần Hạ tầng Viễn thông CMC",
                "0102918273", "Tòa nhà CMC, phố Duy Tân, Dịch Vọng Hậu, Cầu Giấy, Hà Nội", "Hạ tầng Cloud & An toàn thông tin", "500-999",
                "https://cmctelecom.vn", "Nhà cung cấp dịch vụ viễn thông toàn diện, Cloud đa nền tảng (AWS, Azure, Google Cloud) và Trung tâm Dữ liệu Tier 3 tiêu chuẩn quốc tế."));

        map.put("kms", getOrCreateCompany("career@kms-technology.com", "KMS Technology", "Công ty TNHH KMS Technology Việt Nam",
                "0308291024", "2 Tân Viên, Phường 2, Tân Bình, TP.HCM", "Phần mềm & Xuất khẩu phần mềm", "1000+",
                "https://kms-technology.com", "Công ty dịch vụ phát triển phần mềm hàng đầu cho thị trường Bắc Mỹ, chuyên sâu về Product Engineering, AI, Cloud và Software Testing."));

        map.put("nashtech", getOrCreateCompany("talent@nashtechglobal.com", "NashTech Vietnam", "Công ty TNHH NashTech Việt Nam",
                "0302345678", "364 Cộng Hòa, Phường 13, Tân Bình, TP.HCM", "Tư vấn công nghệ & Giải pháp toàn cầu", "1000+",
                "https://nashtechglobal.com", "Tập đoàn công nghệ toàn cầu cung cấp giải pháp chuyển đổi số, phát triển phần mềm và dịch vụ dữ liệu cho các khách hàng Fortune 500."));

        map.put("ghtk", getOrCreateCompany("tech.recruitment@ghtk.vn", "GHTK", "Công ty Cổ phần Giao Hàng Tiết Kiệm",
                "0106181829", "Tòa nhà GHTK Building, số 8 Phạm Hùng, Mễ Trì, Nam Từ Liêm, Hà Nội", "Logistics Tech & E-Logistics", "1000+",
                "https://ghtk.vn", "Công ty bưu chính công nghệ tự chủ 100% giải pháp lõi, vận hành mạng lưới vận tải liên tỉnh và xử lý hàng triệu đơn hàng mỗi ngày bằng AI và IoT."));

        map.put("zalopay", getOrCreateCompany("careers@zalopay.vn", "ZaloPay", "Công ty Cổ phần Zion (ZaloPay)",
                "0303848999", "VNG Campus, Khu chế xuất Tân Thuận, Quận 7, TP.HCM", "Fintech & Thanh toán số", "500-999",
                "https://zalopay.vn", "Ví điện tử quốc dân tích hợp trực tiếp trong Zalo, cung cấp giải pháp thanh toán QR đa năng, thẻ tín dụng và đầu tư tài chính thông minh."));

        map.put("line", getOrCreateCompany("careers_ltv@linecorp.com", "Line Technology Vietnam", "Công ty TNHH Line Technology Việt Nam",
                "0107788991", "Tòa nhà Capital Tower, 109 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội", "Internet & OTT Platform", "100-499",
                "https://linecorp.com", "Trung tâm R&D của Tập đoàn LINE tại Việt Nam, xây dựng nền tảng nhắn tin, fintech, AI và các dịch vụ quy mô hàng trăm triệu người dùng."));

        map.put("nab", getOrCreateCompany("vietnam.recruitment@nab.com.au", "NAB Innovation Centre Vietnam", "Trung tâm Đổi mới Sáng tạo NAB Việt Nam",
                "0315998811", "The Hallmark, Thủ Thiêm, Thành phố Thủ Đức, TP.HCM", "Banking Tech & Cloud Engineering", "1000+",
                "https://www.nab.com.au", "Trung tâm đổi mới sáng tạo công nghệ của một trong 4 ngân hàng lớn nhất nước Úc, tiên phong 100% hạ tầng AWS Cloud và Microservices ngân hàng."));

        map.put("grab", getOrCreateCompany("careers.vietnam@grab.com", "Grab Vietnam R&D", "Công ty TNHH Grab Việt Nam (Trung tâm R&D)",
                "0312650437", "Mapletree Business Centre, 1060 Nguyễn Văn Linh, Tân Phong, Quận 7, TP.HCM", "Siêu ứng dụng di chuyển & Giao vận", "1000+",
                "https://grab.careers", "Siêu ứng dụng hàng đầu Đông Nam Á, trung tâm kỹ thuật tại Việt Nam phụ trách nghiên cứu định vị bản đồ và thuật toán ghép cuốc thông minh."));

        map.put("axon", getOrCreateCompany("job@axonactive.com", "Axon Active Vietnam", "Công ty TNHH Axon Active Việt Nam",
                "0305889922", "39B Trường Sơn, Phường 4, Tân Bình, TP.HCM", "Gia công & Tư vấn phần mềm Thụy Sĩ", "500-999",
                "https://axonactive.com", "Công ty phần mềm 100% vốn Thụy Sĩ tiên phong phương pháp Agile/Scrum tại Việt Nam, chuyên xây dựng các hệ thống web và mobile enterprise."));

        map.put("topstech", getOrCreateCompany("contact@topstech.vn", "Tops Tech Vietnam", "Công ty Cổ phần Công nghệ Tops Tech",
                "0109923841", "Tòa nhà Discovery Complex, 302 Cầu Giấy, Hà Nội", "AI & Embedded IoT", "100-499",
                "https://topstech.vn", "Đơn vị chuyên phát triển các giải pháp thị giác máy tính Computer Vision, AI camera biên (Edge AI) và hệ thống nhà thông minh thế hệ mới."));

        return map;
    }

    private Company getOrCreateCompany(String email, String name, String legalName, String taxCode,
                                       String address, String industry, String size, String website, String description) {
        return companyRepository.findByTaxCode(taxCode).orElseGet(() -> {
            User owner = userRepository.findByEmailIgnoreCase(email).orElseGet(() ->
                    userRepository.save(User.builder()
                            .email(email)
                            .passwordHash(SAMPLE_PASSWORD)
                            .role(UserRole.EMPLOYER)
                            .createdAt(LocalDateTime.now().minusDays(180))
                            .build())
            );

            return companyRepository.save(Company.builder()
                    .owner(owner)
                    .name(name)
                    .legalName(legalName)
                    .taxCode(taxCode)
                    .address(address)
                    .industry(industry)
                    .size(size)
                    .website(website)
                    .description(description)
                    .verificationStatus(VerificationStatus.VERIFIED)
                    .verifiedAt(LocalDateTime.now().minusDays(170))
                    .build());
        });
    }

    public static List<JobSeedItem> getCatalog100Jobs() {
        List<JobSeedItem> list = new ArrayList<>(100);
        list.add(new JobSeedItem(
                "vng",
                "Senior Java Backend Engineer",
                "Java, Spring Boot, Microservices, Kafka, Redis, PostgreSQL, Docker, Kubernetes",
                35,
                55,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Thiết kế và phát triển hệ thống Microservices chịu tải cao cho hàng triệu người dùng hoạt động đồng thời.\\n- Xây dựng các RESTful API và gRPC endpoints bảo mật, tối ưu độ trễ thấp.\\n- Triển khai giải pháp caching với Redis và event-driven streaming bằng Apache Kafka.\\n- Tối ưu hóa hiệu năng JVM và truy vấn CSDL PostgreSQL.",
                "- Tối thiểu 4 năm kinh nghiệm làm việc với Java (Java 17+) và Spring Boot.\\n- Thành thạo kiến trúc Microservices, Kafka và cơ chế phân tán dữ liệu.\\n- Nắm vững tối ưu hóa SQL, indexing và distributed cache Redis.\\n- Có kinh nghiệm làm việc với Docker, Kubernetes và CI/CD."
        ));
        list.add(new JobSeedItem(
                "techasia",
                "Java Spring Boot Developer (Middle)",
                "Java, Spring Boot, Spring Security, Hibernate, MySQL, Redis, RESTful API",
                22,
                35,
                "Middle",
                "Hà Nội",
                "Toàn thời gian",
                3,
                "- Tham gia phát triển các phân hệ quản lý thương mại điện tử và cổng thanh toán nội địa.\\n- Thiết kế mô hình dữ liệu quan hệ MySQL và xây dựng RESTful API chuẩn REST.\\n- Tích hợp xác thực phân quyền Spring Security và JWT token.\\n- Viết Unit Test với JUnit 5 và Mockito đảm bảo chất lượng code.",
                "- Từ 2 năm kinh nghiệm lập trình backend với Java và hệ sinh thái Spring.\\n- Nắm vững nguyên lý SOLID, Design Patterns và cấu trúc dữ liệu thuật toán.\\n- Thành thạo JPA/Hibernate, MySQL và tối ưu câu lệnh truy vấn.\\n- Tinh thần làm việc nhóm tốt, chủ động học hỏi công nghệ mới."
        ));
        list.add(new JobSeedItem(
                "viettel",
                "Lead Java Software Architect",
                "Java, Spring Cloud, Software Architecture, Distributed Systems, Kafka, Kubernetes, High Concurrency",
                55,
                80,
                "Lead",
                "Hà Nội",
                "Toàn thời gian",
                1,
                "- Chịu trách nhiệm thiết kế kiến trúc tổng thể cho nền tảng ngân hàng số thế hệ mới.\\n- Xây dựng technical roadmap, chuẩn hóa coding convention và quy chuẩn bảo mật.\\n- Định hướng giải quyết các bài toán về High Availability (99.99%) và Fault Tolerance.\\n- Đào tạo và mentor cho đội ngũ hơn 20 kỹ sư backend trong dự án.",
                "- Tối thiểu 7 năm kinh nghiệm với Java và ít nhất 2 năm ở vị trí Solution/Software Architect.\\n- Am hiểu sâu sắc về Distributed Systems, CAP Theorem và Eventual Consistency.\\n- Thành thạo Spring Cloud, Kubernetes orchestration và Cloud native architecture.\\n- Khả năng giao tiếp xuất sắc và năng lực lãnh đạo công nghệ vững vàng."
        ));
        list.add(new JobSeedItem(
                "fpt",
                "Junior Java Backend Developer",
                "Java, Spring Boot, JPA, MySQL, Git, RESTful API, Postman",
                14,
                20,
                "Junior",
                "TP.HCM",
                "Toàn thời gian",
                4,
                "- Tham gia phát triển các chức năng theo tài liệu đặc tả kỹ thuật dự án khách hàng Nhật/Mỹ.\\n- Viết API CRUD, kiểm thử tích hợp với Postman và sửa lỗi hệ thống trong sprint.\\n- Tham gia daily stand-up, code review cùng Senior Developers.\\n- Tối ưu hóa code và viết tài liệu kỹ thuật bằng tiếng Anh.",
                "- Từ 1 năm kinh nghiệm làm việc với Java Core và Spring Boot.\\n- Hiểu biết về OOP, cơ sở dữ liệu quan hệ MySQL hoặc PostgreSQL.\\n- Sử dụng thành thạo Git, Postman và hiểu biết về RESTful API.\\n- Tiếng Anh giao tiếp hoặc đọc hiểu tài liệu chuyên ngành tốt."
        ));
        list.add(new JobSeedItem(
                "nab",
                "Java Backend Engineer (Fintech Banking)",
                "Java, Spring Boot, AWS, Microservices, Kafka, CI/CD, Terraform, TDD",
                40,
                65,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Xây dựng các dịch vụ thanh toán lõi trên hạ tầng 100% AWS Cloud của ngân hàng NAB.\\n- Áp dụng quy trình TDD (Test-Driven Development) và Pair Programming chất lượng cao.\\n- Tự động hóa hạ tầng bằng Terraform và triển khai CI/CD qua GitHub Actions.\\n- Đảm bảo tuân thủ các tiêu chuẩn bảo mật ngân hàng quốc tế khắt khe.",
                "- Tối thiểu 4 năm kinh nghiệm phát triển backend bằng Java hiện đại.\\n- Có kinh nghiệm làm việc trên AWS (ECS, Lambda, SQS, RDS).\\n- Thành thạo phương pháp Test-Driven Development (TDD) và Microservices.\\n- Tiếng Anh thành thạo cả 4 kỹ năng trong môi trường đa quốc gia."
        ));
        list.add(new JobSeedItem(
                "onemount",
                "Core Banking Java Developer",
                "Java, Spring Boot, Oracle DB, Message Queue, Docker, Redis, Unit Testing",
                25,
                38,
                "Middle",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Phát triển các dịch vụ tài chính liên kết thẻ và tài khoản ngân hàng số.\\n- Tích hợp hệ thống với các ngân hàng đối tác qua API bảo mật mTLS và ISO 8583.\\n- Tối ưu hiệu năng giao dịch thẻ và xử lý batch settlement hàng đêm.\\n- Tham gia giám sát và hỗ trợ trực chiến vận hành hệ thống thanh toán.",
                "- Từ 3 năm kinh nghiệm lập trình Java, ưu tiên kinh nghiệm trong mảng Fintech hoặc Ngân hàng.\\n- Kinh nghiệm làm việc sâu với CSDL Oracle hoặc PostgreSQL khối lượng dữ liệu lớn.\\n- Hiểu biết về bảo mật tài chính, chữ ký số và mã hóa dữ liệu.\\n- Khả năng làm việc độc lập và chịu áp lực công việc tốt."
        ));
        list.add(new JobSeedItem(
                "cmc",
                "Java Cloud Microservices Engineer",
                "Java, Spring Cloud, Docker, Kubernetes, AWS, PostgreSQL, RabbitMQ",
                24,
                36,
                "Middle",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Xây dựng các ứng dụng doanh nghiệp chạy trên môi trường Hybrid Cloud.\\n- Đóng gói ứng dụng thành Docker container và cấu hình triển khai trên Kubernetes.\\n- Phát triển cơ chế giao tiếp bất đồng bộ sử dụng RabbitMQ.\\n- Theo dõi và tối ưu hóa chi phí hạ tầng Cloud cho dịch vụ.",
                "- Từ 2 năm kinh nghiệm phát triển ứng dụng Java Spring Boot/Spring Cloud.\\n- Quen thuộc với Docker, Kubernetes (K8s) và các dịch vụ cơ bản của AWS/Azure.\\n- Hiểu rõ mô hình Pub/Sub và xử lý bất đồng bộ.\\n- Kỹ năng giải quyết vấn đề logic và tư duy hệ thống."
        ));
        list.add(new JobSeedItem(
                "fpt",
                "Fresher Java Developer (Đào tạo hưởng lương)",
                "Java, Spring Boot, SQL, OOP, Git, RESTful API",
                8,
                12,
                "Fresher",
                "Đà Nẵng",
                "Toàn thời gian",
                5,
                "- Được đào tạo chuyên sâu 2 tháng về Spring Boot, Microservices và quy trình dự án chuẩn CMMI.\\n- Tham gia vào các dự án phần mềm thực tế dưới sự hướng dẫn của Mentor giàu kinh nghiệm.\\n- Viết code, Unit test và cập nhật tiến độ công việc trên hệ thống quản lý dự án.\\n- Cơ hội thi các chứng chỉ quốc tế Oracle Certified Professional được công ty tài trợ.",
                "- Tốt nghiệp hoặc chuẩn bị tốt nghiệp chuyên ngành CNTT, Phần mềm hoặc liên quan.\\n- Nắm vững kiến thức Java Core, Lập trình hướng đối tượng (OOP) và SQL.\\n- Đã từng làm đồ án tốt nghiệp hoặc dự án cá nhân bằng Java/Spring Boot.\\n- Ham học hỏi, kiên trì và mong muốn phát triển sự nghiệp lâu dài."
        ));
        list.add(new JobSeedItem(
                "shopee",
                "Senior Java Platform Engineer",
                "Java, High Concurrency, Kafka, Redis, TiDB, Microservices, Distributed Systems",
                45,
                70,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Tối ưu hóa hệ thống backend xử lý hàng triệu request/giây trong các sự kiện Mega Sale (11.11, 12.12).\\n- Giải quyết triệt để các vấn đề về Race Condition, Distributed Locks và Cache Stampede.\\n- Thiết kế các kiến trúc dữ liệu phân tán với TiDB và Redis Cluster.\\n- Phối hợp với đội ngũ Infrastructure quốc tế để tối ưu hạ tầng mạng và máy chủ.",
                "- Tối thiểu 5 năm kinh nghiệm backend với Java trong các hệ thống High Traffic / E-commerce.\\n- Hiểu sâu sắc về Java Concurrency, JVM Internals, Garbage Collection tuning.\\n- Kinh nghiệm thực chiến với Distributed Databases (TiDB, CockroachDB hoặc Cassandra).\\n- Kỹ năng tư duy giải thuật xuất sắc và xử lý sự cố trực tiếp trong môi trường production."
        ));
        list.add(new JobSeedItem(
                "ghtk",
                "Backend Java Engineer (Logistics Core)",
                "Java, Spring Boot, Redis, MySQL, Kafka, Elasticsearch, Linux",
                23,
                37,
                "Middle",
                "Hà Nội",
                "Toàn thời gian",
                3,
                "- Xây dựng các dịch vụ cốt lõi theo dõi định vị bưu kiện và phân luồng vận chuyển liên tỉnh.\\n- Tối ưu hóa thuật toán gom đơn và tính cước vận chuyển tự động thời gian thực.\\n- Sử dụng Elasticsearch để tìm kiếm đơn hàng tốc độ cao trên hàng chục triệu bản ghi.\\n- Đảm bảo hệ thống vận hành liên tục 24/7 không gián đoạn.",
                "- Tối thiểu 2-3 năm kinh nghiệm với Java và Spring Boot.\\n- Kinh nghiệm tối ưu hóa cơ sở dữ liệu MySQL và tìm kiếm với Elasticsearch.\\n- Sử dụng thành thạo Linux commands và tự tin thao tác máy chủ.\\n- Sẵn sàng đối mặt với bài toán dữ liệu lớn và áp lực tiến độ giao nhận."
        ));
        list.add(new JobSeedItem(
                "line",
                "Java & Kotlin Backend Developer",
                "Java, Kotlin, Spring Boot, Armeria, gRPC, Redis, MySQL, Docker",
                28,
                42,
                "Middle",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Phát triển các tính năng backend cho nền tảng LINE Messaging và OpenChat toàn cầu.\\n- Áp dụng Kotlin và framework bất đồng bộ Armeria/gRPC để đạt hiệu năng xử lý cao nhất.\\n- Thiết kế cơ chế caching đa tầng và xử lý sự kiện bất đồng bộ qua Kafka.\\n- Làm việc trực tiếp với các chuyên gia kỹ thuật tại Nhật Bản, Hàn Quốc và Đài Loan.",
                "- Từ 3 năm kinh nghiệm với Java hoặc Kotlin trên nền tảng backend.\\n- Kinh nghiệm với gRPC, Protocol Buffers và kiến trúc bất đồng bộ (Reactive / Coroutines).\\n- Tư duy code sạch (Clean Code), viết Unit Test đầy đủ và tuân thủ chuẩn quốc tế.\\n- Tiếng Anh giao tiếp tự tin trong môi trường làm việc nước ngoài."
        ));
        list.add(new JobSeedItem(
                "kms",
                "Java Enterprise Developer",
                "Java, Spring Framework, Hibernate, MSSQL, Azure, Microservices, CI/CD",
                35,
                50,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Phát triển giải pháp SaaS cho các tập đoàn chăm sóc sức khỏe và công nghệ tại thị trường Mỹ.\\n- Thiết kế các module nghiệp vụ phức tạp tuân thủ tiêu chuẩn an toàn bảo mật HIPAA.\\n- Xây dựng và duy trì hệ thống CI/CD trên nền tảng Microsoft Azure DevOps.\\n- Trực tiếp trao đổi yêu cầu với Product Owner và các bên liên quan từ Hoa Kỳ.",
                "- Tối thiểu 4 năm kinh nghiệm lập trình Java Enterprise (Java EE / Spring Boot).\\n- Thành thạo SQL Server hoặc PostgreSQL, viết stored procedures và tối ưu query.\\n- Kinh nghiệm làm việc với điện toán đám mây Microsoft Azure.\\n- Tiếng Anh lưu loát, tự tin thuyết trình và bảo vệ giải pháp kỹ thuật."
        ));
        list.add(new JobSeedItem(
                "momo",
                "Senior Frontend ReactJS Developer",
                "React, TypeScript, Redux Toolkit, TailwindCSS, Webpack, Web Performance, Next.js",
                35,
                50,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Phát triển các tính năng web portal và mini-app phục vụ hàng triệu người dùng MoMo.\\n- Tối ưu hóa Core Web Vitals (FCP, LCP, CLS) đảm bảo trải nghiệm siêu mượt trên trình duyệt di động.\\n- Xây dựng và mở rộng Design System chung cho các sản phẩm web của tập đoàn.\\n- Mentor và hướng dẫn các bạn Junior/Middle trong nhóm về kỹ năng React nâng cao.",
                "- Tối thiểu 4 năm kinh nghiệm chuyên sâu với React, TypeScript và quản lý state hiện đại.\\n- Hiểu biết sâu sắc về cơ chế Rendering của Browser, Virtual DOM và Bundle Optimization.\\n- Sử dụng thành thạo TailwindCSS, CSS Module và animation hiệu năng cao.\\n- Có kinh nghiệm phát triển Webview tích hợp ứng dụng native là lợi thế lớn."
        ));
        list.add(new JobSeedItem(
                "techasia",
                "Frontend Developer (React / Next.js)",
                "React, Next.js, TypeScript, TailwindCSS, RESTful API, Responsive Design",
                20,
                32,
                "Middle",
                "Hà Nội",
                "Toàn thời gian",
                3,
                "- Lập trình giao diện người dùng ứng dụng thương mại điện tử bằng Next.js 14 (App Router).\\n- Tối ưu hóa Server-Side Rendering (SSR) và Static Site Generation (SSG) phục vụ SEO.\\n- Tích hợp RESTful API với Backend và xử lý các trạng thái tải dữ liệu phức tạp.\\n- Đảm bảo giao diện chuẩn Responsive hiển thị hoàn hảo trên mọi kích thước màn hình.",
                "- Từ 2 năm kinh nghiệm làm việc với ReactJS và ít nhất 1 năm với Next.js.\\n- Thành thạo TypeScript, React Hooks, Context API và các thư viện giao diện hiện đại.\\n- Kỹ năng chuyển đổi từ bản vẽ Figma sang mã nguồn HTML/CSS chuẩn pixel-perfect.\\n- Tinh thần trách nhiệm cao và kỹ năng làm việc nhóm tốt."
        ));
        list.add(new JobSeedItem(
                "tiki",
                "Fullstack Developer (Node.js & React)",
                "Node.js, React, TypeScript, Express, MongoDB, Redis, Docker, GraphQL",
                32,
                48,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Phát triển toàn diện từ giao diện người dùng React đến hệ thống Backend Node.js cho kênh Người Bán.\\n- Thiết kế kiến trúc API GraphQL và RESTful phục vụ hiển thị dữ liệu linh hoạt.\\n- Xử lý caching tốc độ cao với Redis và quản lý cơ sở dữ liệu MongoDB/PostgreSQL.\\n- Tham gia giám sát hiệu năng dịch vụ và bảo trì hệ thống định kỳ.",
                "- Tối thiểu 3-4 năm kinh nghiệm làm Fullstack với React và Node.js (TypeScript).\\n- Hiểu biết vững vàng về NoSQL (MongoDB) và SQL (PostgreSQL/MySQL).\\n- Kinh nghiệm với GraphQL, Apollo Client/Server và WebSocket thời gian thực.\\n- Tư duy làm sản phẩm (Product Mindset), luôn đặt trải nghiệm người dùng làm trung tâm."
        ));
        list.add(new JobSeedItem(
                "axon",
                "Frontend Vue.js Engineer",
                "Vue.js, Nuxt.js, TypeScript, Pinia, TailwindCSS, HTML5/CSS3",
                22,
                34,
                "Middle",
                "Đà Nẵng",
                "Toàn thời gian",
                2,
                "- Phát triển giao diện phần mềm quản trị doanh nghiệp sử dụng Vue 3 (Composition API) và Nuxt 3.\\n- Quản lý trạng thái ứng dụng bằng Pinia và viết các reusable components tái sử dụng cao.\\n- Áp dụng phương pháp Scrum bài bản, tham gia Sprint Planning và Retrospective.\\n- Tương tác trực tiếp với khách hàng Thụy Sĩ để thống nhất luồng giao diện người dùng.",
                "- Từ 2 năm kinh nghiệm thực tế với Vue.js (Vue 3, Script Setup, Composition API).\\n- Thành thạo TypeScript, HTML5, CSS3/SCSS và các framework CSS (TailwindCSS/Element Plus).\\n- Hiểu biết về quy trình kiểm thử tự động với Vitest hoặc Cypress.\\n- Tiếng Anh giao tiếp tốt trong công việc hàng ngày."
        ));
        list.add(new JobSeedItem(
                "nashtech",
                "Fullstack Web Developer (Java & React)",
                "Java, Spring Boot, React, TypeScript, PostgreSQL, Docker, AWS",
                35,
                55,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Phát triển giải pháp phần mềm toàn diện cho đối tác quốc tế thuộc khối Tài chính - Bảo hiểm.\\n- Xây dựng các module Backend bằng Java Spring Boot và giao diện hiện đại bằng React TypeScript.\\n- Đóng gói triển khai ứng dụng lên AWS sử dụng Docker và ECS Fargate.\\n- Thực hiện code review chéo và đảm bảo tiêu chuẩn chất lượng nghiêm ngặt.",
                "- Tối thiểu 4 năm kinh nghiệm lập trình Fullstack với Java/Spring Boot và ReactJS.\\n- Nắm vững kiến trúc phần mềm n-tier, Microservices và RESTful API Design.\\n- Có kinh nghiệm làm việc với CSDL quan hệ PostgreSQL và ORM Hibernate.\\n- Kỹ năng giao tiếp tiếng Anh lưu loát là yêu cầu bắt buộc."
        ));
        list.add(new JobSeedItem(
                "newstartup",
                "Junior Frontend Developer (React)",
                "React, JavaScript, HTML5/CSS3, TailwindCSS, Git, Responsive Design",
                12,
                18,
                "Junior",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Xây dựng các trang đích (Landing Page) và giao diện sản phẩm SaaS mới của công ty.\\n- Triển khai giao diện theo thiết kế Figma đảm bảo chuẩn SEO và tốc độ tải trang nhanh.\\n- Sửa lỗi hiển thị và nâng cao tính tương tác giao diện người dùng.\\n- Phối hợp với team marketing để triển khai A/B Testing giao diện.",
                "- Từ 1 năm kinh nghiệm làm việc với ReactJS, JavaScript (ES6+).\\n- Cắt giao diện chuẩn từ Figma sang HTML/CSS/TailwindCSS.\\n- Có tư duy thẩm mỹ giao diện tốt, cẩn thận và tỉ mỉ trong từng chi tiết.\\n- Tinh thần năng động, yêu thích môi trường startup khởi nghiệp."
        ));
        list.add(new JobSeedItem(
                "onemount",
                "Lead Frontend Engineer",
                "React, TypeScript, Micro-Frontend, Webpack, Vite, Next.js, Architecture",
                50,
                75,
                "Lead",
                "Hà Nội",
                "Toàn thời gian",
                1,
                "- Định hình kiến trúc Micro-Frontend cho siêu ứng dụng web phục vụ hàng triệu người tiêu dùng.\\n- Tối ưu hóa Build Tooling (Vite, Webpack Module Federation) giảm thiểu 50% thời gian đóng gói.\\n- Xây dựng các tiêu chuẩn bảo mật Frontend (XSS, CSRF, CSP) và tối ưu hóa bộ nhớ trình duyệt.\\n- Lãnh đạo và định hướng phát triển chuyên môn cho hơn 15 kỹ sư Frontend.",
                "- Tối thiểu 6 năm kinh nghiệm phát triển Frontend và ít nhất 2 năm ở vị trí Lead.\\n- Am hiểu sâu sắc về kiến trúc Micro-Frontend, Web Components và State Management quy mô lớn.\\n- Khả năng tuning hiệu năng web phức tạp và xử lý memory leak trong Single Page App.\\n- Khả năng lãnh đạo, truyền cảm hứng và định hướng công nghệ xuất sắc."
        ));
        list.add(new JobSeedItem(
                "vnpt",
                "Frontend Web Developer (Angular)",
                "Angular, TypeScript, RxJS, NgRx, SCSS, RESTful API",
                20,
                30,
                "Middle",
                "Hà Nội",
                "Toàn thời gian",
                3,
                "- Phát triển các cổng dịch vụ công trực tuyến và hệ sinh thái chính phủ điện tử cấp tỉnh/thành.\\n- Xây dựng các form nhập liệu phức tạp với Angular Reactive Forms và xác thực dữ liệu đa tầng.\\n- Quản lý luồng dữ liệu bất đồng bộ với RxJS Operators và NgRx Store.\\n- Đảm bảo giao diện tuân thủ các tiêu chuẩn trợ năng (Accessibility - WCAG 2.1).",
                "- Từ 2-3 năm kinh nghiệm lập trình chuyên sâu với Angular (Angular 14+) và TypeScript.\\n- Nắm vững tư duy lập trình phản ứng (Reactive Programming) với thư viện RxJS.\\n- Sử dụng thành thạo SCSS, Bootstrap hoặc Angular Material.\\n- Trách nhiệm cao, cẩn trọng trong công việc với các dự án nhà nước."
        ));
        list.add(new JobSeedItem(
                "shopee",
                "Senior Next.js & React Developer",
                "Next.js, React, TypeScript, SSR, SEO, TailwindCSS, GraphQL",
                38,
                60,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Phát triển trang chủ và các trang chi tiết sản phẩm TMĐT với hàng chục triệu lượt truy cập mỗi ngày.\\n- Tối ưu SEO On-page và tốc độ hiển thị hình ảnh / video sản phẩm trên Next.js.\\n- Xây dựng các tính năng tương tác Livestream và săn deal chớp nhoáng thời gian thực.\\n- Thiết lập hệ thống giám sát lỗi người dùng phía Client với Sentry.",
                "- Tối thiểu 4 năm kinh nghiệm làm việc với React và Next.js chuyên sâu.\\n- Có kinh nghiệm dày dặn về kỹ thuật tối ưu hóa SEO và Web Performance trên các nền tảng TMĐT.\\n- Kỹ năng giải quyết bài toán concurrency và caching phía Client xuất sắc.\\n- Tiếng Anh giao tiếp tốt trong môi trường quốc tế năng động."
        ));
        list.add(new JobSeedItem(
                "zalopay",
                "Web UI/UX Developer (Design Systems)",
                "React, TypeScript, Design Systems, Storybook, Figma, CSS-in-JS, Accessibility",
                22,
                35,
                "Middle",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Xây dựng và duy trì thư viện thành phần dùng chung (Design System Component Library) của ZaloPay.\\n- Viết tài liệu hướng dẫn và demo tương tác trên Storybook cho toàn bộ các nhóm kỹ sư.\\n- Hợp tác chặt chẽ với các nhà thiết kế UI/UX để chuẩn hóa token màu sắc, typography và spacing.\\n- Đảm bảo chất lượng các component qua Visual Regression Testing và Unit Testing.",
                "- Từ 2 năm kinh nghiệm lập trình React với niềm đam mê sâu sắc về UI/UX và Design System.\\n- Sử dụng thành thạo Storybook, Figma Tokens và các giải pháp CSS-in-JS (Tailwind, Emotion, Styled).\\n- Hiểu biết về Web Accessibility (a11y) và các tiêu chuẩn tương tác bàn phím.\\n- Tinh thần cầu toàn, chỉn chu về trải nghiệm thị giác của người dùng."
        ));
        list.add(new JobSeedItem(
                "topstech",
                "Fullstack JavaScript Developer (MERN Stack)",
                "MongoDB, Express.js, React, Node.js, JavaScript, TailwindCSS, Git",
                15,
                24,
                "Junior",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Phát triển bảng điều khiển Dashboard hiển thị dữ liệu phân tích video camera AI thời gian thực.\\n- Xây dựng RESTful API với Express.js và lưu trữ cấu hình thiết bị trên MongoDB.\\n- Thiết kế giao diện quản trị thiết bị biên trực quan, dễ thao tác cho người vận hành.\\n- Hỗ trợ kiểm thử và triển khai ứng dụng tại hiện trường.",
                "- Từ 1-2 năm kinh nghiệm với bộ công nghệ MERN (MongoDB, Express, React, Node.js).\\n- Nắm vững JavaScript hiện đại (ES6+) và làm việc tốt với RESTful API / WebSocket.\\n- Tinh thần trách nhiệm, sẵn sàng học hỏi công nghệ liên quan đến IoT và AI.\\n- Kỹ năng giao tiếp và làm việc nhóm tốt."
        ));
        list.add(new JobSeedItem(
                "grab",
                "Frontend Developer (Mobile-First Web)",
                "React, TypeScript, PWA, Web Performance, Redux, Jest, Cypress",
                40,
                65,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Xây dựng nền tảng GrabWeb và GrabFood Web phục vụ hàng triệu người dùng tại Đông Nam Á.\\n- Triển khai kiến trúc PWA (Progressive Web App) hỗ trợ hoạt động mượt mà khi mạng yếu.\\n- Áp dụng quy trình kiểm thử tự động toàn diện với Jest, React Testing Library và Cypress E2E.\\n- Đóng góp vào các sáng kiến kỹ thuật chung của trung tâm R&D Grab toàn cầu.",
                "- Tối thiểu 4 năm kinh nghiệm lập trình Frontend với React và TypeScript quy mô lớn.\\n- Kinh nghiệm thực tế trong việc tối ưu hóa ứng dụng web trên môi trường mobile webview.\\n- Thành thạo các chiến lược tự động hóa kiểm thử (Unit, Integration, E2E Testing).\\n- Khả năng giao tiếp tiếng Anh trôi chảy trong môi trường làm việc đa văn hóa."
        ));
        list.add(new JobSeedItem(
                "cmc",
                "Junior Web Developer (Vue.js / Nuxt)",
                "Vue.js, JavaScript, HTML5/CSS3, Bootstrap, RESTful API, Git",
                13,
                20,
                "Junior",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Tham gia xây dựng các cổng thông tin và trang dịch vụ hạ tầng điện toán đám mây CMC Cloud.\\n- Phát triển các màn hình theo dõi tài nguyên máy chủ ảo và thanh toán cước hàng tháng.\\n- Sửa lỗi giao diện và cập nhật tính năng mới theo phản hồi từ khách hàng doanh nghiệp.\\n- Làm việc dưới sự hướng dẫn của Senior Developer trong dự án.",
                "- Tối thiểu 1 năm kinh nghiệm làm việc với Vue.js (Vue 2 hoặc Vue 3).\\n- Thành thạo HTML5, CSS3, JavaScript và các thư viện giao diện như Bootstrap hoặc Ant Design.\\n- Có kinh nghiệm tích hợp API và làm việc với Git phiên bản.\\n- Nhiệt tình, có trách nhiệm và mong muốn phát triển lâu dài."
        ));
        list.add(new JobSeedItem(
                "line",
                "Senior Fullstack Developer (Python & React)",
                "Python, FastAPI, React, TypeScript, PostgreSQL, Docker, Redis",
                36,
                55,
                "Senior",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Phát triển hệ thống nền tảng phân tích hành vi người dùng và chiến dịch nội dung của LINE.\\n- Xây dựng Backend tốc độ cao với Python FastAPI và cơ sở dữ liệu quan hệ PostgreSQL.\\n- Phát triển giao diện Dashboard trực quan hóa dữ liệu biểu đồ với React và D3.js/ECharts.\\n- Đảm bảo an toàn bảo mật dữ liệu cá nhân theo các đạo luật bảo mật thông tin quốc tế.",
                "- Tối thiểu 4 năm kinh nghiệm Fullstack với Python (FastAPI/Django) và React TypeScript.\\n- Kinh nghiệm thiết kế cơ sở dữ liệu và xử lý truy vấn phân tích dữ liệu phức tạp.\\n- Hiểu biết sâu sắc về containerization Docker và triển khai CI/CD.\\n- Tiếng Anh giao tiếp tốt phục vụ trao đổi kỹ thuật xuyên quốc gia."
        ));
        list.add(new JobSeedItem(
                "fpt",
                "Fresher Frontend Developer (ReactJS)",
                "React, JavaScript, HTML5, CSS3, Git, REST API",
                9,
                14,
                "Fresher",
                "TP.HCM",
                "Toàn thời gian",
                5,
                "- Tham gia chương trình đào tạo Fresher Academy 2 tháng chuyên sâu về ReactJS hiện đại.\\n- Trực tiếp tham gia vào các dự án gia công phần mềm cho khách hàng Singapore, Nhật Bản và Mỹ.\\n- Cắt giao diện web, ghép API và kiểm thử các tính năng giao diện người dùng.\\n- Nhận mức lương cạnh tranh và cơ hội trở thành nhân viên chính thức ngay sau khóa đào tạo.",
                "- Tốt nghiệp Cao đẳng/Đại học chuyên ngành Công nghệ thông tin hoặc các ngành kỹ thuật liên quan.\\n- Đã học và làm đồ án thực tế với ReactJS, JavaScript (ES6), HTML5/CSS3.\\n- Nhanh nhẹn, có tư duy logic tốt và đam mê lập trình giao diện người dùng.\\n- Trình độ tiếng Anh đọc hiểu tài liệu chuyên ngành khá."
        ));
        list.add(new JobSeedItem(
                "vng",
                "Senior Machine Learning Engineer",
                "Python, PyTorch, Machine Learning, Deep Learning, MLOps, Docker, Kubernetes, NLP",
                45,
                75,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Nghiên cứu, huấn luyện và triển khai các mô hình Machine Learning/Deep Learning phục vụ hệ sinh thái Zalo.\\n- Xây dựng pipeline tự động hóa huấn luyện mô hình (MLOps) từ dữ liệu thô đến production API.\\n- Tối ưu hóa mô hình AI để phục vụ hàng chục ngàn dự đoán/giây với độ trễ dưới 20ms.\\n- Đọc hiểu các bài báo khoa học hàng đầu (NeurIPS, ICML, CVPR) và áp dụng cải tiến vào sản phẩm.",
                "- Tối thiểu 4 năm kinh nghiệm làm việc với Machine Learning và Deep Learning bằng PyTorch/TensorFlow.\\n- Nắm vững lý thuyết toán học xác suất thống kê, đại số tuyến tính và tối ưu hóa giải thuật.\\n- Kinh nghiệm thực chiến triển khai mô hình lên môi trường production sử dụng Triton/TorchServe.\\n- Ưu tiên ứng viên có bằng Thạc sĩ/Tiến sĩ hoặc có bài báo công bố quốc tế."
        ));
        list.add(new JobSeedItem(
                "momo",
                "AI Engineer (Computer Vision & OCR)",
                "Python, OpenCV, PyTorch, Computer Vision, OCR, TensorRT, Docker, FastAPI",
                40,
                68,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Phát triển giải pháp eKYC định danh khách hàng điện tử tự động (nhận diện CCCD, xác thực khuôn mặt liveness).\\n- Tối ưu hóa các mô hình thị giác máy tính Computer Vision chạy trên GPU server với TensorRT.\\n- Xây dựng các API xử lý ảnh tốc độ cao với FastAPI và Docker container.\\n- Thử nghiệm các kiến trúc mạng nơ-ron mới như Vision Transformers (ViT) và YOLOv8.",
                "- Tối thiểu 3 năm kinh nghiệm trong lĩnh vực Computer Vision và OCR (nhận dạng ký tự quang học).\\n- Thành thạo Python, PyTorch, OpenCV và các công cụ tối ưu mô hình (ONNX, TensorRT).\\n- Có kinh nghiệm xử lý ảnh tài liệu tiếng Việt và phòng chống giả mạo khuôn mặt (Face Anti-Spoofing).\\n- Tư duy giải quyết vấn đề sáng tạo và chịu được áp lực độ chính xác cao trong Fintech."
        ));
        list.add(new JobSeedItem(
                "viettel",
                "NLP / Large Language Model (LLM) Specialist",
                "Python, NLP, LLM, LangChain, Transformers, HuggingFace, Vector DB, RAG",
                50,
                80,
                "Senior",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Nghiên cứu và huấn luyện mô hình ngôn ngữ lớn (LLM) tiếng Việt phục vụ trợ lý ảo quốc gia.\\n- Xây dựng kiến trúc RAG (Retrieval-Augmented Generation) kết hợp Vector Database (Milvus/Pinecone).\\n- Fine-tune các mô hình nguồn mở (Llama, Mistral, Qwen) cho các bài toán phân loại và tóm tắt văn bản pháp luật.\\n- Đánh giá chất lượng mô hình qua các bộ benchmark tiêu chuẩn quốc tế.",
                "- Tối thiểu 4 năm kinh nghiệm chuyên sâu về Xử lý ngôn ngữ tự nhiên (NLP) và Transformers.\\n- Thành thạo thư viện Hugging Face, LangChain/LlamaIndex và kỹ thuật Prompt Engineering.\\n- Kinh nghiệm Fine-tuning mô hình ngôn ngữ lớn (LoRA, QLoRA) trên cụm GPU phân tán.\\n- Khả năng nghiên cứu độc lập và xuất bản báo cáo khoa học chất lượng cao."
        ));
        list.add(new JobSeedItem(
                "tiki",
                "Data Scientist (Customer Analytics & Recommendation)",
                "Python, Scikit-Learn, Pandas, SQL, Recommendation Systems, A/B Testing, Spark",
                28,
                45,
                "Middle",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Xây dựng các mô hình gợi ý sản phẩm cá nhân hóa (Collaborative Filtering, Deep Retrieval) trên Tiki.\\n- Phân tích phân khúc khách hàng, dự đoán tỷ lệ rời bỏ (Churn Prediction) và tính toán vòng đời khách hàng (LTV).\\n- Thiết kế và theo dõi các thử nghiệm A/B Testing để đo lường mức độ tăng trưởng doanh số (GMV).\\n- Phối hợp với đội ngũ Product để biến kết quả mô hình AI thành tính năng thực tế.",
                "- Từ 2-3 năm kinh nghiệm ở vai trò Data Scientist trong các ngành TMĐT, Bán lẻ hoặc Fintech.\\n- Thành thạo Python (Pandas, Scikit-Learn), SQL và các thuật toán gợi ý phổ biến.\\n- Hiểu biết sâu sắc về kiểm định thống kê giả thuyết và thiết kế thực nghiệm A/B Testing.\\n- Kỹ năng trình bày (Storytelling with data) thuyết phục các cấp quản lý."
        ));
        list.add(new JobSeedItem(
                "shopee",
                "Machine Learning Engineer (Recommendation Systems)",
                "Python, Recommendation Systems, Collaborative Filtering, Deep Learning, Spark, Redis, C++",
                50,
                85,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Chịu trách nhiệm thiết kế hệ thống gợi ý hàng đầu Đông Nam Á xử lý hàng trăm triệu sản phẩm.\\n- Cải tiến các thuật toán Ranking đa mục tiêu (Multi-Task Learning: CTR, CVR, Cart Add, Follow).\\n- Tối ưu hóa tính toán ma trận thưa và suy luận mô hình thời gian thực với C++ và GPU clusters.\\n- Tham gia giải quyết bài toán Cold Start cho các nhà bán hàng và sản phẩm mới lên sàn.",
                "- Tối thiểu 4-5 năm kinh nghiệm về Recommender Systems hoặc Search Ranking tại các tập đoàn công nghệ lớn.\\n- Thành thạo Deep Learning for Recommendation (Two-Tower, DLRM, DIN, BST).\\n- Kỹ năng lập trình tối ưu bằng C++ hoặc Python và am hiểu xử lý dữ liệu lớn với Spark.\\n- Tinh thần giải quyết bài toán khó và tư duy định lượng mạnh mẽ."
        ));
        list.add(new JobSeedItem(
                "topstech",
                "AI Research Scientist",
                "Python, Deep Learning, PyTorch, Edge AI, Model Optimization, ONNX, C++",
                45,
                70,
                "Senior",
                "Hà Nội",
                "Toàn thời gian",
                1,
                "- Nghiên cứu các giải pháp AI chạy trên thiết bị biên (Edge AI) với tài nguyên phần cứng giới hạn.\\n- Áp dụng các kỹ thuật nén mô hình: Quantization (INT8/FP4), Pruning và Knowledge Distillation.\\n- Triển khai mô hình lên các dòng chip chuyên dụng: NVIDIA Jetson, Coral TPU và Ambarella.\\n- Đăng ký các bằng sáng chế và bảo hộ giải pháp công nghệ độc quyền của công ty.",
                "- Trình độ Thạc sĩ hoặc Tiến sĩ ngành Khoa học máy tính, Toán tin hoặc Trí tuệ nhân tạo.\\n- Nắm vững lý thuyết Deep Learning và có công trình nghiên cứu được ứng dụng thực tế.\\n- Thành thạo kỹ thuật nén mô hình AI và chuyển đổi định dạng ONNX/TensorRT.\\n- Đam mê sáng tạo công nghệ tiên phong và khả năng tư duy đột phá."
        ));
        list.add(new JobSeedItem(
                "techasia",
                "Junior Python AI / Data Engineer",
                "Python, Pandas, NumPy, Scikit-Learn, SQL, Flask, Git, Data Cleaning",
                16,
                25,
                "Junior",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Thu thập, làm sạch và gán nhãn dữ liệu chuẩn bị cho các bài toán phân tích kinh doanh.\\n- Xây dựng các mô hình học máy cơ bản (Regression, Decision Trees, K-Means) hỗ trợ ra quyết định.\\n- Đóng gói mô hình thành dịch vụ web API đơn giản với Flask hoặc FastAPI.\\n- Viết các script tự động hóa thu thập dữ liệu định kỳ từ các nguồn công khai.",
                "- Từ 1 năm kinh nghiệm làm việc với ngôn ngữ Python và các thư viện phân tích dữ liệu cơ bản.\\n- Viết truy vấn SQL thành thạo, hiểu biết về cấu trúc cơ sở dữ liệu quan hệ.\\n- Nắm vững các bước cơ bản trong quy trình khoa học dữ liệu (Data Science Lifecycle).\\n- Tinh thần chủ động, chăm chỉ và mong muốn học hỏi chuyên sâu về AI."
        ));
        list.add(new JobSeedItem(
                "onemount",
                "MLOps Engineer (Machine Learning Operations)",
                "MLOps, Python, MLflow, Kubeflow, Docker, Kubernetes, AWS, CI/CD",
                32,
                50,
                "Middle",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Xây dựng và quản trị nền tảng MLOps tập trung phục vụ toàn bộ các Data Scientists tại tập đoàn.\\n- Thiết lập hệ thống quản lý phiên bản mô hình và theo dõi thí nghiệm với MLflow.\\n- Triển khai các pipeline tự động hóa huấn luyện và đánh giá mô hình định kỳ trên Kubeflow/Airflow.\\n- Giám sát độ suy giảm hiệu năng mô hình (Model Drift) và phân phối dữ liệu (Data Drift) trong sản xuất.",
                "- Từ 2-3 năm kinh nghiệm ở vị trí MLOps hoặc DevOps chuyên biệt cho mảng Data/AI.\\n- Thành thạo Kubernetes, Docker và các công cụ MLOps (MLflow, Kubeflow, Feast Feature Store).\\n- Lập trình Python vững vàng và hiểu rõ vòng đời phát triển mô hình Machine Learning.\\n- Kỹ năng tự động hóa CI/CD cho các dự án trí tuệ nhân tạo."
        ));
        list.add(new JobSeedItem(
                "zalopay",
                "Data Scientist (Fraud Detection & Risk Management)",
                "Python, Machine Learning, XGBoost, Anomaly Detection, SQL, Spark, Risk Modeling",
                42,
                65,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Xây dựng mô hình AI phát hiện giao dịch gian lận, rửa tiền và lạm dụng tài khoản thời gian thực.\\n- Áp dụng các thuật toán học máy giám sát và không giám sát (XGBoost, Isolation Forest, Graph Neural Networks).\\n- Tối ưu hóa sự cân bằng giữa tỷ lệ phát hiện gian lận và tỷ lệ từ chối nhầm người dùng hợp lệ (False Positive).\\n- Hợp tác với đội ngũ Quản trị rủi ro để cập nhật các kịch bản tấn công gian lận mới.",
                "- Tối thiểu 3-4 năm kinh nghiệm làm Data Science trong lĩnh vực Quản trị rủi ro hoặc Ngân hàng điện tử.\\n- Thành thạo các thuật toán phát hiện bất thường (Anomaly Detection) trên dữ liệu chuỗi thời gian.\\n- Kinh nghiệm xử lý bài toán dữ liệu mất cân bằng cực hạn (Extreme Imbalanced Data).\\n- Tư duy phân tích logic nhạy bén và bảo mật thông tin tuyệt đối."
        ));
        list.add(new JobSeedItem(
                "fpt",
                "Generative AI & Chatbot Developer",
                "Python, OpenAI API, LangChain, RAG, Prompt Engineering, Vector DB, FastAPI",
                25,
                40,
                "Middle",
                "Hà Nội",
                "Toàn thời gian",
                3,
                "- Xây dựng các ứng dụng GenAI và Chatbot thông minh phục vụ chăm sóc khách hàng tự động.\\n- Thiết kế các Prompt phức tạp và xây dựng luồng hội thoại đa bước sử dụng LangChain và LangGraph.\\n- Tích hợp dữ liệu doanh nghiệp thông qua kỹ thuật RAG với ChromaDB và FAISS.\\n- Đo lường độ chính xác câu trả lời và hạn chế hiện tượng ảo giác (Hallucination) của AI.",
                "- Từ 2 năm kinh nghiệm lập trình Python và tối thiểu 1 năm làm việc thực tế với Generative AI / LLM.\\n- Thành thạo việc tích hợp OpenAI API, Anthropic Claude hoặc các mô hình mã nguồn mở.\\n- Hiểu biết sâu sắc về RAG, Vector Search và quản lý ngữ cảnh cuộc trò chuyện.\\n- Đam mê cập nhật các xu hướng công nghệ trí tuệ nhân tạo tạo sinh mới nhất."
        ));
        list.add(new JobSeedItem(
                "kms",
                "Python Backend & Data Scraping Engineer",
                "Python, FastAPI, BeautifulSoup, Scrapy, PostgreSQL, Redis, Celery",
                22,
                35,
                "Middle",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Phát triển hệ thống thu thập dữ liệu thị trường tự động quy mô lớn với Scrapy và Selenium/Playwright.\\n- Xây dựng các pipeline bóc tách, làm sạch và chuẩn hóa dữ liệu lưu vào PostgreSQL.\\n- Quản lý hàng đợi tác vụ thu thập bất đồng bộ sử dụng Celery và Redis.\\n- Vượt qua các rào cản chống bot (Anti-scraping, Cloudflare, CAPTCHA) một cách hợp pháp.",
                "- Từ 2-3 năm kinh nghiệm lập trình Python chuyên sâu về Web Scraping và Backend API.\\n- Thành thạo framework Scrapy, kiến trúc xử lý bất đồng bộ và quản lý Proxy xoay vòng.\\n- Kinh nghiệm làm việc với cơ sở dữ liệu quan hệ PostgreSQL và tối ưu lưu trữ text.\\n- Kỹ năng giải quyết sự cố linh hoạt và tư duy lập trình bền vững."
        ));
        list.add(new JobSeedItem(
                "vnpt",
                "Fresher AI / Data Science",
                "Python, Machine Learning, SQL, Pandas, NumPy, Data Visualization",
                10,
                15,
                "Fresher",
                "Hà Nội",
                "Toàn thời gian",
                3,
                "- Tham gia dự án nghiên cứu và phát triển giải pháp nhận dạng biển số xe và giao thông thông minh.\\n- Thực hiện gán nhãn dữ liệu hình ảnh/văn bản và tiền xử lý dữ liệu cho nhóm nghiên cứu.\\n- Hỗ trợ kiểm thử độ chính xác của các mô hình học máy trong môi trường thực tế.\\n- Được đào tạo bài bản từ các chuyên gia AI đầu ngành của Tập đoàn VNPT.",
                "- Tốt nghiệp Đại học chuyên ngành Toán tin, Khoa học dữ liệu, Trí tuệ nhân tạo hoặc CNTT.\\n- Thành thạo lập trình Python và có nền tảng Toán giải tích, Xác suất thống kê tốt.\\n- Từng hoàn thành các dự án cá nhân hoặc khóa học online về Machine Learning.\\n- Ham học hỏi, kiên nhẫn và có định hướng phát triển sự nghiệp trong ngành AI."
        ));
        list.add(new JobSeedItem(
                "vng",
                "Senior Big Data Engineer (Spark / Kafka)",
                "Data Engineering, Spark, Kafka, Hadoop, Scala, Python, Hive, Delta Lake",
                40,
                65,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Thiết kế và tối ưu hệ thống xử lý dữ liệu lớn (Batch & Streaming) xử lý trên 10 Terabyte/ngày.\\n- Xây dựng các pipeline dữ liệu phân tán bằng Apache Spark, Scala và Apache Kafka.\\n- Quản trị kiến trúc Data Lakehouse với Apache Iceberg/Delta Lake và lưu trữ S3.\\n- Giám sát và tối ưu hóa tài nguyên phần cứng cụm Hadoop/YARN/Kubernetes.",
                "- Tối thiểu 4 năm kinh nghiệm làm việc với hệ sinh thái Big Data (Hadoop, Spark, Kafka, Hive).\\n- Thành thạo lập trình phân tán với Scala hoặc Python.\\n- Hiểu sâu sắc về tối ưu hóa tính toán bộ nhớ, Data Partitioning và Skew Data trong Spark.\\n- Khả năng làm việc độc lập và tư duy giải quyết vấn đề quy mô lớn."
        ));
        list.add(new JobSeedItem(
                "onemount",
                "Data Engineer (Airflow & Snowflake)",
                "Data Engineering, Airflow, Snowflake, SQL, Python, ETL, dbt",
                28,
                45,
                "Middle",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Phát triển các luồng trích xuất, biến đổi và nạp dữ liệu (ETL/ELT) sử dụng Apache Airflow và dbt.\\n- Thiết kế kiến trúc kho dữ liệu Cloud hiện đại trên nền tảng Snowflake.\\n- Đảm bảo tính toàn vẹn, bảo mật và chính xác của dữ liệu phục vụ báo cáo quản trị cấp cao.\\n- Hợp tác với Data Analysts để xây dựng các Data Mart theo mô hình Star/Snowflake Schema.",
                "- Từ 2-3 năm kinh nghiệm trong vai trò Data Engineer.\\n- Viết SQL nâng cao thành thạo, có kiến thức sâu về Data Modeling và Data Warehouse.\\n- Kinh nghiệm thực tế với Apache Airflow, dbt và các Cloud Data Warehouse (Snowflake, BigQuery).\\n- Kỹ năng làm việc nhóm và giao tiếp kỹ thuật tốt."
        ));
        list.add(new JobSeedItem(
                "viettel",
                "Big Data Architect",
                "Big Data, Spark, Kafka, Data Lakehouse, Hadoop, Architecture, Cloud Data, Scala",
                60,
                90,
                "Lead",
                "Hà Nội",
                "Toàn thời gian",
                1,
                "- Lãnh đạo thiết kế kiến trúc nền tảng dữ liệu lớn cấp tập đoàn phục vụ hàng chục triệu thuê bao.\\n- Định hình chiến lược chuyển dịch dữ liệu từ On-premise lên nền tảng Multi-Cloud an toàn.\\n- Chuẩn hóa quy trình Quản trị dữ liệu (Data Governance), Danh mục dữ liệu (Data Catalog) và Data Lineage.\\n- Cố vấn công nghệ cho ban giám đốc và đào tạo thế hệ kỹ sư dữ liệu nòng cốt.",
                "- Tối thiểu 7 năm kinh nghiệm với Big Data và ít nhất 2 năm ở vai trò Data/Solution Architect.\\n- Hiểu biết toàn diện về các giải pháp Data Lakehouse, Real-time Stream Processing và MPP Databases.\\n- Kinh nghiệm thiết kế hệ thống chịu lỗi cao và an toàn thông tin cấp độ quốc gia.\\n- Năng lực lãnh đạo và tư duy chiến lược xuất sắc."
        ));
        list.add(new JobSeedItem(
                "tiki",
                "Data Platform Engineer (GCP / BigQuery)",
                "Google Cloud, BigQuery, Airflow, Python, SQL, Looker, Data Modeling",
                26,
                40,
                "Middle",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Quản trị và tối ưu hóa hạ tầng dữ liệu trên Google Cloud Platform (GCP).\\n- Viết các pipeline nạp dữ liệu liên tục từ MySQL vào Google BigQuery qua CDC (Debezium/Kafka).\\n- Tối ưu hóa chi phí truy vấn BigQuery thông qua Partitioning và Clustering thông minh.\\n- Hỗ trợ đội ngũ kinh doanh kết nối dữ liệu tự động lên Looker và Metabase.",
                "- Từ 2 năm kinh nghiệm làm việc với hệ sinh thái Google Cloud Platform (BigQuery, Cloud Storage, Dataflow).\\n- Thành thạo ngôn ngữ truy vấn SQL và lập trình tự động hóa với Python.\\n- Hiểu rõ các nguyên lý CDC (Change Data Capture) và kiến trúc dữ liệu sự kiện.\\n- Tinh thần chủ động, trách nhiệm cao đối với tính sẵn sàng của dữ liệu."
        ));
        list.add(new JobSeedItem(
                "shopee",
                "Data Warehouse & BI Developer",
                "SQL, Data Warehouse, Power BI, ETL, Python, Presto, ClickHouse",
                35,
                55,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Thiết kế và mở rộng hệ thống Data Warehouse xử lý dữ liệu giao dịch toàn khu vực Đông Nam Á.\\n- Áp dụng cơ sở dữ liệu cột ClickHouse để tăng tốc độ phân tích dữ liệu tức thời lên gấp 10 lần.\\n- Xây dựng các Dashboard quản trị thời gian thực với độ phức tạp cao.\\n- Thiết lập các bài kiểm tra tự động chất lượng dữ liệu (Data Quality Check) trước khi phát hành.",
                "- Tối thiểu 4 năm kinh nghiệm làm việc chuyên sâu với Data Warehouse và Business Intelligence.\\n- Chuyên gia về SQL và am hiểu các công nghệ OLAP (ClickHouse, Presto/Trino, Druid).\\n- Kinh nghiệm quản lý dữ liệu quy mô hàng trăm tỷ bản ghi.\\n- Tiếng Anh giao tiếp thành thạo trong môi trường đa quốc gia."
        ));
        list.add(new JobSeedItem(
                "ghtk",
                "Junior Data Engineer",
                "SQL, Python, Spark, MySQL, Data Pipeline, Linux, Git",
                16,
                24,
                "Junior",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Xây dựng các tác vụ đồng bộ dữ liệu giao hàng từ các kho trung chuyển về hệ thống phân tích tập trung.\\n- Viết các script Python và PySpark xử lý dữ liệu lộ trình giao vận của hàng vạn tài xế.\\n- Tối ưu hóa các bảng báo cáo tổng hợp doanh thu và sản lượng bưu kiện theo ca làm việc.\\n- Giám sát trạng thái hoạt động của các lịch trình Cronjob và sửa lỗi dữ liệu phát sinh.",
                "- Từ 1-2 năm kinh nghiệm trong lĩnh vực kỹ thuật dữ liệu (Data Engineering).\\n- Thành thạo SQL và lập trình Python.\\n- Có hiểu biết cơ bản về cơ sở dữ liệu quan hệ và công cụ tính toán phân tán Apache Spark.\\n- Chăm chỉ, chịu khó tìm tòi và yêu thích phân tích số liệu vận hành thực tế."
        ));
        list.add(new JobSeedItem(
                "momo",
                "Analytics Engineer (dbt & SQL)",
                "SQL, dbt, Snowflake, Airflow, Data Modeling, Git, Tableau",
                25,
                38,
                "Middle",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Đóng vai trò cầu nối vững chắc giữa Data Engineering và Data Analytics tại MoMo.\\n- Ứng dụng dbt (data build tool) để áp dụng các chuẩn kỹ thuật phần mềm (CI/CD, version control) vào mô hình dữ liệu.\\n- Viết các bài test logic nghiệp vụ tự động và tài liệu hóa từ điển dữ liệu (Data Dictionary).\\n- Cung cấp dữ liệu sạch, chuẩn hóa và sẵn sàng phân tích cho các phòng ban kinh doanh.",
                "- Từ 2-3 năm kinh nghiệm ở vị trí Analytics Engineer hoặc Senior Data Analyst.\\n- Kỹ năng SQL ở mức độ chuyên gia và thành thạo framework dbt.\\n- Hiểu biết vững về các kỹ thuật mô hình hóa dữ liệu (Dimensional Modeling, Kimball).\\n- Kỹ năng truyền đạt vấn đề dữ liệu cho các bên phi kỹ thuật dễ hiểu."
        ));
        list.add(new JobSeedItem(
                "grab",
                "Real-time Streaming Data Engineer",
                "Apache Flink, Kafka, Java, Scala, Redis, Streaming Data, Cassandra",
                45,
                70,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Xây dựng hệ thống phân tích luồng dữ liệu thời gian thực (Real-time Stream Processing) bằng Apache Flink.\\n- Tính toán động giá cước (Dynamic Pricing) và thời gian dự kiến đến (ETA) dựa trên lưu lượng giao thông tức thời.\\n- Tối ưu hóa độ trễ xử lý sự kiện xuống dưới 100 miligiây cho hàng triệu chuyến xe mỗi ngày.\\n- Đảm bảo hệ thống đạt tính nhất quán Exactly-Once Semantics trong mọi tình huống sự cố mạng.",
                "- Tối thiểu 4 năm kinh nghiệm làm việc với công nghệ xử lý luồng (Apache Flink, Kafka Streams, Spark Streaming).\\n- Thành thạo lập trình hướng đối tượng và đa luồng với Java hoặc Scala.\\n- Kinh nghiệm chuyên sâu với các CSDL NoSQL ghi nhanh (Apache Cassandra, ScyllaDB, Redis).\\n- Tiếng Anh chuyên nghiệp, tự tin thảo luận với các chuyên gia kỹ thuật trên toàn thế giới."
        ));
        list.add(new JobSeedItem(
                "nab",
                "Senior DevOps Engineer (Kubernetes & AWS)",
                "DevOps, Kubernetes, AWS, Terraform, CI/CD, Docker, Helm, Prometheus",
                42,
                65,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Xây dựng và quản trị hạ tầng điện toán đám mây AWS chuẩn ngân hàng toàn cầu (EKS, VPC, IAM, Transit Gateway).\\n- Tự động hóa hoàn toàn quy trình phân phối phần mềm CI/CD với GitLab CI và ArgoCD theo chuẩn GitOps.\\n- Viết mã hạ tầng (Infrastructure as Code - IaC) với Terraform và quản trị cấu hình Helm Charts.\\n- Thiết lập hệ thống cảnh báo và giám sát toàn diện với Prometheus, Grafana và Datadog.",
                "- Tối thiểu 4 năm kinh nghiệm chuyên sâu ở vai trò DevOps/Cloud Engineer.\\n- Sở hữu chứng chỉ AWS Solutions Architect Professional hoặc CKA (Certified Kubernetes Administrator) là lợi thế lớn.\\n- Thành thạo Terraform, Docker, Kubernetes và tư duy GitOps.\\n- Tiếng Anh thành thạo, khả năng làm việc trong môi trường agile quốc tế."
        ));
        list.add(new JobSeedItem(
                "onemount",
                "Cloud Platform Engineer (GCP & Terraform)",
                "GCP, Terraform, Kubernetes, Linux, Docker, Bash, GitOps",
                30,
                48,
                "Middle",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Quản lý hạ tầng Google Cloud Platform (GCP) bao gồm cụm GKE, Cloud SQL và Pub/Sub.\\n- Tự động hóa các tác vụ quản trị hệ thống bằng Bash script và Python.\\n- Tối ưu hóa chi phí hạ tầng Cloud (FinOps) và loại bỏ các tài nguyên không sử dụng.\\n- Phối hợp với các đội phát triển phần mềm để thiết kế hạ tầng phù hợp với từng dịch vụ mới.",
                "- Từ 2-3 năm kinh nghiệm quản trị hạ tầng Cloud, đặc biệt là Google Cloud Platform.\\n- Thành thạo viết mã IaC với Terraform và triển khai container trên Kubernetes.\\n- Hiểu biết vững chắc về mạng máy tính (VPC, Subnet, Routing, NAT, Load Balancer).\\n- Tinh thần cầu tiến, không ngại thử nghiệm các công nghệ mới."
        ));
        list.add(new JobSeedItem(
                "shopee",
                "Site Reliability Engineer (SRE)",
                "SRE, Linux, Go, Python, Kubernetes, Prometheus, Grafana, Incident Management",
                45,
                75,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Đảm bảo tính sẵn sàng (SLO/SLA) 99.99% cho toàn bộ các dịch vụ cốt lõi của Shopee.\\n- Tham gia ứng trực On-call, điều tra nguyên nhân gốc rễ (Root Cause Analysis - RCA) các sự cố lớn.\\n- Lập trình các công cụ tự động hóa khôi phục sự cố bằng Golang hoặc Python.\\n- Thực hiện diễn tập sự cố (Chaos Engineering) để kiểm tra sức chống chịu của hệ thống.",
                "- Tối thiểu 4 năm kinh nghiệm trong vai trò SRE hoặc Systems Engineer trong môi trường High Traffic.\\n- Hiểu biết sâu sắc về Linux Kernel Internals, Networking (TCP/IP, HTTP/2, DNS) và File Systems.\\n- Kỹ năng lập trình tốt bằng Golang hoặc Python để tự động hóa vận hành.\\n- Khả năng giữ bình tĩnh, tư duy mạch lạc và ra quyết định chính xác trong các tình huống khẩn cấp."
        ));
        list.add(new JobSeedItem(
                "techasia",
                "DevOps Engineer (CI/CD Automation)",
                "DevOps, Jenkins, GitLab CI, Docker, Kubernetes, Linux, Shell Scripting",
                25,
                38,
                "Middle",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Xây dựng và duy trì các đường ống dẫn triển khai tự động CI/CD cho hơn 20 microservices.\\n- Quản trị các máy chủ Linux, cài đặt chứng chỉ SSL, cấu hình Nginx Reverse Proxy.\\n- Tối ưu hóa thời gian build ứng dụng và giảm dung lượng Docker image.\\n- Hỗ trợ các lập trình viên gỡ lỗi môi trường phát triển (Dev/Staging/UAT).",
                "- Từ 2 năm kinh nghiệm làm việc trong lĩnh vực DevOps hoặc quản trị hệ thống Linux.\\n- Sử dụng thành thạo GitLab CI, Jenkins và đóng gói Docker container.\\n- Viết Shell Script (Bash) tự tin và hiểu biết cơ bản về Kubernetes.\\n- Tinh thần hỗ trợ đồng đội tốt, giải quyết sự cố nhanh nhẹn."
        ));
        list.add(new JobSeedItem(
                "cmc",
                "Cloud Security & Infrastructure Engineer",
                "AWS, Azure, Cloud Security, Terraform, Linux, Networking, Docker",
                35,
                55,
                "Senior",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Thiết kế kiến trúc bảo mật đa đám mây (Multi-Cloud Security) cho các khách hàng doanh nghiệp lớn.\\n- Rà soát lỗ hổng bảo mật hạ tầng mạng, áp dụng các tiêu chuẩn an toàn CIS Benchmarks.\\n- Cấu hình tường lửa ứng dụng web (WAF), hệ thống chống tấn công từ chối dịch vụ (DDoS Protection).\\n- Tham gia đánh giá kiến trúc hạ tầng và tư vấn giải pháp chuyển đổi đám mây an toàn.",
                "- Tối thiểu 3-4 năm kinh nghiệm về hạ tầng Cloud (AWS/Azure) và an toàn bảo mật mạng.\\n- Có các chứng chỉ chuyên môn như AWS Certified Security Specialty hoặc Azure Security Engineer.\\n- Am hiểu các quy chuẩn bảo mật quốc tế và tuân thủ an toàn thông tin.\\n- Kỹ năng giao tiếp và tư vấn khách hàng doanh nghiệp chuyên nghiệp."
        ));
        list.add(new JobSeedItem(
                "vng",
                "Kubernetes Administrator",
                "Kubernetes, Docker, Linux, CNI, CSI, Ceph, Prometheus, Helm",
                28,
                45,
                "Middle",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Quản trị cụm Kubernetes quy mô hàng trăm máy chủ vật lý phục vụ đám mây nội bộ VNG Cloud.\\n- Cấu hình và tối ưu hóa hệ thống mạng CNI (Calico/Cilium) và lưu trữ phân tán CSI (Ceph/Rook).\\n- Thực hiện nâng cấp phiên bản Kubernetes không làm gián đoạn các dịch vụ đang chạy.\\n- Xây dựng các chính sách phân bổ tài nguyên (Resource Quotas, Limit Ranges) hợp lý.",
                "- Từ 2-3 năm kinh nghiệm quản trị cụm Kubernetes trong môi trường sản xuất thực tế.\\n- Đạt chứng chỉ CKA (Certified Kubernetes Administrator) là điểm cộng lớn.\\n- Hiểu biết sâu sắc về hệ điều hành Linux và hệ thống lưu trữ phân tán.\\n- Khả năng phân tích log và chẩn đoán sự cố mạng container chuyên sâu."
        ));
        list.add(new JobSeedItem(
                "fpt",
                "Junior DevOps / System Administrator",
                "Linux, Docker, Bash, Git, Jenkins, Networking, Nginx",
                14,
                22,
                "Junior",
                "TP.HCM",
                "Toàn thời gian",
                3,
                "- Vận hành các máy chủ phục vụ kiểm thử và môi trường phát triển của các dự án khách hàng nước ngoài.\\n- Cấu hình tự động hóa build mã nguồn với Jenkins và thông báo kết quả qua Slack/Teams.\\n- Cài đặt, bảo trì các hệ điều hành Ubuntu/CentOS và cấu hình dịch vụ web Nginx/Apache.\\n- Hỗ trợ khắc phục sự cố kết nối mạng nội bộ và cấp phát tài nguyên theo yêu cầu.",
                "- Từ 1 năm kinh nghiệm làm việc với hệ điều hành Linux và các dịch vụ mạng căn bản.\\n- Hiểu biết về Docker, Git và quy trình phát triển phần mềm cơ bản.\\n- Có tinh thần trách nhiệm, cẩn thận và ham học hỏi công nghệ DevOps mới.\\n- Trình độ tiếng Anh đọc hiểu tài liệu chuyên ngành tốt."
        ));
        list.add(new JobSeedItem(
                "viettel",
                "Lead Cloud Solution Architect",
                "Cloud Architecture, AWS, Kubernetes, Multi-Cloud, Terraform, Zero Trust, FinOps",
                60,
                85,
                "Lead",
                "Hà Nội",
                "Toàn thời gian",
                1,
                "- Chịu trách nhiệm thiết kế tổng thể kiến trúc điện toán đám mây cho các hệ thống viễn thông số thế hệ mới.\\n- Triển khai mô hình bảo mật Zero Trust Architecture và kiến trúc Multi-Cloud dự phòng thảm họa.\\n- Lãnh đạo ban điều phối FinOps nhằm kiểm soát và tối ưu hóa ngân sách hạ tầng triệu đô.\\n- Đại diện tập đoàn làm việc với các đối tác chiến lược công nghệ hàng đầu thế giới (AWS, Google, Microsoft).",
                "- Tối thiểu 7 năm kinh nghiệm về Cloud & Infrastructure và ít nhất 3 năm ở cấp độ Kiến trúc sư trưởng.\\n- Sở hữu các chứng chỉ cao cấp nhất về Kiến trúc đám mây (AWS Solutions Architect Pro, Google Cloud Fellow).\\n- Năng lực tư duy chiến lược, hoạch định tương lai công nghệ cho tổ chức quy mô lớn.\\n- Kỹ năng đàm phán, thuyết phục và lãnh đạo đội ngũ kỹ sư xuất sắc."
        ));
        list.add(new JobSeedItem(
                "zalopay",
                "DevSecOps Engineer",
                "DevSecOps, SonarQube, SAST, DAST, Kubernetes, CI/CD, Docker, Vault",
                38,
                60,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Tích hợp tự động hóa bảo mật (Security as Code) vào mọi giai đoạn của quy trình CI/CD.\\n- Triển khai các công cụ quét mã tĩnh (SAST), kiểm thử bảo mật động (DAST) và kiểm tra lỗ hổng phụ thuộc (SCA).\\n- Quản lý bí mật và chứng chỉ bảo mật tập trung sử dụng HashiCorp Vault.\\n- Đào tạo nhận thức lập trình an toàn (Secure Coding) cho cộng đồng lập trình viên trong công ty.",
                "- Tối thiểu 3 năm kinh nghiệm trong lĩnh vực DevSecOps hoặc AppSec kết hợp DevOps.\\n- Thành thạo việc tích hợp các công cụ bảo mật (SonarQube, Snyk, Trivy, OWASP ZAP) vào CI/CD pipeline.\\n- Kinh nghiệm làm việc với hệ thống quản lý Secret và kiểm soát quyền truy cập RBAC.\\n- Tư duy bảo mật sắc bén, chủ động tìm kiếm và khắc phục các rủi ro tiềm ẩn."
        ));
        list.add(new JobSeedItem(
                "vnpt",
                "Infrastructure & Network Automation Engineer",
                "Network, Ansible, Python, Linux, Cisco, Automation, Docker",
                22,
                35,
                "Middle",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Tự động hóa cấu hình thiết bị mạng (Switch, Router, Firewall) bằng Ansible và Netmiko/NAPALM.\\n- Quản trị hệ thống mạng trung tâm dữ liệu (Data Center Network) và đường truyền cáp quang liên tỉnh.\\n- Phát triển các công cụ giám sát hiệu năng mạng và phát hiện sớm hiện tượng nghẽn mạch.\\n- Tham gia nâng cấp và mở rộng hạ tầng mạng viễn thông quốc gia.",
                "- Từ 2-3 năm kinh nghiệm quản trị hệ thống mạng quy mô lớn và tự động hóa.\\n- Có chứng chỉ quốc tế CCNA/CCNP và thành thạo công cụ tự động hóa Ansible.\\n- Kỹ năng lập trình script với Python phục vụ tương tác API thiết bị mạng.\\n- Tác phong làm việc chuẩn mực, cẩn thận và tuân thủ quy trình vận hành nghiêm ngặt."
        ));
        list.add(new JobSeedItem(
                "momo",
                "Senior iOS Developer (Swift)",
                "iOS, Swift, SwiftUI, Combine, VIPER, CoreData, Unit Testing, CI/CD",
                35,
                55,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Phát triển các phân hệ tài chính và thanh toán quan trọng trên ứng dụng MoMo iOS.\\n- Áp dụng kiến trúc Clean Architecture / VIPER đảm bảo mã nguồn dễ bảo trì và kiểm thử.\\n- Tối ưu hóa thời gian khởi động ứng dụng (Cold Start) và giảm thiểu mức tiêu hao pin thiết bị.\\n- Phối hợp với Apple Review Team để đảm bảo ứng dụng luôn tuân thủ nguyên tắc App Store.",
                "- Tối thiểu 4 năm kinh nghiệm phát triển ứng dụng iOS native chuyên sâu với Swift.\\n- Thành thạo SwiftUI, Combine và UIKit cổ điển.\\n- Hiểu biết sâu sắc về quản lý bộ nhớ (ARC), Memory Leaks và xử lý đa luồng (GCD/Concurrency).\\n- Kỹ năng viết Unit Test và UI Test tự động vững vàng."
        ));
        list.add(new JobSeedItem(
                "zalopay",
                "Senior Android Developer (Kotlin)",
                "Android, Kotlin, Jetpack Compose, Coroutines, MVVM, Room, Dagger Hilt",
                35,
                55,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Lập trình các tính năng ví điện tử ZaloPay cho hệ điều hành Android.\\n- Xây dựng giao diện người dùng hiện đại hoàn toàn bằng Jetpack Compose.\\n- Tối ưu hóa hiệu năng ứng dụng chạy mượt mà trên đa dạng thiết bị từ giá rẻ đến cao cấp.\\n- Bảo vệ an toàn ứng dụng di động: phòng chống Decompilation, Root Detection và mã hóa dữ liệu cục bộ.",
                "- Tối thiểu 4 năm kinh nghiệm lập trình Android với ngôn ngữ Kotlin.\\n- Nắm vững kiến trúc Android Jetpack (Compose, ViewModel, Room, Navigation, Hilt/Koin).\\n- Thành thạo lập trình bất đồng bộ với Kotlin Coroutines và Flow.\\n- Có kinh nghiệm về bảo mật ứng dụng Android trong lĩnh vực Fintech là điểm cộng lớn."
        ));
        list.add(new JobSeedItem(
                "tiki",
                "Flutter Mobile Developer (Middle)",
                "Flutter, Dart, Bloc, RESTful API, Firebase, Git, Mobile Architecture",
                22,
                35,
                "Middle",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Phát triển và bảo trì các phân hệ trong ứng dụng mua sắm Tiki trên cả nền tảng Android và iOS.\\n- Quản lý trạng thái ứng dụng bằng thư viện BLoC Pattern.\\n- Tích hợp các dịch vụ Firebase (Crashlytics, Push Notifications, Analytics).\\n- Tối ưu hóa tốc độ cuộn danh sách sản phẩm và hiển thị hình ảnh mượt mà ở tần số 120Hz.",
                "- Từ 2 năm kinh nghiệm lập trình di động thực tế với Flutter & Dart.\\n- Nắm vững quy trình phát hành ứng dụng lên Google Play và Apple App Store.\\n- Hiểu rõ cơ chế kết nối mã Native (Platform Channels) khi cần thiết.\\n- Tinh thần làm việc nhóm năng động và đam mê trải nghiệm người dùng di động."
        ));
        list.add(new JobSeedItem(
                "techasia",
                "React Native Mobile Engineer",
                "React Native, TypeScript, Redux, React Navigation, iOS, Android, Native Modules",
                22,
                36,
                "Middle",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Phát triển ứng dụng di động đa nền tảng cho hệ sinh thái thương mại và đặt hàng trực tuyến.\\n- Viết các Native Modules bằng Java/Kotlin (Android) và Objective-C/Swift (iOS) khi cần hiệu năng cao.\\n- Quản lý trạng thái toàn cục với Redux Toolkit và xử lý offline sync khi mất kết nối mạng.\\n- Đóng gói và phát hành bản cập nhật ứng dụng tự động qua Fastlane và CodePush.",
                "- Từ 2-3 năm kinh nghiệm phát triển ứng dụng di động với React Native và TypeScript.\\n- Hiểu biết về kiến trúc cầu nối Native Bridge và New Architecture (Fabric, TurboModules).\\n- Kỹ năng gỡ lỗi và tối ưu hiệu năng render (Re-render tuning) tốt.\\n- Khả năng làm việc độc lập và quản lý thời gian hiệu quả."
        ));
        list.add(new JobSeedItem(
                "vng",
                "Lead Mobile Architect",
                "Mobile Architecture, iOS, Android, Swift, Kotlin, Performance Tuning, Security",
                55,
                85,
                "Lead",
                "TP.HCM",
                "Toàn thời gian",
                1,
                "- Định hình chiến lược công nghệ và kiến trúc di động cho các ứng dụng quy mô hàng chục triệu người dùng.\\n- Giải quyết triệt để các bài toán khó về hiệu năng, kích thước gói cài đặt (App Size) và bảo mật dữ liệu.\\n- Chuẩn hóa quy trình phát triển Mobile DevOps, kiểm thử tự động trên Device Farm thực tế.\\n- Đóng vai trò cố vấn chuyên môn cao nhất cho toàn bộ đội ngũ lập trình viên di động.",
                "- Tối thiểu 7 năm kinh nghiệm phát triển Mobile và ít nhất 2 năm ở vị trí Kiến trúc sư di động.\\n- Am hiểu cả hai nền tảng iOS và Android từ tầng hệ điều hành đến tầng giao diện.\\n- Kinh nghiệm thực tế trong việc tái cấu trúc (Refactoring) các dự án di động mã nguồn khổng lồ.\\n- Kỹ năng truyền cảm hứng công nghệ và dẫn dắt đội ngũ kỹ sư xuất sắc."
        ));
        list.add(new JobSeedItem(
                "newstartup",
                "Junior Flutter Developer",
                "Flutter, Dart, Provider, RESTful API, SQLite, Git, UI Design",
                13,
                20,
                "Junior",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Tham gia xây dựng ứng dụng mạng xã hội ngách thế hệ mới dành cho giới trẻ.\\n- Lập trình giao diện động, hoạt ảnh bắt mắt và tính năng vuốt chạm mượt mà theo bản vẽ Figma.\\n- Ghép nối các API đăng nhập mạng xã hội, chia sẻ hình ảnh và chat tức thời.\\n- Thử nghiệm ứng dụng trên nhiều dòng máy khác nhau để tìm và khắc phục lỗi hiển thị.",
                "- Từ 1 năm kinh nghiệm làm việc với Flutter và Dart.\\n- Đã có ít nhất 1 sản phẩm hoàn chỉnh tải lên App Store hoặc Google Play.\\n- Có gu thẩm mỹ tốt, đam mê các hiệu ứng animation và micro-interactions.\\n- Tinh thần nhiệt huyết, sẵn sàng đón nhận thử thách trong môi trường khởi nghiệp."
        ));
        list.add(new JobSeedItem(
                "line",
                "Android SDK Engineer",
                "Android, Kotlin, Java, SDK Development, NDK, C++, Performance Optimization",
                28,
                45,
                "Middle",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Nghiên cứu và phát triển bộ SDK phần mềm (Software Development Kit) lõi cho các đối tác của LINE.\\n- Tối ưu hóa kích thước thư viện cực nhỏ, không gây xung đột dependency cho các ứng dụng tích hợp.\\n- Lập trình các module xử lý media và truyền phát âm thanh thời gian thực với Android NDK và C++.\\n- Viết tài liệu kỹ thuật chi tiết và hỗ trợ các nhà phát triển thứ ba tích hợp SDK.",
                "- Tối thiểu 3 năm kinh nghiệm lập trình Android Native, ưu tiên kinh nghiệm phát triển SDK hoặc Open Source.\\n- Hiểu biết về Android NDK, JNI và lập trình C/C++ là lợi thế rất lớn.\\n- Tư duy thiết kế API thân thiện, dễ sử dụng cho các lập trình viên khác.\\n- Tiếng Anh chuyên ngành tốt, có khả năng viết tài liệu chuẩn hóa quốc tế."
        ));
        list.add(new JobSeedItem(
                "nab",
                "iOS Developer (Fintech)",
                "iOS, Swift, UIKit, SwiftUI, TDD, Clean Swift, AWS, CI/CD",
                40,
                65,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Xây dựng các tính năng ngân hàng điện tử thế hệ mới cho hàng triệu khách hàng tại Úc.\\n- Áp dụng kiến trúc Clean Swift (VIP) kết hợp phương pháp phát triển hướng kiểm thử TDD.\\n- Đảm bảo tỷ lệ bao phủ mã kiểm thử (Code Coverage) đạt trên 85% trước mỗi lần hợp nhất mã nguồn.\\n- Phối hợp chặt chẽ với các chuyên gia bảo mật để vượt qua các kỳ đánh giá an ninh ngân hàng.",
                "- Tối thiểu 4 năm kinh nghiệm lập trình iOS với Swift và môi trường phát triển quốc tế.\\n- Tinh thông UIKit, SwiftUI và các thư viện mạng Apple Native.\\n- Đam mê phương pháp TDD, Clean Code và các nguyên lý kiến trúc phần mềm chuẩn mực.\\n- Trình độ tiếng Anh lưu loát, tự tin thảo luận với các chuyên gia kỹ thuật người Úc."
        ));
        list.add(new JobSeedItem(
                "kms",
                "Cross-Platform Mobile Developer (Flutter/RN)",
                "Flutter, React Native, Dart, TypeScript, REST API, App Store Deployment",
                22,
                34,
                "Middle",
                "Đà Nẵng",
                "Toàn thời gian",
                2,
                "- Tham gia các dự án phát triển ứng dụng di động cho thị trường Bắc Mỹ với công nghệ Flutter hoặc React Native.\\n- Triển khai nhanh chóng các tính năng từ yêu cầu người dùng, đảm bảo hiệu năng và tính nhất quán trên cả hai hệ điều hành.\\n- Xây dựng các quy trình tự động hóa kiểm thử và kiểm tra chất lượng ứng dụng.\\n- Báo cáo tiến độ trực tiếp trong các buổi họp Daily Standup với khách hàng Hoa Kỳ.",
                "- Từ 2-3 năm kinh nghiệm trong lĩnh vực lập trình di động đa nền tảng.\\n- Thành thạo ít nhất một trong hai công nghệ: Flutter hoặc React Native.\\n- Có kinh nghiệm làm việc trong các dự án Outsourcing chuẩn Agile/Scrum.\\n- Khả năng giao tiếp tiếng Anh tốt trong môi trường làm việc toàn cầu."
        ));
        list.add(new JobSeedItem(
                "axon",
                "Fresher Mobile App Developer",
                "Mobile, Kotlin, Swift, OOP, Git, RESTful API",
                9,
                14,
                "Fresher",
                "TP.HCM",
                "Toàn thời gian",
                3,
                "- Tham gia khóa huấn luyện kỹ sư di động chuyên nghiệp theo phương pháp Agile của Thụy Sĩ.\\n- Học hỏi kiến trúc ứng dụng di động hiện đại và viết mã sạch cùng các chuyên gia giàu kinh nghiệm.\\n- Tham gia phát triển tính năng trong các dự án thực tế sau tháng đào tạo đầu tiên.\\n- Rèn luyện kỹ năng mềm, thuyết trình và tiếng Anh giao tiếp kỹ thuật.",
                "- Tốt nghiệp chuyên ngành CNTT hoặc phần mềm loại Khá/Giỏi.\\n- Đã từng làm quen với Kotlin (Android) hoặc Swift (iOS) qua đồ án hoặc tự học.\\n- Tư duy thuật toán tốt, yêu thích thế giới ứng dụng di động.\\n- Tinh thần cầu tiến, thái độ hợp tác và khả năng học hỏi công nghệ nhanh chóng."
        ));
        list.add(new JobSeedItem(
                "shopee",
                "Senior Golang Backend Engineer",
                "Golang, Microservices, gRPC, Redis, MySQL, Kafka, Docker, Distributed Systems",
                45,
                70,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Xây dựng các dịch vụ backend siêu nhanh bằng ngôn ngữ Golang phục vụ đơn hàng và kho bãi.\\n- Tối ưu hóa việc tận dụng Goroutines và Channels để xử lý đồng thời hàng chục ngàn kết nối mạng.\\n- Thiết kế giao thức truyền tải nội bộ bằng gRPC và Protobuf giúp giảm thiểu băng thông mạng.\\n- Theo dõi hệ thống thông qua Distributed Tracing (Jaeger/OpenTelemetry) và giải quyết các điểm nghẽn hiệu năng.",
                "- Tối thiểu 4 năm kinh nghiệm lập trình backend, trong đó có ít nhất 2 năm làm việc chuyên sâu với Golang.\\n- Nắm vững mô hình Concurrency của Golang và cơ chế hoạt động của Go Runtime.\\n- Kinh nghiệm thực chiến với các hệ thống phân tán chịu tải cao trong lĩnh vực TMĐT hoặc OTT.\\n- Tiếng Anh chuyên nghiệp, sẵn sàng làm việc trong môi trường đa quốc tịch."
        ));
        list.add(new JobSeedItem(
                "ghtk",
                "Golang High-Throughput Developer",
                "Golang, Concurrency, Redis, MySQL, RabbitMQ, Docker, Linux, REST API",
                26,
                40,
                "Middle",
                "Hà Nội",
                "Toàn thời gian",
                3,
                "- Phát triển các module xử lý dữ liệu cảm biến định vị GPS từ hàng chục ngàn phương tiện vận chuyển liên tục.\\n- Sử dụng Golang để xây dựng các worker xử lý hàng đợi thông điệp RabbitMQ tốc độ cao.\\n- Tối ưu hóa bộ nhớ và tài nguyên CPU máy chủ để duy trì chi phí vận hành ở mức thấp nhất.\\n- Phối hợp với đội ngũ IoT để cập nhật các giao thức giao tiếp thiết bị mới.",
                "- Từ 2-3 năm kinh nghiệm lập trình Golang trong các bài toán High-Throughput.\\n- Hiểu biết sâu về Network Programming (TCP/UDP, WebSocket) và Message Brokers.\\n- Sử dụng thành thạo môi trường Linux và các công cụ giám sát tiến trình hệ thống.\\n- Tác phong làm việc nhanh gọn, quyết liệt và sẵn sàng xử lý sự cố bất kể thời gian."
        ));
        list.add(new JobSeedItem(
                "nashtech",
                "Senior .NET Core Developer (C#)",
                "C#, .NET Core, ASP.NET, Entity Framework, SQL Server, Azure, Microservices",
                32,
                50,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Phát triển các ứng dụng doanh nghiệp quy mô lớn trên nền tảng .NET 8 / C# cho khách hàng Châu Âu.\\n- Áp dụng kiến trúc Clean Architecture, Domain-Driven Design (DDD) và CQRS Pattern.\\n- Tối ưu hóa cơ sở dữ liệu Microsoft SQL Server với hàng triệu bản ghi và viết Stored Procedures phức tạp.\\n- Triển khai các ứng dụng lên đám mây Microsoft Azure sử dụng Azure App Services và Azure Functions.",
                "- Tối thiểu 4 năm kinh nghiệm lập trình chuyên sâu với C# và .NET Core / ASP.NET Core.\\n- Thành thạo Entity Framework Core, Dapper và kỹ thuật tối ưu hóa truy vấn CSDL SQL Server.\\n- Kinh nghiệm thực tế với các dịch vụ điện toán đám mây Azure.\\n- Tiếng Anh giao tiếp lưu loát trong công việc hàng ngày."
        ));
        list.add(new JobSeedItem(
                "fpt",
                ".NET Software Engineer (Middle)",
                "C#, .NET Core, Web API, SQL Server, Docker, LINQ, Unit Testing",
                20,
                32,
                "Middle",
                "Hà Nội",
                "Toàn thời gian",
                3,
                "- Tham gia các dự án chuyển đổi hệ thống Legacy sang kiến trúc hiện đại .NET Core cho đối tác tài chính.\\n- Thiết kế các Web API RESTful chuẩn mực và tài liệu hóa bằng Swagger/OpenAPI.\\n- Viết các bài kiểm thử đơn vị với xUnit/NUnit và Moq nhằm đảm bảo chất lượng phần mềm.\\n- Phối hợp chặt chẽ với khách hàng và kiểm thử viên trong các kỳ kiểm thử nghiệm thu (UAT).",
                "- Từ 2-3 năm kinh nghiệm lập trình với hệ sinh thái .NET và ngôn ngữ C#.\\n- Nắm vững các nguyên lý lập trình hướng đối tượng, LINQ và cơ chế xử lý bất đồng bộ (async/await).\\n- Hiểu biết về thiết kế cơ sở dữ liệu quan hệ và chỉ mục (Index).\\n- Tinh thần trách nhiệm và khả năng phối hợp làm việc nhóm tốt."
        ));
        list.add(new JobSeedItem(
                "tiki",
                "Senior PHP / Laravel Backend Engineer",
                "PHP, Laravel, MySQL, Redis, Elasticsearch, Docker, RESTful API, Git",
                28,
                45,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Phát triển và mở rộng các phân hệ quản lý thông tin nhà bán lẻ, chiết khấu khuyến mãi trên sàn Tiki.\\n- Tối ưu hóa hiệu năng ứng dụng PHP 8 với OPcache và JIT compiler.\\n- Sử dụng Elasticsearch để hỗ trợ tìm kiếm sản phẩm đa tiêu chí với tốc độ tức thời.\\n- Thiết kế các tác vụ xử lý nền (Queued Jobs) với Redis để không làm nghẽn tiến trình người dùng.",
                "- Tối thiểu 4 năm kinh nghiệm lập trình backend với PHP và các framework hiện đại (Laravel, Symfony).\\n- Nắm vững các khái niệm Design Patterns, SOLID và kiến trúc dịch vụ RESTful.\\n- Kinh nghiệm tối ưu hóa truy vấn CSDL MySQL và sử dụng bộ đệm Redis hiệu quả.\\n- Tư duy làm sản phẩm thực tế và tinh thần cải tiến liên tục."
        ));
        list.add(new JobSeedItem(
                "axon",
                "PHP Developer (Middle)",
                "PHP, Laravel, Symfony, MySQL, Vue.js, Git, OOP",
                18,
                28,
                "Middle",
                "Đà Nẵng",
                "Toàn thời gian",
                2,
                "- Tham gia xây dựng các hệ thống quản lý bất động sản và du lịch thông minh cho thị trường Châu Âu.\\n- Viết code PHP chuẩn PSR, tuân thủ nghiêm ngặt các quy ước lập trình quốc tế.\\n- Phối hợp với đội ngũ Frontend xây dựng giao diện tương tác liền mạch với Vue.js.\\n- Tham gia đầy đủ các nghi thức Agile: Daily Standup, Sprint Review và Demo.",
                "- Từ 2 năm kinh nghiệm làm việc thực tế với PHP và framework Laravel.\\n- Hiểu biết tốt về cơ sở dữ liệu quan hệ MySQL và ORM Eloquent.\\n- Có hiểu biết cơ bản về giao diện Frontend (JavaScript, Vue.js hoặc HTML/CSS).\\n- Trình độ tiếng Anh giao tiếp khá, tự tin trao đổi với đồng nghiệp nước ngoài."
        ));
        list.add(new JobSeedItem(
                "vng",
                "Junior Golang Developer",
                "Golang, RESTful API, PostgreSQL, Docker, Git, Linux, Unit Testing",
                16,
                25,
                "Junior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Tham gia phát triển các dịch vụ tiện ích nội bộ và API quản trị trên nền tảng Zalo.\\n- Viết mã nguồn Golang trong sáng, dễ đọc và bao phủ đầy đủ kiểm thử tự động.\\n- Đóng gói ứng dụng vào Docker container và giám sát hoạt động thông qua hệ thống log tập trung.\\n- Nhận sự hướng dẫn và phản hồi trực tiếp từ các kỹ sư dày dặn kinh nghiệm.",
                "- Tối thiểu 1 năm kinh nghiệm lập trình với Golang hoặc đã có kinh nghiệm backend ngôn ngữ khác muốn chuyển sang Go.\\n- Hiểu rõ cú pháp Go, cơ chế Concurrency và quản lý lỗi chuẩn Go idiom.\\n- Nắm vững kiến thức nền tảng về hệ điều hành, mạng máy tính và cơ sở dữ liệu.\\n- Ham học hỏi, có chí tiến thủ và mong muốn phát triển tại công ty công nghệ hàng đầu."
        ));
        list.add(new JobSeedItem(
                "topstech",
                "C++ Embedded / Systems Software Engineer",
                "C++, Embedded Linux, RTOS, IoT, Memory Optimization, Multithreading, Git",
                35,
                55,
                "Senior",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Phát triển phần mềm nhúng (Firmware / Embedded Linux) điều khiển camera thông minh và thiết bị IoT.\\n- Tối ưu hóa thuật toán xử lý video trực tiếp trên chip biên với bộ nhớ RAM giới hạn.\\n- Lập trình giao tiếp phần cứng qua các giao thức I2C, SPI, UART và Ethernet.\\n- Phối hợp với nhóm AI để nhúng các mô hình mạng nơ-ron vào chip vi xử lý.",
                "- Tối thiểu 3-4 năm kinh nghiệm lập trình C/C++ cho các hệ thống nhúng (Embedded Systems).\\n- Hiểu biết sâu sắc về hệ điều hành Embedded Linux, RTOS và lập trình đa luồng (POSIX Threads).\\n- Khả năng đọc hiểu sơ đồ mạch điện tử và sử dụng thiết bị đo (Oscilloscope, Logic Analyzer).\\n- Tinh thần nghiên cứu tỉ mỉ, kiên nhẫn và đam mê lĩnh vực phần cứng công nghệ."
        ));
        list.add(new JobSeedItem(
                "kms",
                "Lead .NET Architect",
                "C#, .NET Core, Cloud Architecture, Azure, Microservices, Event Sourcing, DDD",
                50,
                75,
                "Lead",
                "TP.HCM",
                "Toàn thời gian",
                1,
                "- Định hình chiến lược kiến trúc phần mềm cho các sản phẩm SaaS enterprise chạy trên nền tảng .NET và Azure.\\n- Thiết kế các giải pháp tích hợp quy mô lớn áp dụng Event Sourcing, Event-Driven và Microservices.\\n- Đánh giá và lựa chọn các công nghệ mới, thiết lập các bộ quy chuẩn kỹ thuật chung cho tổ chức.\\n- Đại diện công ty tư vấn giải pháp và bảo vệ kiến trúc trước ban giám đốc công nghệ (CTO) khách hàng Mỹ.",
                "- Tối thiểu 7 năm kinh nghiệm với nền tảng .NET/C# và ít nhất 2 năm ở vai trò Software Architect.\\n- Am hiểu toàn diện về Enterprise Architecture, Cloud Design Patterns và an ninh bảo mật dữ liệu.\\n- Khả năng giải quyết các bài toán kỹ thuật phức tạp nhất và định hướng tương lai sản phẩm.\\n- Tiếng Anh thành thạo, khả năng thuyết trình và lãnh đạo công nghệ xuất sắc."
        ));
        list.add(new JobSeedItem(
                "vnpt",
                "Junior .NET Developer",
                "C#, .NET, ASP.NET, SQL Server, HTML/CSS, Git",
                12,
                18,
                "Junior",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Tham gia duy trì và phát triển tính năng mới cho các cổng thông tin điện tử của các bộ ngành.\\n- Lập trình các màn hình tra cứu hồ sơ và tích hợp ký số văn bản điện tử.\\n- Viết các báo cáo số liệu và xử lý các yêu cầu thay đổi nghiệp vụ định kỳ.\\n- Làm việc theo quy trình bảo mật thông tin và tiêu chuẩn nghiệm thu chặt chẽ.",
                "- Từ 1 năm kinh nghiệm lập trình với C# và ASP.NET (MVC hoặc Web API).\\n- Có kinh nghiệm làm việc với CSDL Microsoft SQL Server.\\n- Tác phong làm việc chỉn chu, có trách nhiệm và tuân thủ kỷ luật dự án.\\n- Tinh thần học hỏi và sẵn sàng tiếp thu các kiến thức công nghệ mới."
        ));
        list.add(new JobSeedItem(
                "kms",
                "Senior Automation QA Engineer (Selenium / Java)",
                "Automation Testing, Selenium WebDriver, Java, TestNG, CI/CD, Git, Postman",
                28,
                45,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Thiết kế và xây dựng khung kiểm thử tự động (Automation Framework) từ đầu cho các ứng dụng web phức tạp.\\n- Tự động hóa các kịch bản kiểm thử hồi quy (Regression Test) và tích hợp vào quy trình CI/CD.\\n- Hướng dẫn và đào tạo các kỹ sư kiểm thử thủ công chuyển đổi sang tự động hóa.\\n- Phối hợp với Developers để tái hiện lỗi và đảm bảo tỷ lệ lỗi lọt sang Production ở mức tối thiểu.",
                "- Tối thiểu 3-4 năm kinh nghiệm chuyên sâu về Automation Testing với Java và Selenium WebDriver.\\n- Nắm vững các mô hình thiết kế kiểm thử (Page Object Model - POM, Data-Driven Testing).\\n- Sử dụng thành thạo Git, Jenkins/GitLab CI và các công cụ kiểm thử API (Postman/RestAssured).\\n- Kỹ năng giao tiếp tiếng Anh tốt trong môi trường làm việc quốc tế."
        ));
        list.add(new JobSeedItem(
                "momo",
                "Automation QA Engineer (Cypress / Playwright)",
                "Cypress, Playwright, TypeScript, JavaScript, API Testing, Postman, CI/CD",
                22,
                35,
                "Middle",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Xây dựng các bộ kiểm thử tự động đầu-cuối (End-to-End Testing) cho ứng dụng Web và Mini-App MoMo.\\n- Áp dụng các framework kiểm thử thế hệ mới Playwright hoặc Cypress bằng ngôn ngữ TypeScript.\\n- Tự động hóa kiểm thử hiệu năng API và tính toàn vẹn dữ liệu trong hệ thống thanh toán.\\n- Tham gia đánh giá chất lượng sản phẩm và đưa ra quyết định phát hành phiên bản (Go/No-Go Decision).",
                "- Từ 2-3 năm kinh nghiệm trong lĩnh vực kiểm thử tự động phần mềm.\\n- Thành thạo lập trình JavaScript/TypeScript và sử dụng thành thạo Cypress hoặc Playwright.\\n- Có tư duy phân tích trường hợp kiểm thử (Test Case Design) sắc bén và bao quát.\\n- Tinh thần trách nhiệm cao, tỉ mỉ và luôn đặt trải nghiệm người dùng lên hàng đầu."
        ));
        list.add(new JobSeedItem(
                "viettel",
                "Performance & Security Test Engineer",
                "Performance Testing, JMeter, Gatling, Security Testing, OWASP, LoadRunner",
                32,
                50,
                "Senior",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Lập kế hoạch và thực thi các bài kiểm thử hiệu năng chịu tải (Load Test, Stress Test, Endurance Test).\\n- Sử dụng Apache JMeter và Gatling để mô phỏng hàng triệu người dùng truy cập đồng thời vào hệ thống.\\n- Phối hợp với đội ngũ Infrastructure và Backend để định vị chính xác các điểm nghẽn hiệu năng.\\n- Thực hiện quét và kiểm thử bảo mật cơ bản theo danh mục OWASP Top 10.",
                "- Tối thiểu 3-4 năm kinh nghiệm về kiểm thử hiệu năng (Performance Testing) hoặc kiểm thử an ninh.\\n- Sử dụng thành thạo các công cụ tạo tải (JMeter, Gatling, k6, Locust).\\n- Hiểu biết về kiến trúc máy chủ, mạng và cơ chế hoạt động của cơ sở dữ liệu quan hệ.\\n- Tư duy logic phân tích biểu đồ số liệu xuất sắc và kỹ năng báo cáo chuyên nghiệp."
        ));
        list.add(new JobSeedItem(
                "techasia",
                "Manual / QC Engineer",
                "Manual Testing, Test Cases, Bug Tracking, JIRA, SQL, Postman, Agile",
                16,
                25,
                "Middle",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Phân tích tài liệu yêu cầu nghiệp vụ để thiết kế các kịch bản kiểm thử (Test Plan, Test Cases) chi tiết.\\n- Thực hiện kiểm thử tính năng, kiểm thử giao diện và kiểm thử tương thích trình duyệt.\\n- Ghi nhận và theo dõi vòng đời của lỗi (Bug Life Cycle) trên hệ thống JIRA.\\n- Đóng góp ý kiến cải tiến tính tiện dụng của sản phẩm từ góc nhìn của người dùng cuối.",
                "- Từ 2 năm kinh nghiệm ở vị trí Manual Tester / QC trong các dự án phát triển phần mềm.\\n- Viết câu lệnh truy vấn SQL cơ bản để kiểm tra dữ liệu trong cơ sở dữ liệu.\\n- Có chứng chỉ quốc tế ISTQB Foundation là một lợi thế.\\n- Tính cách cẩn thận, chi tiết, kiên nhẫn và khả năng giao tiếp khéo léo."
        ));
        list.add(new JobSeedItem(
                "shopee",
                "Mobile Automation Tester (Appium)",
                "Appium, Mobile Testing, Python, Java, iOS Testing, Android Testing, CI/CD",
                24,
                38,
                "Middle",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Xây dựng bộ kịch bản kiểm thử tự động cho ứng dụng Shopee trên cả hai nền tảng Android và iOS.\\n- Vận hành và mở rộng hệ thống kiểm thử thiết bị thực tế (In-house Device Farm).\\n- Phát hiện sớm các lỗi Crash, đơ giật hình ảnh hoặc sai lệch giao diện trên các thiết bị đặc thù.\\n- Tích hợp tự động chạy kiểm thử trước mỗi lần phát hành bản build mới cho tester nội bộ.",
                "- Từ 2-3 năm kinh nghiệm kiểm thử tự động ứng dụng di động với Appium.\\n- Thành thạo lập trình kịch bản bằng Python hoặc Java.\\n- Am hiểu sâu sắc về các đặc tính kỹ thuật và hệ sinh thái phân mảnh của thiết bị Android/iOS.\\n- Tiếng Anh giao tiếp tốt trong môi trường làm việc toàn cầu."
        ));
        list.add(new JobSeedItem(
                "nashtech",
                "Lead QA / Quality Assurance Manager",
                "QA Management, Automation Testing, Test Strategy, Agile, CI/CD, ISTQB",
                45,
                65,
                "Lead",
                "TP.HCM",
                "Toàn thời gian",
                1,
                "- Hoạch định chiến lược bảo đảm chất lượng phần mềm (Quality Strategy) cho toàn bộ các dự án đối tác quốc tế.\\n- Quản lý, đào tạo và định hướng nghề nghiệp cho đội ngũ hơn 15 kỹ sư kiểm thử (Manual & Automation).\\n- Thiết lập các chỉ số đo lường chất lượng dự án (Defect Density, Test Pass Rate, Escaped Defects).\\n- Trực tiếp trao đổi và báo cáo tình trạng chất lượng với các khách hàng cao cấp nước ngoài.",
                "- Tối thiểu 6 năm kinh nghiệm trong ngành QA/QC phần mềm và ít nhất 2 năm ở vị trí Quản lý/Lead QA.\\n- Sở hữu chứng chỉ quốc tế ISTQB Advanced Level (Test Manager hoặc Test Automation Engineer).\\n- Khả năng lãnh đạo, giải quyết mâu thuẫn và truyền cảm hứng làm việc chất lượng cao.\\n- Kỹ năng giao tiếp và thuyết trình tiếng Anh xuất sắc."
        ));
        list.add(new JobSeedItem(
                "fpt",
                "Junior QA / Tester",
                "Manual Testing, Test Design, SQL, API Testing, Postman, JIRA",
                10,
                16,
                "Junior",
                "Đà Nẵng",
                "Toàn thời gian",
                3,
                "- Đọc hiểu yêu cầu dự án phần mềm và viết kịch bản kiểm thử cho từng tính năng được giao.\\n- Thực hiện kiểm thử thủ công và kiểm thử API với Postman để xác minh dữ liệu trả về.\\n- Ghi nhận lỗi chi tiết với các bước tái hiện rõ ràng lên công cụ quản lý lỗi.\\n- Tham gia các buổi họp bàn giao tính năng cùng lập trình viên và khách hàng.",
                "- Từ 1 năm kinh nghiệm làm việc thực tế ở vị trí kiểm thử phần mềm (Tester/QC).\\n- Nắm vững các kỹ thuật thiết kế ca kiểm thử (Phân vùng tương đương, Phân tích giá trị biên).\\n- Chăm chỉ, tỉ mỉ, có trách nhiệm và tinh thần học hỏi cao.\\n- Trình độ tiếng Anh đọc hiểu tài liệu chuyên ngành tốt."
        ));
        list.add(new JobSeedItem(
                "axon",
                "Fresher Automation Tester",
                "Automation Testing, Java, Python, OOP, Selenium, Git",
                8,
                13,
                "Fresher",
                "TP.HCM",
                "Toàn thời gian",
                3,
                "- Tham gia chương trình đào tạo kỹ sư kiểm thử tự động chuẩn Châu Âu trong 2 tháng đầu tiên.\\n- Học cách sử dụng Git, viết mã kiểm thử hướng đối tượng với Java/Python và Selenium WebDriver.\\n- Thực hành xây dựng khung kiểm thử tự động thực tế và tích hợp vào quy trình làm việc của nhóm.\\n- Cơ hội trở thành nhân viên chính thức với lộ trình phát triển nghề nghiệp rõ ràng.",
                "- Tốt nghiệp chuyên ngành Công nghệ thông tin, Toán tin hoặc Hệ thống thông tin.\\n- Có kiến thức nền tảng về lập trình (Java, Python, C#) và Lập trình hướng đối tượng (OOP).\\n- Tư duy phân tích logic tốt, cẩn thận và có niềm đam mê nâng cao chất lượng phần mềm.\\n- Tiếng Anh giao tiếp cơ bản, có khả năng đọc hiểu tài liệu kỹ thuật."
        ));
        list.add(new JobSeedItem(
                "momo",
                "Senior UI/UX Product Designer",
                "UI/UX, Figma, User Research, Design Systems, Wireframing, Prototyping, Usability Testing",
                30,
                50,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Thiết kế trải nghiệm người dùng (UX) và giao diện trực quan (UI) cho các tính năng tài chính số của MoMo.\\n- Thực hiện nghiên cứu người dùng (User Research), phỏng vấn sâu và kiểm tra tính khả dụng (Usability Testing).\\n- Đóng góp và chuẩn hóa các thành phần giao diện trong hệ thống Design System chung của tập đoàn.\\n- Phối hợp chặt chẽ với Product Managers và Engineers để hiện thực hóa ý tưởng thiết kế một cách khả thi.",
                "- Tối thiểu 4 năm kinh nghiệm thiết kế sản phẩm số (Product Design / UI/UX) trên nền tảng di động và web.\\n- Tinh thông công cụ Figma, tạo Prototype tương tác cao và quản lý Auto Layout/Component Variants.\\n- Có Portfolio ấn tượng chứng minh khả năng giải quyết các bài toán sản phẩm thực tế.\\n- Tư duy lấy người dùng làm trung tâm (User-Centered Design) kết hợp nhạy bén về mục tiêu kinh doanh."
        ));
        list.add(new JobSeedItem(
                "tiki",
                "Product Manager (Fintech / E-Commerce)",
                "Product Management, Product Roadmap, Data Analysis, SQL, Agile, Scrum, JIRA",
                40,
                65,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                1,
                "- Xây dựng tầm nhìn sản phẩm, chiến lược và lộ trình phát triển (Product Roadmap) cho mảng Thanh toán & Khuyến mãi.\\n- Phân tích sâu số liệu hành vi người dùng, phát hiện cơ hội tăng trưởng doanh thu và tối ưu hóa tỷ lệ chuyển đổi.\\n- Viết tài liệu đặc tả sản phẩm (PRD), định nghĩa các tiêu chí chấp thuận (Acceptance Criteria) rõ ràng.\\n- Điều phối nhịp nhàng giữa các bộ phận: Kỹ thuật, Vận hành, Thiết kế, Pháp chế và Đối tác kinh doanh.",
                "- Tối thiểu 3-5 năm kinh nghiệm ở vai trò Quản lý sản phẩm (Product Manager) trong ngành TMĐT hoặc Fintech.\\n- Kỹ năng phân tích dữ liệu xuất sắc, thành thạo viết câu lệnh SQL để tự trích xuất dữ liệu phân tích.\\n- Am hiểu sâu sắc về hành vi người tiêu dùng trực tuyến tại thị trường Việt Nam.\\n- Khả năng lãnh đạo không quyền lực (Leadership without authority) và kỹ năng thương thảo thuyết phục."
        ));
        list.add(new JobSeedItem(
                "onemount",
                "Technical Business Analyst (IT BA)",
                "Business Analysis, BPMN, UML, SQL, System Architecture, API Specifications, JIRA",
                24,
                38,
                "Middle",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Khảo sát, thu thập và làm rõ các yêu cầu nghiệp vụ từ các đơn vị kinh doanh thuộc hệ sinh thái VinShop/OneHousing.\\n- Vẽ sơ đồ quy trình nghiệp vụ chuẩn BPMN, thiết kế sơ đồ luồng dữ liệu (Data Flow) và sơ đồ tuần tự (UML).\\n- Viết tài liệu đặc tả kỹ thuật chi tiết (Functional & Non-Functional Specifications), đặc tả API cho developers.\\n- Hỗ trợ đội ngũ kiểm thử xác minh các ca kiểm thử nghiệp vụ phức tạp.",
                "- Từ 2-3 năm kinh nghiệm trong vai trò Business Analyst (ưu tiên Technical BA có nền tảng CNTT).\\n- Nắm vững các công cụ phân tích thiết kế hệ thống (Visio, Draw.io, Enterprise Architect).\\n- Khả năng đọc hiểu cấu trúc dữ liệu JSON/XML và tài liệu thiết kế API Swagger.\\n- Kỹ năng giao tiếp và truyền đạt thông tin mạch lạc, khúc chiết giữa khối Nghiệp vụ và Kỹ thuật."
        ));
        list.add(new JobSeedItem(
                "zalopay",
                "Senior Technical Product Owner",
                "Product Owner, Agile, User Stories, Backlog Grooming, API Design, Payment Gateway",
                38,
                58,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                1,
                "- Chịu trách nhiệm quản lý Product Backlog cho nhóm dịch vụ Cổng thanh toán và Tích hợp đối tác của ZaloPay.\\n- Phân rã mục tiêu kinh doanh thành các User Stories có giá trị và định rõ tiêu chuẩn hoàn thành (Definition of Done).\\n- Trực tiếp tham gia thiết kế giải pháp API và luồng đối soát thanh toán an toàn cho đối tác lớn.\\n- Đảm bảo nhóm phát triển luôn làm việc trên những hạng mục mang lại giá trị cao nhất cho doanh nghiệp.",
                "- Tối thiểu 4 năm kinh nghiệm làm việc với tư cách Product Owner hoặc Technical Product Manager trong ngành Fintech.\\n- Có nền tảng kỹ thuật vững vàng, hiểu rõ nguyên lý hoạt động của Cổng thanh toán (Payment Gateway).\\n- Đạt chứng chỉ quốc tế CSPO (Certified Scrum Product Owner) hoặc PSPO là lợi thế.\\n- Tư duy phản biện sắc bén và khả năng quản lý kỳ vọng của các bên liên quan xuất sắc."
        ));
        list.add(new JobSeedItem(
                "axon",
                "Scrum Master / Agile Coach",
                "Scrum, Agile, Kanban, Team Facilitation, JIRA, Servant Leadership, Coaching",
                30,
                48,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                1,
                "- Thúc đẩy và duy trì văn hóa Agile/Scrum bài bản cho các nhóm phát triển phần mềm dự án Thụy Sĩ.\\n- Điều phối hiệu quả các buổi lễ Scrum: Sprint Planning, Daily Scrum, Sprint Review và Sprint Retrospective.\\n- Nhận diện và chủ động tháo gỡ các trở ngại (Blockers/Impediments) cản trở tiến độ của nhóm phát triển.\\n- Huấn luyện các thành viên áp dụng tư duy tự tổ chức (Self-Organizing) và tinh thần cải tiến liên tục.",
                "- Tối thiểu 3 năm kinh nghiệm thực tế ở vai trò Scrum Master toàn thời gian trong các dự án phần mềm.\\n- Sở hữu chứng chỉ quốc tế CSM (Certified Scrum Master) hoặc PSM I/II.\\n- Nắm vững phong cách Lãnh đạo phục vụ (Servant Leadership) và kỹ năng điều phối cuộc họp cuốn hút.\\n- Tiếng Anh thành thạo cả 4 kỹ năng trong môi trường làm việc đa văn hóa quốc tế."
        ));
        list.add(new JobSeedItem(
                "techasia",
                "Junior UI/UX Designer",
                "Figma, UI Design, Wireframing, Prototyping, Responsive Web, Mobile App Design",
                12,
                19,
                "Junior",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Thiết kế giao diện ứng dụng web và mobile cho các sản phẩm thương mại điện tử theo chỉ dẫn của Art Director.\\n- Tạo các bản vẽ phác thảo (Wireframe), sơ đồ luồng người dùng (User Flow) và bản mẫu tương tác (Prototype).\\n- Xuất tài nguyên hình ảnh, biểu tượng và hỗ trợ lập trình viên chuyển đổi thiết kế thành mã nguồn chuẩn xác.\\n- Cập nhật và tuân thủ các quy tắc trong Design System hiện có của công ty.",
                "- Tối thiểu 1 năm kinh nghiệm thiết kế giao diện UI/UX cho Web hoặc Ứng dụng di động.\\n- Sử dụng thành thạo phần mềm thiết kế Figma và các công cụ đồ họa bổ trợ (Photoshop, Illustrator).\\n- Có Portfolio thể hiện tư duy thiết kế hiện đại, bố cục rõ ràng và thẩm mỹ tốt.\\n- Ham học hỏi, cầu thị và có tinh thần tiếp thu các ý kiến đóng góp xây dựng."
        ));
        list.add(new JobSeedItem(
                "grab",
                "Lead Product Designer",
                "Product Design, UX Strategy, Design Systems, User Research, Mentorship, Data-Driven Design",
                50,
                80,
                "Lead",
                "TP.HCM",
                "Toàn thời gian",
                1,
                "- Lãnh đạo định hướng thiết kế trải nghiệm người dùng cho các siêu tính năng GrabFood và GrabMart tại Đông Nam Á.\\n- Kết hợp hài hòa giữa dữ liệu định lượng (Metrics, Phân tích hành vi) và nghiên cứu định tính (User Research).\\n- Xây dựng các tiêu chuẩn thiết kế đột phá, nâng tầm vị thế thương hiệu Grab trên thị trường công nghệ.\\n- Đào tạo, phát triển và cố vấn nghề nghiệp cho đội ngũ hơn 10 nhà thiết kế sản phẩm tài năng.",
                "- Tối thiểu 6 năm kinh nghiệm thiết kế sản phẩm số quy mô lớn và ít nhất 2 năm ở vị trí Lead/Principal Designer.\\n- Portfolio xuất sắc thể hiện tầm nhìn chiến lược, khả năng giải quyết các bài toán UX phức tạp đa quốc gia.\\n- Kỹ năng lãnh đạo, thuyết trình và tạo ảnh hưởng sâu rộng đến các quyết định chiến lược của ban lãnh đạo.\\n- Khả năng giao tiếp tiếng Anh ở cấp độ chuyên nghiệp cao nhất."
        ));
        list.add(new JobSeedItem(
                "fpt",
                "IT Project Manager (PMP)",
                "Project Management, PMP, Risk Management, Budgeting, Client Facing, Agile, CMMI",
                35,
                55,
                "Senior",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Chịu trách nhiệm toàn diện về quản lý phạm vi, tiến độ, chi phí và chất lượng cho các dự án phần mềm triệu đô.\\n- Quản trị rủi ro dự án (Risk Management), lập kế hoạch ứng phó sự cố và phân bổ nguồn lực kỹ sư tối ưu.\\n- Làm đầu mối liên lạc chính, báo cáo tiến độ định kỳ và xây dựng mối quan hệ tin cậy với khách hàng Hoa Kỳ/Châu Âu.\\n- Đảm bảo quy trình sản xuất phần mềm tuân thủ nghiêm ngặt các chứng chỉ quốc tế CMMI Level 5.",
                "- Tối thiểu 4-5 năm kinh nghiệm quản lý dự án công nghệ thông tin (IT Project Manager).\\n- Bắt buộc sở hữu chứng chỉ quốc tế PMP (Project Management Professional) hoặc PMI-ACP.\\n- Khả năng giao tiếp tiếng Anh lưu loát, năng lực xử lý xung đột và đàm phán hợp đồng xuất sắc.\\n- Am hiểu cả hai mô hình phát triển phần mềm: Agile/Scrum và Waterfall cổ điển."
        ));
        list.add(new JobSeedItem(
                "cmc",
                "Senior Penetration Tester (Ethical Hacker)",
                "Penetration Testing, Ethical Hacking, Burp Suite, Web Security, Kali Linux, OWASP, Metasploit",
                35,
                60,
                "Senior",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Thực hiện các cuộc tấn công thử nghiệm (Penetration Testing) vào hệ thống ứng dụng Web, Mobile và Mạng doanh nghiệp.\\n- Sử dụng các công cụ chuyên sâu (Burp Suite Pro, Metasploit, Nmap, Nessus) kết hợp dò tìm lỗ hổng thủ công (Manual Exploitation).\\n- Lập báo cáo chi tiết về mức độ nghiêm trọng của lỗ hổng và hướng dẫn lập trình viên biện pháp vá lỗi hiệu quả.\\n- Tham gia các chiến dịch tấn công giả lập quy mô lớn (Red Teaming Exercises) cho các tổ chức tài chính.",
                "- Tối thiểu 3-4 năm kinh nghiệm thực chiến trong lĩnh vực kiểm thử xâm nhập (PenTest) và an toàn thông tin.\\n- Sở hữu các chứng chỉ bảo mật uy tín quốc tế như OSCP (Offensive Security Certified Professional), CEH hoặc GPEN.\\n- Hiểu sâu sắc về các lỗ hổng theo danh mục OWASP Top 10 và các kỹ thuật tấn công leo thang đặc quyền.\\n- Đạo đức nghề nghiệp trong sáng, tinh thần kỷ luật và tuân thủ pháp luật tuyệt đối."
        ));
        list.add(new JobSeedItem(
                "viettel",
                "SOC Security Analyst (L2/L3)",
                "SOC, SIEM, Splunk, Incident Response, Threat Hunting, Network Security, Wireshark",
                25,
                40,
                "Middle",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Giám sát và phân tích các sự kiện an ninh thông tin 24/7 trên hệ thống SIEM (Splunk, IBM QRadar).\\n- Phân loại mức độ cảnh báo, điều tra dấu hiệu tấn công mạng và kích hoạt quy trình ứng cứu sự cố (Incident Response).\\n- Thực hiện săn lùng mối đe dọa (Threat Hunting) nhằm phát hiện các mã độc ẩn nấp sâu trong mạng nội bộ.\\n- Xây dựng các luật cảnh báo (Correlation Rules) thông minh nhằm giảm thiểu tỷ lệ báo động giả (False Positives).",
                "- Từ 2-3 năm kinh nghiệm làm việc tại Trung tâm Giám sát an toàn thông tin (SOC) cấp độ L2 trở lên.\\n- Thành thạo phân tích gói tin mạng với Wireshark/Tcpdump và đọc hiểu nhật ký log máy chủ.\\n- Có các chứng chỉ chuyên ngành như CompTIA Security+, CySA+, CEH hoặc tương đương.\\n- Khả năng làm việc ca kíp theo lịch trực và tinh thần cảnh giác bảo mật cao độ."
        ));
        list.add(new JobSeedItem(
                "vng",
                "Information Security Compliance Specialist (ISO 27001)",
                "ISO 27001, PCI-DSS, Security Audit, Risk Assessment, Compliance, GDPR",
                24,
                38,
                "Middle",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Xây dựng, vận hành và đánh giá hệ thống quản lý an toàn thông tin theo tiêu chuẩn quốc tế ISO/IEC 27001.\\n- Điều phối các hoạt động kiểm toán tuân thủ bảo mật thanh toán thẻ PCI-DSS cho các dịch vụ tài chính.\\n- Đánh giá rủi ro an ninh thông tin (Security Risk Assessment) định kỳ cho các hệ thống phần mềm mới trước khi Golive.\\n- Xây dựng các chính sách, quy định an toàn thông tin và tổ chức các chương trình đào tạo nâng cao nhận thức nội bộ.",
                "- Từ 2-3 năm kinh nghiệm trong lĩnh vực quản trị rủi ro và tuân thủ an toàn thông tin (GRC).\\n- Nắm vững các tiêu chuẩn an ninh thông tin quốc tế: ISO 27001, PCI-DSS, NIST Cybersecurity Framework.\\n- Có chứng chỉ ISO 27001 Lead Auditor hoặc CISA/CISM là lợi thế rất lớn.\\n- Kỹ năng viết quy trình, tài liệu chính sách và khả năng đàm phán với các đoàn kiểm toán độc lập."
        ));
        list.add(new JobSeedItem(
                "nab",
                "Cloud Security Engineer (AWS / Azure)",
                "Cloud Security, AWS IAM, GuardDuty, Terraform, Kubernetes Security, CIS Benchmarks",
                42,
                68,
                "Senior",
                "TP.HCM",
                "Toàn thời gian",
                2,
                "- Thiết kế và áp dụng các chính sách an toàn bảo mật trên toàn bộ hạ tầng AWS Cloud của ngân hàng NAB.\\n- Cấu hình và giám sát các dịch vụ bảo mật thông minh của AWS: IAM, GuardDuty, Security Hub, KMS, Macie.\\n- Triển khai các biện pháp tăng cường bảo mật cụm Kubernetes (K8s Hardening) và bảo mật chuỗi cung ứng phần mềm.\\n- Tham gia đánh giá kiến trúc kỹ thuật của các dự án công nghệ mới dưới góc độ an toàn thông tin.",
                "- Tối thiểu 4 năm kinh nghiệm về Cloud & Infrastructure với sự tập trung chuyên sâu vào bảo mật đám mây.\\n- Bắt buộc sở hữu chứng chỉ AWS Certified Security - Specialty hoặc tương đương.\\n- Hiểu biết sâu sắc về mã hóa dữ liệu (Encryption at Rest and in Transit) và quản lý danh tính (IAM).\\n- Tiếng Anh giao tiếp và làm việc chuyên nghiệp chuẩn ngân hàng quốc tế."
        ));
        list.add(new JobSeedItem(
                "vnpt",
                "Network & Firewall Security Engineer",
                "Network Security, Fortinet, Cisco, Palo Alto, VPN, Routing, Switching, CCNA",
                20,
                32,
                "Middle",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Cấu hình, quản trị và tối ưu hóa hệ thống tường lửa thế hệ mới (Next-Gen Firewall: Fortinet, Palo Alto, Cisco ASA).\\n- Thiết lập các đường truyền mạng riêng ảo bảo mật (IPsec VPN, SSL VPN) kết nối liên tỉnh an toàn.\\n- Giám sát lưu lượng mạng, phát hiện và ngăn chặn các hành vi xâm nhập trái phép thông qua hệ thống IPS/IDS.\\n- Phối hợp xử lý sự cố đứt gãy đường truyền và phục hồi kết nối dịch vụ trong thời gian ngắn nhất.",
                "- Từ 2-3 năm kinh nghiệm trong lĩnh vực quản trị hạ tầng mạng và bảo mật mạng doanh nghiệp.\\n- Có chứng chỉ mạng quốc tế CCNA/CCNP Security hoặc chứng chỉ tường lửa chuyên dụng (NSE 4/5/6).\\n- Hiểu biết sâu sắc về các giao thức mạng (TCP/IP, BGP, OSPF, VLAN, NAT, DNS).\\n- Tinh thần trách nhiệm cao, sẵn sàng hỗ trợ kỹ thuật khi có sự cố khẩn cấp."
        ));
        list.add(new JobSeedItem(
                "line",
                "Application Security Engineer (AppSec)",
                "AppSec, Code Review, SAST, DAST, Threat Modeling, Cryptography, Secure SDLC",
                38,
                60,
                "Senior",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Tích hợp các quy chuẩn bảo mật vào toàn bộ quy trình phát triển phần mềm (Secure SDLC) của tập đoàn LINE.\\n- Thực hiện đánh giá kiến trúc mô hình hóa mối đe dọa (Threat Modeling) cho các tính năng mới trước khi viết mã.\\n- Trực tiếp thực hiện rà soát mã nguồn (Security Code Review) các ngôn ngữ Java, Kotlin, Swift, Golang.\\n- Nghiên cứu và áp dụng các giải pháp mã hóa đầu cuối (End-to-End Encryption - E2EE) cho dịch vụ nhắn tin.",
                "- Tối thiểu 3-4 năm kinh nghiệm trong lĩnh vực Application Security (AppSec) hoặc Software Engineer chuyển sang bảo mật.\\n- Có nền tảng lập trình tốt, khả năng đọc hiểu mã nguồn nhiều ngôn ngữ và chỉ ra chính xác dòng code dễ tổn thương.\\n- Hiểu biết sâu sắc về mật mã học ứng dụng (Applied Cryptography, TLS/SSL, PKI) và bảo vệ dữ liệu cá nhân.\\n- Tiếng Anh thành thạo, khả năng phối hợp hiệu quả với các chuyên gia bảo mật quốc tế."
        ));
        list.add(new JobSeedItem(
                "topstech",
                "Junior Cyber Security Analyst",
                "Cyber Security, Linux, Networking, Vulnerability Scanning, Python, Git",
                13,
                20,
                "Junior",
                "Hà Nội",
                "Toàn thời gian",
                2,
                "- Thực hiện quét lỗ hổng bảo mật định kỳ cho các thiết bị phần cứng thông minh và máy chủ đám mây của công ty.\\n- Hỗ trợ kiểm thử bảo mật các giao diện web cấu hình thiết bị và API điều khiển.\\n- Cập nhật các bản vá bảo mật (Security Patches) cho hệ điều hành Linux trên các thiết bị hiện trường.\\n- Viết các script tự động hóa kiểm tra an ninh cơ bản bằng ngôn ngữ Python.",
                "- Tối thiểu 1 năm kinh nghiệm làm việc hoặc nghiên cứu trong lĩnh vực An toàn thông tin.\\n- Nắm vững kiến thức căn bản về hệ điều hành Linux, mạng máy tính và mô hình OSI.\\n- Biết lập trình script Python cơ bản và sử dụng các công cụ như Nmap, Wireshark, OpenVAS.\\n- Đam mê lĩnh vực bảo mật, trung thực, cẩn thận và có ý thức bảo vệ tài sản thông tin."
        ));
        return list;
    }
}
