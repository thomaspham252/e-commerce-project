package com.fit.project.repository;

import com.fit.project.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Integer> {

    Optional<EmailVerification> findByUser_Id(Integer userId);

    void deleteByUser_Id(Integer userId);
}
