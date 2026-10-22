package com.fit.project.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Ví số dư Token của người dùng (bảng token_wallets).
 */
@Entity
@Table(name = "token_wallets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenWallet {

    @Id
    @Column(name = "user_id")
    private Integer userId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    @Builder.Default
    private Integer balance = 0;
}
