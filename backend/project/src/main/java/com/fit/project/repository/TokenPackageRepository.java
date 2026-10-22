package com.fit.project.repository;

import com.fit.project.entity.TokenPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TokenPackageRepository extends JpaRepository<TokenPackage, Integer> {
    List<TokenPackage> findByIsActiveTrue();
}
