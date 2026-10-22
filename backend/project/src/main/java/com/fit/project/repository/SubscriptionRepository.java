package com.fit.project.repository;

import com.fit.project.entity.Subscription;
import com.fit.project.enums.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Integer> {

    Optional<Subscription> findByOrderId(Integer orderId);

    List<Subscription> findByEmployerIdAndStatus(Integer employerId, SubscriptionStatus status);

    Optional<Subscription> findFirstByEmployerIdAndStatusOrderByEndAtDesc(Integer employerId, SubscriptionStatus status);
}
