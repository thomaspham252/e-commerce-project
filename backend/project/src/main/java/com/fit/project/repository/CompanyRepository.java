package com.fit.project.repository;

import com.fit.project.entity.Company;
import com.fit.project.enums.VerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Integer> {

    @EntityGraph(attributePaths = "owner")
    @Query("""
            select c from Company c
            where (:status is null or c.verificationStatus = :status)
              and (:kw is null
                   or lower(c.name) like :kw
                   or lower(c.owner.email) like :kw
                   or c.taxCode like :kw)
            """)
    Page<Company> search(@Param("kw") String keywordPattern,
                         @Param("status") VerificationStatus status,
                         Pageable pageable);

    @EntityGraph(attributePaths = "owner")
    @Query("""
            select c from Company c
            where (:status is null or c.verificationStatus = :status)
              and (:kw is null or lower(c.name) like :kw or lower(c.description) like :kw)
              and (:industry is null or lower(c.industry) like :industry)
              and (:location is null or lower(c.address) like :location)
            """)
    Page<Company> searchPublicCompanies(@Param("kw") String keywordPattern,
                                        @Param("industry") String industryPattern,
                                        @Param("location") String locationPattern,
                                        @Param("status") VerificationStatus status,
                                        Pageable pageable);

    /** Hiện tại mỗi NTD quản lý 1 DN (DN tạo sớm nhất). Xem [CHỐT] owner_id trong database.dbml. */
    Optional<Company> findFirstByOwnerIdOrderByIdAsc(Integer ownerId);

    List<Company> findByOwnerIdIn(Collection<Integer> ownerIds);

    long countByVerificationStatus(VerificationStatus status);

    boolean existsByTaxCodeAndIdNot(String taxCode, Integer id);

    boolean existsByTaxCode(String taxCode);
}
