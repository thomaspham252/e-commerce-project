package com.fit.project.service;

import com.fit.project.dto.candidate.CandidateCvResponse;
import com.fit.project.dto.common.PageResponse;
import com.fit.project.dto.employer.CandidateDetailResponse;
import com.fit.project.dto.employer.CandidateSummaryResponse;
import com.fit.project.entity.CandidateProfile;
import com.fit.project.entity.CandidateProfileView;
import com.fit.project.entity.Subscription;
import com.fit.project.entity.User;
import com.fit.project.enums.SubscriptionStatus;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CandidateSearchService {

    private final CandidateProfileRepository candidateProfileRepository;
    private final CandidateProfileViewRepository candidateProfileViewRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final ApplicationRepository applicationRepository;
    private final CvRepository cvRepository;

    @Transactional(readOnly = true)
    public PageResponse<CandidateSummaryResponse> searchCandidates(User employer, String keyword, String location, Pageable pageable) {
        LocalDateTime now = LocalDateTime.now();
        Subscription activeSub = subscriptionRepository.findInEffect(employer.getId(), SubscriptionStatus.ACTIVE, now)
                .stream().findFirst()
                .orElseThrow(() -> ApiException.forbidden("PACKAGE_REQUIRED: Cần có gói dịch vụ còn hiệu lực để tìm kiếm kho ứng viên"));

        if (!Boolean.TRUE.equals(activeSub.getPackageEntity().getCanSearchCandidates())) {
            throw ApiException.forbidden("FEATURE_NOT_PERMITTED: Gói dịch vụ hiện tại không hỗ trợ quyền tìm kiếm trong kho ứng viên.");
        }

        String kw = QueryUtils.likePattern(keyword);
        String loc = QueryUtils.likePattern(location);

        Page<CandidateProfile> page = candidateProfileRepository.searchCandidates(kw, loc, pageable);

        return PageResponse.of(page, cp -> {
            boolean isUnlocked = applicationRepository.existsByJobCompanyOwnerIdAndCandidateUserId(employer.getId(), cp.getUserId())
                    || candidateProfileViewRepository.existsBySubscriptionIdAndCandidateUserId(activeSub.getId(), cp.getUserId());

            String email = null;
            String phone = null;
            if (isUnlocked) {
                email = cp.getUser() != null ? cp.getUser().getEmail() : null;
                phone = cp.getPhone();
            }
            String cvFileName = cvRepository.findByCandidateUserIdAndIsDefaultTrue(cp.getUserId())
                    .map(com.fit.project.entity.Cv::getFileName)
                    .orElse("CV đính kèm (PDF)");

            return new CandidateSummaryResponse(
                    cp.getUserId(),
                    cp.getFullName(),
                    cp.getAddress(),
                    cp.getSummary(),
                    cp.getAvatar(),
                    isUnlocked,
                    List.of(),
                    "Chuyên viên",
                    email,
                    phone,
                    cvFileName
            );
        });
    }

    @Transactional
    public CandidateDetailResponse getCandidateDetail(User employer, Integer candidateUserId) {
        CandidateProfile cp = candidateProfileRepository.findById(candidateUserId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy hồ sơ ứng viên"));

        boolean hasApplied = applicationRepository.existsByJobCompanyOwnerIdAndCandidateUserId(employer.getId(), candidateUserId);

        if (!hasApplied) {
            LocalDateTime now = LocalDateTime.now();
            Subscription activeSub = subscriptionRepository.findInEffect(employer.getId(), SubscriptionStatus.ACTIVE, now)
                    .stream().findFirst()
                    .orElseThrow(() -> ApiException.forbidden("PACKAGE_REQUIRED: Cần có gói dịch vụ còn hiệu lực để xem hồ sơ ứng viên"));

            if (!Boolean.TRUE.equals(activeSub.getPackageEntity().getCanSearchCandidates())) {
                throw ApiException.forbidden("FEATURE_NOT_PERMITTED: Gói dịch vụ hiện tại không hỗ trợ quyền mở xem hồ sơ ứng viên.");
            }

            boolean alreadyViewed = candidateProfileViewRepository.existsBySubscriptionIdAndCandidateUserId(activeSub.getId(), candidateUserId);
            if (!alreadyViewed) {
                long usedViews = candidateProfileViewRepository.countBySubscriptionId(activeSub.getId());
                int bonusViews = activeSub.getBonusCvViews() != null ? activeSub.getBonusCvViews() : 0;
                Integer limit = activeSub.getPackageEntity().getCvViewLimit() != null
                        ? activeSub.getPackageEntity().getCvViewLimit() + bonusViews : null;
                if (limit != null && usedViews >= limit) {
                    throw ApiException.forbidden("QUOTA_EXCEEDED: Bạn đã sử dụng hết " + limit + " lượt xem hồ sơ của gói hiện tại. Vui lòng nâng cấp gói.");
                }

                CandidateProfileView view = CandidateProfileView.builder()
                        .subscription(activeSub)
                        .candidate(cp)
                        .viewedBy(employer)
                        .viewedAt(now)
                        .build();
                candidateProfileViewRepository.save(view);
            }
        }

        List<CandidateCvResponse> cvs = cvRepository.findByCandidateUserIdOrderByIsDefaultDescUploadedAtDesc(candidateUserId)
                .stream()
                .map(CandidateCvResponse::of)
                .toList();

        User user = cp.getUser();
        return new CandidateDetailResponse(
                cp.getUserId(),
                cp.getFullName(),
                user != null ? user.getEmail() : null,
                cp.getPhone(),
                cp.getAddress(),
                cp.getSummary(),
                cp.getAvatar(),
                cvs,
                true,
                hasApplied
        );
    }
}

