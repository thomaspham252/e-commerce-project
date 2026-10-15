package com.fit.project.repository;

import com.fit.project.entity.ApplicationStatusHistory;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationStatusHistoryRepository extends JpaRepository<ApplicationStatusHistory, Integer> {

    @EntityGraph(attributePaths = "changedBy")
    List<ApplicationStatusHistory> findByApplicationIdOrderByChangedAtAsc(Integer applicationId);
}
