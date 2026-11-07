package com.fit.project.service;

import com.fit.project.dto.JobResponse;
import com.fit.project.dto.common.PageResponse;
import com.fit.project.dto.company.*;
import com.fit.project.entity.*;
import com.fit.project.enums.JobStatus;
import com.fit.project.enums.ReviewStatus;
import com.fit.project.enums.VerificationStatus;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyPublicService {

    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final CompanyReviewRepository reviewRepository;
    private final ReviewReplyRepository replyRepository;
    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final ApplicationRepository applicationRepository;

    private static final String ML_SENTIMENT_URL = "http://localhost:8000/api/sentiment/predict";
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(2))
            .build();

    record SentimentResult(String label, Double score) {}

    private SentimentResult predictSentiment(String content, int rating) {
        if (content == null || content.isBlank()) {
            return new SentimentResult("neutral", 0.5);
        }
        try {
            String escaped = content
                    .replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", " ")
                    .replace("\r", " ");
            String jsonBody = "{\"text\":\"" + escaped + "\"}";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(ML_SENTIMENT_URL))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(3))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() == 200) {
                String resp = response.body();
                Matcher labelMatcher = Pattern.compile("\"label\"\\s*:\\s*\"([^\"]+)\"").matcher(resp);
                Matcher scoreMatcher = Pattern.compile("\"score\"\\s*:\\s*([0-9.]+)").matcher(resp);
                String label = labelMatcher.find() ? labelMatcher.group(1) : "neutral";
                double score = scoreMatcher.find() ? Double.parseDouble(scoreMatcher.group(1)) : 0.9;
                log.info("ML Sentiment Prediction for review: label={}, score={}", label, score);
                return new SentimentResult(label, score);
            }
        } catch (Exception e) {
            log.warn("ML Service sentiment call failed or timed out: {}. Using fallback based on rating.", e.getMessage());
        }

        // Graceful fallback based on rating
        if (rating >= 4) {
            return new SentimentResult("positive", 0.88);
        } else if (rating == 3) {
            return new SentimentResult("neutral", 0.75);
        } else {
            return new SentimentResult("negative", 0.88);
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<CompanySummaryResponse> getPublicCompanies(
            String keyword,
            String industry,
            String location,
            int page,
            int size
    ) {
        return getPublicCompanies(keyword, industry, location, null, null, "latest", page, size);
    }

    @Transactional(readOnly = true)
    public PageResponse<CompanySummaryResponse> getPublicCompanies(
            String keyword,
            String industry,
            String location,
            String companySize,
            String status,
            String sort,
            int page,
            int size
    ) {
        String kwPattern = (keyword != null && !keyword.isBlank()) ? "%" + keyword.trim().toLowerCase() + "%" : null;
        String indPattern = (industry != null && !industry.isBlank() && !industry.equalsIgnoreCase("all"))
                ? "%" + industry.trim().toLowerCase() + "%" : null;

        String locPattern = null;
        if (location != null && !location.isBlank() && !location.equalsIgnoreCase("all")) {
            String loc = location.trim().toLowerCase();
            if (loc.contains("hcm") || loc.contains("hồ chí minh")) {
                locPattern = "%hcm%";
            } else if (loc.contains("hà nội")) {
                locPattern = "%hà nội%";
            } else if (loc.contains("đà nẵng")) {
                locPattern = "%đà nẵng%";
            } else if (loc.contains("cần thơ")) {
                locPattern = "%cần thơ%";
            } else {
                locPattern = "%" + loc + "%";
            }
        }

        VerificationStatus vStatus = null;
        if ("verified".equalsIgnoreCase(status)) {
            vStatus = VerificationStatus.VERIFIED;
        }

        List<Company> allMatching = companyRepository.findAllPublicCompanies(kwPattern, indPattern, locPattern, vStatus);

        if (companySize != null && !companySize.isBlank() && !companySize.equalsIgnoreCase("all")) {
            String targetSize = companySize.trim();
            allMatching = allMatching.stream()
                    .filter(c -> c.getSize() != null && c.getSize().contains(targetSize))
                    .toList();
        }

        List<CompanySummaryResponse> responses = new ArrayList<>(allMatching.stream().map(c -> {
            long openJobsCount = jobRepository.countByCompanyIdAndStatus(c.getId(), JobStatus.OPEN);
            long reviewCount = reviewRepository.countByCompanyIdAndStatus(c.getId(), ReviewStatus.visible);
            Double avg = reviewRepository.calculateAverageRating(c.getId(), ReviewStatus.visible);
            Double rating = (reviewCount > 0 && avg != null) ? Math.round(avg * 10.0) / 10.0 : null;
            return CompanySummaryResponse.of(c, openJobsCount, rating, reviewCount);
        }).toList());

        if ("high_rating".equalsIgnoreCase(status)) {
            responses.removeIf(c -> c.rating() == null || c.rating() < 4.5);
        } else if ("has_jobs".equalsIgnoreCase(status)) {
            responses.removeIf(c -> c.openJobsCount() <= 0);
        }

        String sortType = sort != null ? sort.trim().toLowerCase() : "latest";
        switch (sortType) {
            case "rating_desc" -> responses.sort((a, b) -> {
                double rA = a.rating() != null ? a.rating() : 0.0;
                double rB = b.rating() != null ? b.rating() : 0.0;
                return Double.compare(rB, rA);
            });
            case "jobs_desc" -> responses.sort((a, b) -> Long.compare(b.openJobsCount(), a.openJobsCount()));
            case "name_asc" -> responses.sort((a, b) -> a.name().compareToIgnoreCase(b.name()));
            default -> responses.sort((a, b) -> Integer.compare(b.id(), a.id()));
        }

        int totalElements = responses.size();
        int pageSize = Math.max(1, size);
        int totalPages = Math.max(1, (int) Math.ceil((double) totalElements / pageSize));
        int currentPage = Math.max(0, Math.min(page, totalPages - 1));

        int fromIndex = Math.min(currentPage * pageSize, totalElements);
        int toIndex = Math.min(fromIndex + pageSize, totalElements);
        List<CompanySummaryResponse> pagedContent = responses.subList(fromIndex, toIndex);

        return new PageResponse<>(pagedContent, currentPage, pageSize, totalElements, totalPages);
    }

    @Transactional(readOnly = true)
    public CompanyDetailResponse getCompanyDetail(Integer id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy doanh nghiệp có id: " + id));

        List<Job> openJobsList = jobRepository.findByCompanyIdAndStatus(id, JobStatus.OPEN);
        List<JobResponse> openJobs = openJobsList.stream().map(j -> {
            long appCount = applicationRepository.countByJobId(j.getId());
            return JobResponse.of(j, appCount);
        }).toList();

        List<CompanyReview> reviewsList = reviewRepository.findByCompanyIdAndStatusOrderByCreatedAtDesc(id, ReviewStatus.visible);
        List<CompanyReviewResponse> reviews = reviewsList.stream().map(CompanyReviewResponse::of).toList();

        long reviewCount = reviewsList.size();
        Double avg = reviewRepository.calculateAverageRating(id, ReviewStatus.visible);
        Double rating = (reviewCount > 0 && avg != null) ? Math.round(avg * 10.0) / 10.0 : null;

        Map<Integer, Long> breakdown = new HashMap<>();
        for (int i = 1; i <= 5; i++) breakdown.put(i, 0L);
        for (CompanyReview r : reviewsList) {
            int score = Math.max(1, Math.min(5, r.getRating()));
            breakdown.put(score, breakdown.get(score) + 1);
        }

        long positiveReviews = breakdown.get(4) + breakdown.get(5);
        Integer recommendRate = reviewCount > 0 ? (int) Math.round((double) positiveReviews * 100.0 / reviewCount) : null;

        return new CompanyDetailResponse(
                company.getId(),
                company.getName(),
                company.getLegalName(),
                company.getTaxCode(),
                company.getLogo(),
                company.getIndustry(),
                company.getSize(),
                company.getAddress(),
                company.getDescription(),
                company.getWebsite(),
                company.getVerificationStatus(),
                rating,
                reviewCount,
                recommendRate,
                breakdown,
                openJobs,
                reviews
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<CompanyReviewResponse> getReviews(Integer companyId, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<CompanyReview> reviewPage = reviewRepository.findByCompanyIdAndStatus(companyId, ReviewStatus.visible, pageable);
        List<CompanyReviewResponse> content = reviewPage.getContent().stream().map(CompanyReviewResponse::of).toList();
        return new PageResponse<>(content, reviewPage.getNumber(), reviewPage.getSize(),
                reviewPage.getTotalElements(), reviewPage.getTotalPages());
    }

    @Transactional
    public CompanyReviewResponse createReview(Integer userId, Integer companyId, CreateReviewRequest req) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy doanh nghiệp có id: " + companyId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.badRequest("Tài khoản người dùng không hợp lệ"));

        CandidateProfile profile = candidateProfileRepository.findById(userId)
                .orElseGet(() -> {
                    String defaultName = user.getEmail().split("@")[0];
                    return candidateProfileRepository.save(CandidateProfile.builder()
                            .user(user)
                            .fullName(defaultName)
                            .build());
                });

        // Tự động phân loại cảm xúc bằng mô hình AI PhoBERT
        SentimentResult sentiment = predictSentiment(req.content(), req.rating());

        CompanyReview review = CompanyReview.builder()
                .company(company)
                .candidate(profile)
                .rating(req.rating())
                .content(req.content().trim())
                .sentimentLabel(sentiment.label())
                .sentimentScore(sentiment.score())
                .status(ReviewStatus.visible)
                .build();

        CompanyReview saved = reviewRepository.save(review);
        return CompanyReviewResponse.of(saved);
    }

    @Transactional
    public CompanyReviewResponse replyReview(Integer userId, Integer companyId, Integer reviewId, CreateReplyRequest req) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy doanh nghiệp có id: " + companyId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.badRequest("Tài khoản người dùng không hợp lệ"));

        if (!company.getOwner().getId().equals(user.getId())) {
            throw ApiException.forbidden("Chỉ người đại diện doanh nghiệp mới có quyền phản hồi đánh giá này");
        }

        CompanyReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy đánh giá"));

        if (!review.getCompany().getId().equals(companyId)) {
            throw ApiException.badRequest("Đánh giá không thuộc doanh nghiệp này");
        }

        ReviewReply reply = replyRepository.findByReviewId(reviewId)
                .orElseGet(() -> ReviewReply.builder().review(review).employer(user).build());

        reply.setContent(req.content().trim());
        replyRepository.save(reply);
        review.setReply(reply);

        return CompanyReviewResponse.of(review);
    }

    @Transactional(readOnly = true)
    public EmployerReviewsSummaryResponse getEmployerReviews(
            Integer userId,
            Integer rating,
            String replyStatus,
            String sentiment,
            String keyword,
            int page,
            int size
    ) {
        Company company = companyRepository.findFirstByOwnerIdOrderByIdAsc(userId)
                .orElseThrow(() -> ApiException.badRequest("Doanh nghiệp của bạn chưa tạo hồ sơ công ty"));

        Integer companyId = company.getId();
        String kwPattern = (keyword != null && !keyword.isBlank()) ? "%" + keyword.trim().toLowerCase() + "%" : null;
        String repStatus = (replyStatus != null && !replyStatus.isBlank() && !replyStatus.equalsIgnoreCase("all"))
                ? replyStatus.trim().toLowerCase() : null;
        String sentParam = (sentiment != null && !sentiment.isBlank() && !sentiment.equalsIgnoreCase("all"))
                ? sentiment.trim().toLowerCase() : null;

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<CompanyReview> reviewPage = reviewRepository.searchEmployerReviews(
                companyId,
                ReviewStatus.visible,
                rating,
                repStatus,
                sentParam,
                kwPattern,
                pageable
        );

        List<CompanyReviewResponse> content = reviewPage.getContent().stream().map(CompanyReviewResponse::of).toList();
        PageResponse<CompanyReviewResponse> pagedReviews = new PageResponse<>(
                content,
                reviewPage.getNumber(),
                reviewPage.getSize(),
                reviewPage.getTotalElements(),
                reviewPage.getTotalPages()
        );

        long totalReviews = reviewRepository.countByCompanyIdAndStatus(companyId, ReviewStatus.visible);
        Double avg = reviewRepository.calculateAverageRating(companyId, ReviewStatus.visible);
        double avgRating = avg != null ? Math.round(avg * 10.0) / 10.0 : 5.0;
        long repliedCount = reviewRepository.countRepliedReviews(companyId, ReviewStatus.visible);
        long unrepliedCount = Math.max(0, totalReviews - repliedCount);
        int responseRate = totalReviews > 0 ? (int) Math.round((double) repliedCount * 100.0 / totalReviews) : 100;

        // Thống kê phân bổ sao
        Map<Integer, Long> breakdown = new HashMap<>();
        for (int i = 1; i <= 5; i++) breakdown.put(i, 0L);
        List<Object[]> groups = reviewRepository.countGroupByRating(companyId, ReviewStatus.visible);
        for (Object[] g : groups) {
            if (g[0] != null && g[1] != null) {
                int score = ((Number) g[0]).intValue();
                long c = ((Number) g[1]).longValue();
                breakdown.put(score, c);
            }
        }

        // Thống kê phân bổ cảm xúc AI (Positive, Neutral, Negative)
        Map<String, Long> sentBreakdown = new HashMap<>();
        sentBreakdown.put("positive", 0L);
        sentBreakdown.put("neutral", 0L);
        sentBreakdown.put("negative", 0L);
        List<Object[]> sentGroups = reviewRepository.countGroupBySentimentLabel(companyId, ReviewStatus.visible);
        for (Object[] g : sentGroups) {
            if (g[0] != null && g[1] != null) {
                String lbl = g[0].toString().toLowerCase();
                long c = ((Number) g[1]).longValue();
                sentBreakdown.put(lbl, c);
            }
        }

        return EmployerReviewsSummaryResponse.builder()
                .companyId(companyId)
                .companyName(company.getName())
                .averageRating(avgRating)
                .totalReviews(totalReviews)
                .repliedCount(repliedCount)
                .unrepliedCount(unrepliedCount)
                .responseRate(responseRate)
                .ratingBreakdown(breakdown)
                .sentimentBreakdown(sentBreakdown)
                .reviews(pagedReviews)
                .build();
    }

    @Transactional
    public void deleteReply(Integer userId, Integer reviewId) {
        CompanyReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy đánh giá"));

        Company company = review.getCompany();
        if (!company.getOwner().getId().equals(userId)) {
            throw ApiException.forbidden("Bạn không có quyền xóa phản hồi của doanh nghiệp này");
        }

        if (review.getReply() != null) {
            ReviewReply reply = review.getReply();
            review.setReply(null);
            replyRepository.delete(reply);
            reviewRepository.save(review);
        }
    }
}
