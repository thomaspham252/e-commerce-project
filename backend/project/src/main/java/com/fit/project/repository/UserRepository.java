package com.fit.project.repository;

import com.fit.project.entity.User;
import com.fit.project.enums.UserRole;
import com.fit.project.enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Integer> {

    /** Tìm theo email, họ tên ứng viên hoặc tên doanh nghiệp của NTD. */
    @Query("""
            select u from User u
            where (:role is null or u.role = :role)
              and (:status is null or u.status = :status)
              and (:kw is null
                   or lower(u.email) like :kw
                   or exists (select 1 from CandidateProfile cp where cp.user = u and lower(cp.fullName) like :kw)
                   or exists (select 1 from Company c where c.owner = u and lower(c.name) like :kw))
            """)
    Page<User> search(@Param("kw") String keywordPattern,
                      @Param("role") UserRole role,
                      @Param("status") UserStatus status,
                      Pageable pageable);

    long countByRole(UserRole role);

    @Query("select u.createdAt from User u where u.createdAt >= :from and u.createdAt < :to")
    List<LocalDateTime> findCreatedAtBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
