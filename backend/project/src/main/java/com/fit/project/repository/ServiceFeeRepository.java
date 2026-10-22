package com.fit.project.repository;

import com.fit.project.entity.ServiceFee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceFeeRepository extends JpaRepository<ServiceFee, Integer> {

    Optional<ServiceFee> findByFeatureKey(String featureKey);

    List<ServiceFee> findByIsActiveTrue();
}
