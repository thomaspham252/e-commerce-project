package com.fit.project.repository;

import com.fit.project.entity.InterviewInvitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewInvitationRepository extends JpaRepository<InterviewInvitation, Integer> {

    List<InterviewInvitation> findByApplicationIdOrderByIdDesc(Integer applicationId);
}
