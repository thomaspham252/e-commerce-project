package com.fit.project.entity;

import com.fit.project.enums.SubscriptionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Gói đăng ký dịch vụ đang kích hoạt của Nhà tuyển dụng (bảng subscriptions).
 */
@Entity
@Table(
    name = "subscriptions",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_subscriptions_order_id", columnNames = {"order_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", nullable = false)
    private User employer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", nullable = false)
    private Package packageEntity;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;

    @Column(name = "bonus_job_posts", nullable = false)
    @Builder.Default
    private Integer bonusJobPosts = 0;

    @Column(name = "bonus_cv_views", nullable = false)
    @Builder.Default
    private Integer bonusCvViews = 0;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;
}
