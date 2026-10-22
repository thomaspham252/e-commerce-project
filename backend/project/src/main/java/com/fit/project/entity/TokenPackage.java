package com.fit.project.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Gói nạp Token bán lẻ cho ứng viên (bảng token_packages).
 */
@Entity
@Table(name = "token_packages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private Integer tokens;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "bonus_tokens")
    @Builder.Default
    private Integer bonusTokens = 0;

    @Column(name = "badge_label", length = 100)
    private String badgeLabel;

    @Column(length = 500)
    private String description;

    @Column(name = "is_popular")
    @Builder.Default
    private Boolean isPopular = false;
}
