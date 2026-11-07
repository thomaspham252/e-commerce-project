package com.fit.project.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Bản ghi ghi nhận lượt xem hồ sơ ứng viên của Nhà tuyển dụng theo chu kỳ gói dịch vụ.
 * Ràng buộc unique (subscription_id, candidate_id) đảm bảo không trừ lặp lượt xem trong cùng 1 gói.
 */
@Entity
@Table(
    name = "candidate_profile_views",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_profile_views_sub_candidate", columnNames = {"subscription_id", "candidate_id"})
    },
    indexes = {
        @Index(name = "idx_profile_views_candidate_id", columnList = "candidate_id"),
        @Index(name = "idx_profile_views_viewed_by", columnList = "viewed_by")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateProfileView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subscription_id", nullable = false)
    private Subscription subscription;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "candidate_id", nullable = false)
    private CandidateProfile candidate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "viewed_by", nullable = false)
    private User viewedBy;

    @Column(name = "viewed_at", nullable = false, updatable = false)
    private LocalDateTime viewedAt;

    @PrePersist
    void prePersist() {
        if (viewedAt == null) {
            viewedAt = LocalDateTime.now();
        }
    }
}
