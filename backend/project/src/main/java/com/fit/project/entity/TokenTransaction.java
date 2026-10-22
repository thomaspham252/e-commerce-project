package com.fit.project.entity;

import com.fit.project.enums.TokenTransactionType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Biến động số dư Token của ví (bảng token_transactions).
 */
@Entity
@Table(
    name = "token_transactions",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_token_tx_idempotency_key", columnNames = {"idempotency_key"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private TokenWallet wallet;

    @Column(nullable = false, length = 20)
    private TokenTransactionType type;

    @Column(nullable = false)
    private Integer amount;

    @Column(name = "balance_after", nullable = false)
    private Integer balanceAfter;

    @Column(name = "idempotency_key", nullable = false, unique = true, length = 100)
    private String idempotencyKey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(name = "ref_type", length = 50)
    private String refType;

    @Column(name = "ref_id")
    private Integer refId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
