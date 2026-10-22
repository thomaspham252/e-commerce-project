package com.fit.project.repository;

import com.fit.project.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    Optional<Payment> findByGatewayAndTransactionCode(String gateway, String transactionCode);

    boolean existsByGatewayAndTransactionCode(String gateway, String transactionCode);

    Page<Payment> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
