package com.fit.project.dto.company;

import com.fit.project.entity.CompanyReview;
import com.fit.project.entity.ReviewReply;

import java.time.LocalDateTime;

public record CompanyReviewResponse(
        Integer id,
        Integer companyId,
        Integer candidateId,
        String candidateName,
        String candidateAvatar,
        Integer rating,
        String content,
        LocalDateTime createdAt,
        ReviewReplyDto reply
) {
    public record ReviewReplyDto(
            Integer id,
            Integer employerId,
            String employerName,
            String content,
            LocalDateTime createdAt
    ) {
        public static ReviewReplyDto of(ReviewReply r) {
            if (r == null) return null;
            String name = r.getEmployer() != null ? r.getEmployer().getEmail() : "Nhà tuyển dụng";
            return new ReviewReplyDto(r.getId(), r.getEmployer() != null ? r.getEmployer().getId() : null, name, r.getContent(), r.getCreatedAt());
        }
    }

    public static CompanyReviewResponse of(CompanyReview r) {
        String name = r.getCandidate() != null ? r.getCandidate().getFullName() : "Ứng viên JobViet";
        String avatar = r.getCandidate() != null ? r.getCandidate().getAvatar() : null;
        return new CompanyReviewResponse(
                r.getId(),
                r.getCompany().getId(),
                r.getCandidate() != null ? r.getCandidate().getUserId() : null,
                name,
                avatar,
                r.getRating(),
                r.getContent(),
                r.getCreatedAt(),
                ReviewReplyDto.of(r.getReply())
        );
    }
}

