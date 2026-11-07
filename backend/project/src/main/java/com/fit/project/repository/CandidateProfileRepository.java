package com.fit.project.repository;

import com.fit.project.entity.CandidateProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface CandidateProfileRepository extends JpaRepository<CandidateProfile, Integer> {

    List<CandidateProfile> findByUserIdIn(Collection<Integer> userIds);

    @Query("""
            select cp from CandidateProfile cp
            where cp.isSearchable = true
              and (:kw is null or lower(cp.fullName) like :kw or lower(cp.summary) like :kw)
              and (:location is null or lower(cp.address) like :location)
            """)
    Page<CandidateProfile> searchCandidates(@Param("kw") String keywordPattern,
                                            @Param("location") String locationPattern,
                                            Pageable pageable);
}
