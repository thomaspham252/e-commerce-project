package com.fit.project.config;

import com.fit.project.entity.*;
import com.fit.project.entity.Package;
import com.fit.project.enums.*;
import com.fit.project.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Random;

/**
 * Dữ liệu mẫu cho môi trường dev. Chỉ chạy khi bảng users đang trống.
 * Tắt bằng app.seed.enabled=false.
 * Thứ tự tạo cố định → id: admin = 1, NTD = 2..4, ứng viên = 5..12.
 */
import com.fit.project.entity.ServiceFee;
import com.fit.project.repository.ServiceFeeRepository;
import com.fit.project.repository.CompanyReviewRepository;
import com.fit.project.repository.ReviewReplyRepository;
import com.fit.project.entity.CompanyReview;
import com.fit.project.entity.ReviewReply;
import com.fit.project.enums.ReviewStatus;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DataSeeder implements CommandLineRunner {

    /** Tài khoản seed dùng mật khẩu development; định dạng {noop} được hỗ trợ cho dữ liệu mẫu. */
    private static final String SAMPLE_PASSWORD = "{noop}123456";

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final CvRepository cvRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository historyRepository;
    private final PackageRepository packageRepository;
    private final TokenPackageRepository tokenPackageRepository;
    private final ServiceFeeRepository serviceFeeRepository;
    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final CompanyReviewRepository reviewRepository;
    private final ReviewReplyRepository replyRepository;
    private final JobCatalogSeeder jobCatalogSeeder;

    private final Random random = new Random(42);
    private final LocalDateTime now = LocalDateTime.now();

    @Override
    @Transactional
    public void run(String... args) {
        seedPackagesIfEmpty();
        seedChatIfEmpty();
        seedReviewsIfEmpty();
        jobCatalogSeeder.seedCompaniesAndJobsIfIncomplete();

        if (userRepository.count() > 0) return;

        user("admin@jobportal.vn", UserRole.ADMIN, 200);

        Company techAsia = company(user("hr@techasia.vn", UserRole.EMPLOYER, 170), "TechAsia",
                "0101234567", "Cầu Giấy, Hà Nội", "IT - Phần mềm", "100-499", VerificationStatus.VERIFIED);
        Company fpt = company(user("hr@fptsoft.vn", UserRole.EMPLOYER, 150), "FPT Software",
                "0301234567", "Quận 9, TP.HCM", "IT - Phần mềm", "1000+", VerificationStatus.VERIFIED);
        company(user("contact@newstartup.vn", UserRole.EMPLOYER, 5), "NewStartup",
                "0109876543", "Đống Đa, Hà Nội", "Marketing", "10-49", VerificationStatus.PENDING);

        String[] names = {"Nguyễn Văn An", "Trần Thị Bình", "Lê Văn Cường", "Phạm Minh Dũng",
                "Hoàng Thu Hà", "Vũ Đức Huy", "Đặng Ngọc Lan", "Bùi Quang Minh"};
        List<Cv> cvs = new ArrayList<>();
        for (int i = 0; i < names.length; i++) {
            User u = user("ungvien" + (i + 1) + "@gmail.com", UserRole.CANDIDATE, 160 - i * 20);
            CandidateProfile profile = candidateProfileRepository.save(CandidateProfile.builder()
                    .user(u).fullName(names[i]).phone("09" + (10000000 + i * 1234567)).build());
            cvs.add(cvRepository.save(Cv.builder().candidate(profile)
                    .fileUrl("/uploads/cv/ungvien" + (i + 1) + ".pdf")
                    .fileName("CV_" + names[i].replace(' ', '_') + ".pdf")
                    .isDefault(true).uploadedAt(u.getCreatedAt()).build()));
        }

        List<Job> jobs = List.of(
                job(techAsia, "Frontend Developer (React)", "Hà Nội", 15, 25, "Junior", JobStatus.OPEN, 140),
                job(techAsia, "Backend Developer (Spring Boot)", "Hà Nội", 20, 35, "Senior", JobStatus.OPEN, 110),
                job(techAsia, "QA/Tester", "Hà Nội", 10, 18, "Fresher", JobStatus.CLOSED, 90),
                job(techAsia, "DevOps Engineer", "Hà Nội", 25, 40, "Senior", JobStatus.PENDING_REVIEW, 2),
                job(techAsia, "Thực tập sinh IT", "Hà Nội", 3, 5, "Intern", JobStatus.REJECTED, 20),
                job(fpt, "Java Developer", "TP.HCM", 18, 30, "Junior", JobStatus.OPEN, 100),
                job(fpt, "Business Analyst", "TP.HCM", 20, 32, "Senior", JobStatus.OPEN, 60),
                job(fpt, "UI/UX Designer", "TP.HCM", 12, 22, "Junior", JobStatus.OPEN, 35),
                job(fpt, "Data Engineer", "TP.HCM", 25, 45, "Senior", JobStatus.PENDING_REVIEW, 1));

        ApplicationStatus[] weighted = {ApplicationStatus.PENDING, ApplicationStatus.PENDING, ApplicationStatus.PENDING,
                ApplicationStatus.VIEWED, ApplicationStatus.VIEWED, ApplicationStatus.INVITED,
                ApplicationStatus.REJECTED, ApplicationStatus.HIRED};
        int count = 0;
        for (Job job : jobs) {
            if (job.getStatus() != JobStatus.OPEN && job.getStatus() != JobStatus.CLOSED) continue;
            List<Cv> shuffled = new ArrayList<>(cvs);
            Collections.shuffle(shuffled, random);
            for (Cv cv : shuffled.subList(0, 3 + random.nextInt(5))) {
                long maxDaysAgo = Math.min(75, java.time.Duration.between(job.getCreatedAt(), now).toDays());
                LocalDateTime appliedAt = now.minusDays(random.nextLong(maxDaysAgo + 1)).minusHours(random.nextInt(12));
                ApplicationStatus status = weighted[random.nextInt(weighted.length)];
                Application app = applicationRepository.save(Application.builder()
                        .job(job).candidate(cv.getCandidate()).cv(cv).status(status)
                        .coverLetter("Em rất mong muốn được làm việc tại " + job.getCompany().getName() + ".")
                        .appliedAt(appliedAt).updatedAt(appliedAt).build());
                if (status != ApplicationStatus.PENDING) {
                    historyRepository.save(ApplicationStatusHistory.builder().application(app)
                            .fromStatus(ApplicationStatus.PENDING).toStatus(status)
                            .changedBy(job.getCompany().getOwner()).changedAt(appliedAt.plusDays(1)).build());
                }
                count++;
            }
        }
        log.info("Đã tạo dữ liệu mẫu: {} người dùng, {} tin, {} hồ sơ ứng tuyển",
                userRepository.count(), jobs.size(), count);
    }

    private User user(String email, UserRole role, int daysAgo) {
        return userRepository.save(User.builder().email(email).passwordHash(SAMPLE_PASSWORD).role(role)
                .createdAt(now.minusDays(daysAgo)).build());
    }

    private Company company(User owner, String name, String taxCode, String address, String industry,
                            String size, VerificationStatus status) {
        return companyRepository.save(Company.builder().owner(owner).name(name).legalName("Công ty " + name)
                .taxCode(taxCode).address(address).industry(industry).size(size)
                .description(name + " là doanh nghiệp hoạt động trong lĩnh vực " + industry + ".")
                .verificationStatus(status)
                .verifiedAt(status == VerificationStatus.VERIFIED ? owner.getCreatedAt().plusDays(1) : null)
                .build());
    }

    private Job job(Company company, String title, String location, int minMillion, int maxMillion,
                    String level, JobStatus status, int daysAgo) {
        LocalDateTime createdAt = now.minusDays(daysAgo);
        LocalDate deadline = status == JobStatus.CLOSED ? LocalDate.now().minusDays(5) : LocalDate.now().plusDays(30);
        return jobRepository.save(Job.builder().company(company).title(title).location(location)
                .description("Mô tả công việc " + title + " tại " + company.getName() + ".")
                .requirements("Có kinh nghiệm liên quan, chủ động, làm việc nhóm tốt.")
                .salaryMin(BigDecimal.valueOf(minMillion * 1_000_000L))
                .salaryMax(BigDecimal.valueOf(maxMillion * 1_000_000L))
                .jobType("Toàn thời gian").level(level).vacancies(1 + random.nextInt(3))
                .deadline(deadline).status(status)
                .rejectionReason(status == JobStatus.REJECTED ? "Mức lương và mô tả chưa rõ ràng" : null)
                .reviewedAt(status == JobStatus.OPEN || status == JobStatus.REJECTED ? createdAt.plusDays(1) : null)
                .createdAt(createdAt).updatedAt(createdAt).build());
    }

    private void seedPackagesIfEmpty() {
        if (packageRepository.count() == 0) {
            packageRepository.save(Package.builder().name("Gói Khởi nghiệp (Basic)")
                    .price(BigDecimal.valueOf(500_000)).durationDays(30).jobPostLimit(5).cvViewLimit(20)
                    .includedTokens(20).canHighlightJobs(false).canPrioritizeJobs(false)
                    .canSearchCandidates(true).canDirectContact(true).isActive(true).build());

            packageRepository.save(Package.builder().name("Gói Chuyên nghiệp (Pro)")
                    .price(BigDecimal.valueOf(1_500_000)).durationDays(30).jobPostLimit(20).cvViewLimit(100)
                    .includedTokens(100).canHighlightJobs(true).canPrioritizeJobs(true)
                    .canSearchCandidates(true).canDirectContact(true).isActive(true).build());

            packageRepository.save(Package.builder().name("Gói Doanh nghiệp (Enterprise)")
                    .price(BigDecimal.valueOf(4_000_000)).durationDays(90).jobPostLimit(100).cvViewLimit(500)
                    .includedTokens(300).canHighlightJobs(true).canPrioritizeJobs(true)
                    .canSearchCandidates(true).canDirectContact(true).isActive(true).build());
            log.info("Đã tạo dữ liệu mẫu cho danh mục packages.");
        }

        if (tokenPackageRepository.count() == 0) {
            tokenPackageRepository.save(TokenPackage.builder().tokens(50).price(BigDecimal.valueOf(50_000)).isActive(true).build());
            tokenPackageRepository.save(TokenPackage.builder().tokens(120).price(BigDecimal.valueOf(100_000)).isActive(true).build());
            tokenPackageRepository.save(TokenPackage.builder().tokens(300).price(BigDecimal.valueOf(200_000)).isActive(true).build());
            tokenPackageRepository.save(TokenPackage.builder().tokens(1000).price(BigDecimal.valueOf(500_000)).isActive(true).build());
            log.info("Đã tạo dữ liệu mẫu cho danh mục token_packages.");
        }

        if (serviceFeeRepository.count() == 0) {
            serviceFeeRepository.save(ServiceFee.builder()
                    .featureKey("UNLOCK_CONTACT")
                    .featureName("Mở khóa liên hệ trực tiếp NTD")
                    .tokenCost(30)
                    .badge("Phổ biến")
                    .description("Xem trực tiếp số điện thoại và email riêng của người phụ trách tuyển dụng")
                    .isActive(true)
                    .build());

            serviceFeeRepository.save(ServiceFee.builder()
                    .featureKey("BOOST_CV")
                    .featureName("Đẩy hồ sơ CV lên đầu danh sách")
                    .tokenCost(20)
                    .badge("Hiệu quả")
                    .description("Giữ vị trí ưu tiên cao trong kết quả tìm kiếm ứng viên của NTD trong 72 giờ")
                    .isActive(true)
                    .build());

            serviceFeeRepository.save(ServiceFee.builder()
                    .featureKey("URGENT_APPLY")
                    .featureName("Gắn huy hiệu Ứng tuyển nổi bật")
                    .tokenCost(25)
                    .badge("Ưu tiên")
                    .description("Hồ sơ được đánh dấu sao nổi bật trong hòm thư tuyển dụng của nhà tuyển dụng")
                    .isActive(true)
                    .build());
            log.info("Đã tạo dữ liệu mẫu cho danh mục service_fees.");
        }
    }

    private void seedChatIfEmpty() {
        if (conversationRepository.count() == 0) {
            Optional<User> candidateOpt = userRepository.findByEmailIgnoreCase("ungvien1@gmail.com");
            Optional<Company> companyOpt = companyRepository.findFirstByOwnerIdOrderByIdAsc(2);
            if (candidateOpt.isEmpty() || companyOpt.isEmpty()) {
                return;
            }

            User candidate = candidateOpt.get();
            Company company = companyOpt.get();
            Job job = jobRepository.findAll().stream().findFirst().orElse(null);

            LocalDateTime msgTime1 = LocalDateTime.now().minusMinutes(25);
            LocalDateTime msgTime2 = LocalDateTime.now().minusMinutes(15);
            LocalDateTime msgTime3 = LocalDateTime.now().minusMinutes(5);

            Conversation conv = Conversation.builder()
                    .candidate(candidate)
                    .company(company)
                    .employer(company.getOwner())
                    .job(job)
                    .lastMessage("Dạ em đã làm việc với React hơn 1 năm, sử dụng Redux Toolkit và TailwindCSS trong nhiều dự án thực tế ạ.")
                    .lastMessageAt(msgTime3)
                    .candidateUnreadCount(0)
                    .employerUnreadCount(1)
                    .createdAt(msgTime1)
                    .updatedAt(msgTime3)
                    .build();
            conv = conversationRepository.save(conv);

            chatMessageRepository.save(ChatMessage.builder()
                    .conversation(conv)
                    .sender(candidate)
                    .senderType("CANDIDATE")
                    .content("Chào anh/chị, em thấy công ty đang tuyển vị trí " + (job != null ? job.getTitle() : "này") + ". Em đã gửi hồ sơ và rất mong có cơ hội trao đổi thêm ạ!")
                    .attachmentUrl(null)
                    .isRead(true)
                    .createdAt(msgTime1)
                    .build());

            chatMessageRepository.save(ChatMessage.builder()
                    .conversation(conv)
                    .sender(company.getOwner())
                    .senderType("EMPLOYER")
                    .content("Chào bạn, cảm ơn bạn đã quan tâm. Bạn có thể chia sẻ thêm về kinh nghiệm làm việc thực tế với React không?")
                    .attachmentUrl(null)
                    .isRead(true)
                    .createdAt(msgTime2)
                    .build());

            chatMessageRepository.save(ChatMessage.builder()
                    .conversation(conv)
                    .sender(candidate)
                    .senderType("CANDIDATE")
                    .content("Dạ em đã làm việc với React hơn 1 năm, sử dụng Redux Toolkit và TailwindCSS trong nhiều dự án thực tế ạ.")
                    .attachmentUrl(null)
                    .isRead(false)
                    .createdAt(msgTime3)
                    .build());

            log.info("Đã tạo dữ liệu mẫu cuộc hội thoại và tin nhắn chat giữa {} và {}.", candidate.getEmail(), company.getName());
        }
    }

    private void seedReviewsIfEmpty() {
        if (reviewRepository.count() > 0) return;

        Optional<Company> techAsiaOpt = companyRepository.findFirstByOwnerIdOrderByIdAsc(2);
        Optional<Company> fptOpt = companyRepository.findFirstByOwnerIdOrderByIdAsc(3);
        List<CandidateProfile> candidates = candidateProfileRepository.findAll();

        if (techAsiaOpt.isEmpty() || candidates.size() < 3) return;

        Company techAsia = techAsiaOpt.get();
        CompanyReview r1 = reviewRepository.save(CompanyReview.builder()
                .company(techAsia)
                .candidate(candidates.get(0))
                .rating(5)
                .content("Môi trường làm việc cực kỳ chuyên nghiệp, văn phòng hiện đại và đồng nghiệp thân thiện. Chế độ đãi ngộ rất tốt, văn hóa trao quyền và khuyến khích đổi mới sáng tạo.")
                .status(ReviewStatus.visible)
                .createdAt(now.minusDays(15))
                .build());
        replyRepository.save(ReviewReply.builder()
                .review(r1)
                .employer(techAsia.getOwner())
                .content("Cảm ơn bạn đã luôn đồng hành và đóng góp tích cực cho sự phát triển của TechAsia!")
                .createdAt(now.minusDays(14))
                .build());

        reviewRepository.save(CompanyReview.builder()
                .company(techAsia)
                .candidate(candidates.get(1))
                .rating(5)
                .content("Dự án quy mô lớn, công nghệ mới nhất. Quy trình phát triển Agile/Scrum bài bản, học hỏi được rất nhiều từ các anh chị Tech Lead.")
                .status(ReviewStatus.visible)
                .createdAt(now.minusDays(25))
                .build());

        CompanyReview r3 = reviewRepository.save(CompanyReview.builder()
                .company(techAsia)
                .candidate(candidates.get(2))
                .rating(4)
                .content("Quy trình phỏng vấn nhanh gọn và chuyên nghiệp. HR rất chu đáo và hỗ trợ nhiệt tình từ lúc nhận offer.")
                .status(ReviewStatus.visible)
                .createdAt(now.minusDays(35))
                .build());
        replyRepository.save(ReviewReply.builder()
                .review(r3)
                .employer(techAsia.getOwner())
                .content("Cảm ơn bạn, TechAsia luôn lắng nghe để nâng cao trải nghiệm ứng viên tốt nhất!")
                .createdAt(now.minusDays(34))
                .build());

        if (fptOpt.isPresent()) {
            Company fpt = fptOpt.get();
            CompanyReview fr1 = reviewRepository.save(CompanyReview.builder()
                    .company(fpt)
                    .candidate(candidates.size() > 3 ? candidates.get(3) : candidates.get(0))
                    .rating(5)
                    .content("FPT Software có môi trường quốc tế năng động, nhiều cơ hội onsite Nhật Bản, Mỹ, Châu Âu. Đào tạo nội bộ cực kỳ bài bản.")
                    .status(ReviewStatus.visible)
                    .createdAt(now.minusDays(20))
                    .build());
            replyRepository.save(ReviewReply.builder()
                    .review(fr1)
                    .employer(fpt.getOwner())
                    .content("Cảm ơn bạn đã chia sẻ đánh giá tích cực về môi trường tại FPT Software!")
                    .createdAt(now.minusDays(19))
                    .build());

            reviewRepository.save(CompanyReview.builder()
                    .company(fpt)
                    .candidate(candidates.size() > 4 ? candidates.get(4) : candidates.get(1))
                    .rating(5)
                    .content("Khuôn viên F-Town / F-Ville tuyệt đẹp, nhiều tiện ích thể thao, giải trí. Chế độ lương thưởng minh bạch và đúng hạn.")
                    .status(ReviewStatus.visible)
                    .createdAt(now.minusDays(40))
                    .build());
        }
        log.info("Đã tạo dữ liệu mẫu đánh giá và phản hồi cho các doanh nghiệp.");
    }
}