package com.fit.project.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Thực thể theo dõi các quyền lợi tiện ích ứng tuyển đã cấp cho ứng viên (bảng candidate_benefit_grants).
 * Hỗ trợ cơ chế cộng dồn thời hạn hiệu lực (72h, 7 ngày) và tích lũy quota mở khóa liên hệ/AI Resume Score.
 */
@Entity
@Table(name = "candidate_benefit_grants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateBenefitGrant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Integer userId;

    @Column(name = "boost_cv_expire_at")
    private LocalDateTime boostCvExpireAt;

    @Column(name = "featured_badge_expire_at")
    private LocalDateTime featuredBadgeExpireAt;

    @Column(name = "priority_display_expire_at")
    private LocalDateTime priorityDisplayExpireAt;

    @Column(name = "contact_unlock_quota", nullable = false)
    @Builder.Default
    private Integer contactUnlockQuota = 0;

    @Column(name = "ai_score_quota", nullable = false)
    @Builder.Default
    private Integer aiScoreQuota = 0;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

