package com.fit.project.repository;

import com.fit.project.entity.TokenTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TokenTransactionRepository extends JpaRepository<TokenTransaction, Integer> {

    Optional<TokenTransaction> findByIdempotencyKey(String idempotencyKey);

    boolean existsByIdempotencyKey(String idempotencyKey);

    Page<TokenTransaction> findByWalletUserIdOrderByCreatedAtDesc(Integer userId, Pageable pageable);

    java.util.List<TokenTransaction> findByWalletUserIdOrderByCreatedAtDesc(Integer userId);
}
