package com.fit.project.repository;

import com.fit.project.entity.TokenWallet;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TokenWalletRepository extends JpaRepository<TokenWallet, Integer> {

    Optional<TokenWallet> findByUserId(Integer userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM TokenWallet w WHERE w.user.id = :userId")
    Optional<TokenWallet> findByUserIdForUpdate(@Param("userId") Integer userId);
}
