package com.fit.project.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "candidate_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateProfile {

    @Id
    @Column(name = "user_id")
    private Integer userId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(length = 20)
    private String phone;

    private LocalDate dob;

    @Column(length = 500)
    private String address;

    @Column(length = 500)
    private String avatar;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "is_searchable", nullable = false)
    @Builder.Default
    private Boolean isSearchable = true;
}
