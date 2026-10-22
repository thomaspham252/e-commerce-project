package com.fit.project.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Bảng cấu hình biểu phí tiêu thụ Token cho từng tính năng ứng viên (service_fees).
 */
@Entity
@Table(name = "service_fees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceFee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "feature_key", nullable = false, unique = true, length = 50)
    private String featureKey;

    @Column(name = "feature_name", nullable = false, length = 150)
    private String featureName;

    @Column(name = "token_cost", nullable = false)
    private Integer tokenCost;

    @Column(length = 50)
    private String badge;

    @Column(length = 500)
    private String description;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
