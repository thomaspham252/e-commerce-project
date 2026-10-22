package com.fit.project.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Gói dịch vụ định kỳ dành cho Nhà tuyển dụng (bảng packages).
 */
@Entity
@Table(name = "packages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Package {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @Column(name = "job_post_limit")
    private Integer jobPostLimit;

    @Column(name = "cv_view_limit")
    private Integer cvViewLimit;

    @Column(name = "included_tokens", nullable = false)
    @Builder.Default
    private Integer includedTokens = 0;

    @Column(name = "can_highlight_jobs", nullable = false)
    @Builder.Default
    private Boolean canHighlightJobs = false;

    @Column(name = "can_prioritize_jobs", nullable = false)
    @Builder.Default
    private Boolean canPrioritizeJobs = false;

    @Column(name = "can_search_candidates", nullable = false)
    @Builder.Default
    private Boolean canSearchCandidates = false;

    @Column(name = "can_direct_contact", nullable = false)
    @Builder.Default
    private Boolean canDirectContact = false;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
