package com.fit.project.repository;

import com.fit.project.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Integer> {

    List<Conversation> findByCandidateIdOrderByLastMessageAtDesc(Integer candidateId);

    List<Conversation> findByCompanyIdOrderByLastMessageAtDesc(Integer companyId);

    Optional<Conversation> findByCandidateIdAndCompanyIdAndJobId(Integer candidateId, Integer companyId, Integer jobId);

    @Query("SELECT COALESCE(SUM(c.candidateUnreadCount), 0) FROM Conversation c WHERE c.candidate.id = :candidateId")
    Integer sumCandidateUnreadCount(@Param("candidateId") Integer candidateId);

    @Query("SELECT COALESCE(SUM(c.employerUnreadCount), 0) FROM Conversation c WHERE c.company.id = :companyId")
    Integer sumEmployerUnreadCount(@Param("companyId") Integer companyId);
}
