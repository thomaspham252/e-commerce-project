package com.fit.project.service;

import com.fit.project.dto.JobResponse;
import com.fit.project.dto.common.PageResponse;
import com.fit.project.dto.company.*;
import com.fit.project.entity.*;
import com.fit.project.enums.JobStatus;
import com.fit.project.enums.ReviewStatus;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

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

    @Transactional(readOnly = true)
    public PageResponse<CompanySummaryResponse> getPublicCompanies(
            String keyword,
            String industry,
            String location,
            int page,
            int size
    ) {
        String kwPattern = (keyword != null && !keyword.isBlank()) ? "%" + keyword.trim().toLowerCase() + "%" : null;
        String indPattern = (industry != null && !industry.isBlank() && !industry.equalsIgnoreCase("all"))
                ? "%" + industry.trim().toLowerCase() + "%" : null;
        String locPattern = (location != null && !location.isBlank() && !location.equalsIgnoreCase("all"))
                ? "%" + location.trim().toLowerCase() + "%" : null;

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(Sort.Direction.DESC, "id"));
        Page<Company> companyPage = companyRepository.searchPublicCompanies(kwPattern, indPattern, locPattern, null, pageable);

        List<CompanySummaryResponse> content = companyPage.getContent().stream().map(c -> {
            long openJobsCount = jobRepository.countByCompanyIdAndStatus(c.getId(), JobStatus.OPEN);
            long reviewCount = reviewRepository.countByCompanyIdAndStatus(c.getId(), ReviewStatus.visible);
            Double avg = reviewRepository.calculateAverageRating(c.getId(), ReviewStatus.visible);
            double rating = avg != null ? Math.round(avg * 10.0) / 10.0 : 4.8;
            return CompanySummaryResponse.of(c, openJobsCount, rating, reviewCount);
        }).toList();

        return new PageResponse<>(content, companyPage.getNumber(), companyPage.getSize(),
                companyPage.getTotalElements(), companyPage.getTotalPages());
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

        Double avg = reviewRepository.calculateAverageRating(id, ReviewStatus.visible);
        double rating = avg != null ? Math.round(avg * 10.0) / 10.0 : 4.8;
        long reviewCount = reviewsList.size();

        Map<Integer, Long> breakdown = new HashMap<>();
        for (int i = 1; i <= 5; i++) breakdown.put(i, 0L);
        for (CompanyReview r : reviewsList) {
            int score = Math.max(1, Math.min(5, r.getRating()));
            breakdown.put(score, breakdown.get(score) + 1);
        }

        long positiveReviews = breakdown.get(4) + breakdown.get(5);
        int recommendRate = reviewCount > 0 ? (int) Math.round((double) positiveReviews * 100.0 / reviewCount) : 98;

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

        CompanyReview review = CompanyReview.builder()
                .company(company)
                .candidate(profile)
                .rating(req.rating())
                .content(req.content().trim())
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

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<CompanyReview> reviewPage = reviewRepository.searchEmployerReviews(
                companyId,
                ReviewStatus.visible,
                rating,
                repStatus,
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

        return EmployerReviewsSummaryResponse.builder()
                .companyId(companyId)
                .companyName(company.getName())
                .averageRating(avgRating)
                .totalReviews(totalReviews)
                .repliedCount(repliedCount)
                .unrepliedCount(unrepliedCount)
                .responseRate(responseRate)
                .ratingBreakdown(breakdown)
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

