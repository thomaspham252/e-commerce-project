package com.fit.project.repository;

import com.fit.project.entity.CandidateProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface CandidateProfileRepository extends JpaRepository<CandidateProfile, Integer> {

    List<CandidateProfile> findByUserIdIn(Collection<Integer> userIds);
}
