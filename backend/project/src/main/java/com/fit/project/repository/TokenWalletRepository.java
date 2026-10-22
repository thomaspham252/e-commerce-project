package com.fit.project.repository;

import com.fit.project.entity.TokenWallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TokenWalletRepository extends JpaRepository<TokenWallet, Integer> {
    Optional<TokenWallet> findByUserId(Integer userId);
}
