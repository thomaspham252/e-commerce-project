package com.fit.project.repository;

import com.fit.project.entity.InterviewInvitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface InterviewInvitationRepository extends JpaRepository<InterviewInvitation, Integer> {

    List<InterviewInvitation> findByApplicationIdOrderByIdDesc(Integer applicationId);

    /** Lời mời của nhiều đơn cùng lúc (mới nhất trước), tránh N+1 khi liệt kê lịch sử ứng tuyển. */
    List<InterviewInvitation> findByApplicationIdInOrderByIdDesc(Collection<Integer> applicationIds);
}
