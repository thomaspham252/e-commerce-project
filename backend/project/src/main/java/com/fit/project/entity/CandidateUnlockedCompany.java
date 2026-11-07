package com.fit.project.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Thực thể nhật ký các công ty nhà tuyển dụng mà ứng viên đã mở khóa thông tin liên hệ / chat trực tiếp.
 */
@Entity
@Table(
    name = "candidate_unlocked_companies",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"candidate_user_id", "company_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateUnlockedCompany {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_user_id", nullable = false)
    private Integer candidateUserId;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "unlocked_at", nullable = false)
    @Builder.Default
    private LocalDateTime unlockedAt = LocalDateTime.now();
}

