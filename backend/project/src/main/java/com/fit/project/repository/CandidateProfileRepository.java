package com.fit.project.repository;

import com.fit.project.entity.CandidateProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface CandidateProfileRepository extends JpaRepository<CandidateProfile, Integer> {

    List<CandidateProfile> findByUserIdIn(Collection<Integer> userIds);

    @Query("""
            select cp from CandidateProfile cp
            left join CandidateBenefitGrant cbg on cbg.userId = cp.userId
            where cp.isSearchable = true
              and (:kw is null or lower(cp.fullName) like :kw or lower(cp.summary) like :kw)
              and (:location is null or lower(cp.address) like :location)
            order by
              case when (cbg.priorityDisplayExpireAt > :now or cbg.boostCvExpireAt > :now) then 1 else 0 end desc,
              case when (cbg.featuredBadgeExpireAt > :now) then 1 else 0 end desc,
              cp.userId desc
            """)
    Page<CandidateProfile> searchCandidates(@Param("kw") String keywordPattern,
                                            @Param("location") String locationPattern,
                                            @Param("now") LocalDateTime now,
                                            Pageable pageable);
}
