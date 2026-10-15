package com.fit.project.service;

import com.fit.project.dto.CompanyResponse;
import com.fit.project.dto.JobResponse;
import com.fit.project.dto.common.PageResponse;
import com.fit.project.dto.employer.CompanyRequest;
import com.fit.project.dto.employer.JobRequest;
import com.fit.project.entity.Company;
import com.fit.project.entity.Job;
import com.fit.project.entity.User;
import com.fit.project.enums.JobStatus;
import com.fit.project.enums.SalaryUnit;
import com.fit.project.enums.VerificationStatus;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.ApplicationRepository;
import com.fit.project.repository.CompanyRepository;
import com.fit.project.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

/** NTD quản lý cơ bản: hồ sơ doanh nghiệp và tin tuyển dụng của mình. */
@Service
@RequiredArgsConstructor
public class EmployerService {

    /** Trạng thái được phép sửa tin (sửa xong sẽ phải duyệt lại). */
    private static final Set<JobStatus> EDITABLE = EnumSet.of(
            JobStatus.DRAFT, JobStatus.PENDING_REVIEW, JobStatus.OPEN, JobStatus.REJECTED);

    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    // ===== Doanh nghiệp =====

    @Transactional(readOnly = true)
    public Optional<CompanyResponse> getCompany(User employer) {
        return companyRepository.findFirstByOwnerIdOrderByIdAsc(employer.getId()).map(CompanyResponse::of);
    }

    @Transactional
    public CompanyResponse saveCompany(User employer, CompanyRequest req) {
        String taxCode = blankToNull(req.taxCode());
        Company company = companyRepository.findFirstByOwnerIdOrderByIdAsc(employer.getId())
                .orElseGet(() -> Company.builder().owner(employer).build());

        boolean taxCodeTaken = company.getId() == null
                ? taxCode != null && companyRepository.existsByTaxCode(taxCode)
                : taxCode != null && companyRepository.existsByTaxCodeAndIdNot(taxCode, company.getId());
        if (taxCodeTaken) {
            throw ApiException.conflict("Mã số thuế đã được doanh nghiệp khác sử dụng");
        }

        // Đổi thông tin pháp lý của DN đã xác minh, hoặc sửa DN bị từ chối → chờ admin xác minh lại
        boolean legalInfoChanged = !Objects.equals(company.getLegalName(), blankToNull(req.legalName()))
                || !Objects.equals(company.getTaxCode(), taxCode)
                || !Objects.equals(company.getBusinessLicenseUrl(), blankToNull(req.businessLicenseUrl()));
        if (company.getVerificationStatus() == VerificationStatus.REJECTED
                || (company.getVerificationStatus() == VerificationStatus.VERIFIED && legalInfoChanged)) {
            company.setVerificationStatus(VerificationStatus.PENDING);
            company.setVerifiedAt(null);
            company.setVerifiedBy(null);
        }

        company.setName(req.name().trim());
        company.setLegalName(blankToNull(req.legalName()));
        company.setTaxCode(taxCode);
        company.setDescription(req.description());
        company.setLogo(blankToNull(req.logo()));
        company.setWebsite(blankToNull(req.website()));
        company.setAddress(blankToNull(req.address()));
        company.setIndustry(blankToNull(req.industry()));
        company.setSize(blankToNull(req.size()));
        company.setBusinessLicenseUrl(blankToNull(req.businessLicenseUrl()));
        return CompanyResponse.of(companyRepository.save(company));
    }

    // ===== Tin tuyển dụng =====

    @Transactional(readOnly = true)
    public PageResponse<JobResponse> listJobs(User employer, String keyword, JobStatus status, int page, int size) {
        Page<Job> jobs = jobRepository.searchByOwner(employer.getId(), QueryUtils.likePattern(keyword), status,
                QueryUtils.page(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        Map<Integer, Long> counts = applicationRepository.countByJobIds(
                jobs.getContent().stream().map(Job::getId).toList());
        return PageResponse.of(jobs, j -> JobResponse.of(j, counts.getOrDefault(j.getId(), 0L)));
    }

    @Transactional(readOnly = true)
    public JobResponse getJob(User employer, Integer jobId) {
        return JobResponse.of(findOwnJob(employer, jobId));
    }

    /** Tin mới luôn vào trạng thái chờ duyệt. Chỉ DN đã được admin xác minh mới được đăng. */
    @Transactional
    public JobResponse createJob(User employer, JobRequest req) {
        Company company = companyRepository.findFirstByOwnerIdOrderByIdAsc(employer.getId())
                .orElseThrow(() -> ApiException.badRequest("Vui lòng tạo hồ sơ doanh nghiệp trước khi đăng tin"));
        if (company.getVerificationStatus() != VerificationStatus.VERIFIED) {
            throw ApiException.forbidden("Doanh nghiệp chưa được xác minh nên chưa thể đăng tin");
        }
        Job job = Job.builder().company(company).build();
        applyRequest(job, req);
        job.setStatus(JobStatus.PENDING_REVIEW);
        return JobResponse.of(jobRepository.save(job));
    }

    @Transactional
    public JobResponse updateJob(User employer, Integer jobId, JobRequest req) {
        Job job = findOwnJob(employer, jobId);
        if (!EDITABLE.contains(job.getStatus())) {
            throw ApiException.conflict("Tin đã đóng hoặc hết hạn, không thể sửa");
        }
        applyRequest(job, req);
        job.setStatus(JobStatus.PENDING_REVIEW);
        job.setRejectionReason(null);
        job.setReviewedAt(null);
        job.setReviewedBy(null);
        return JobResponse.of(job);
    }

    @Transactional
    public JobResponse closeJob(User employer, Integer jobId) {
        Job job = findOwnJob(employer, jobId);
        if (job.getStatus() == JobStatus.CLOSED) {
            throw ApiException.conflict("Tin đã được đóng trước đó");
        }
        job.setStatus(JobStatus.CLOSED);
        return JobResponse.of(job);
    }

    /** Chỉ xóa được tin chưa có hồ sơ ứng tuyển; tin đã có hồ sơ thì phải đóng tin. */
    @Transactional
    public void deleteJob(User employer, Integer jobId) {
        Job job = findOwnJob(employer, jobId);
        if (applicationRepository.existsByJobId(jobId)) {
            throw ApiException.conflict("Tin đã có hồ sơ ứng tuyển, chỉ có thể đóng tin thay vì xóa");
        }
        jobRepository.delete(job);
    }

    private Job findOwnJob(User employer, Integer jobId) {
        return jobRepository.findByIdAndOwner(jobId, employer.getId())
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy tin tuyển dụng"));
    }

    private void applyRequest(Job job, JobRequest req) {
        if (req.salaryMin() != null && req.salaryMax() != null && req.salaryMin().compareTo(req.salaryMax()) > 0) {
            throw ApiException.badRequest("Lương tối thiểu không được lớn hơn lương tối đa");
        }
        job.setTitle(req.title().trim());
        job.setDescription(req.description());
        job.setRequirements(req.requirements());
        job.setSalaryMin(req.salaryMin());
        job.setSalaryMax(req.salaryMax());
        job.setSalaryUnit(req.salaryUnit() != null ? req.salaryUnit() : SalaryUnit.MONTH);
        job.setLocation(req.location().trim());
        job.setJobType(blankToNull(req.jobType()));
        job.setLevel(blankToNull(req.level()));
        job.setVacancies(req.vacancies() != null ? req.vacancies() : 1);
        job.setWorkingSchedule(blankToNull(req.workingSchedule()));
        job.setDeadline(req.deadline());
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
