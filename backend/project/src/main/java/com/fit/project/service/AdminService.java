package com.fit.project.service;

import com.fit.project.dto.CompanyResponse;
import com.fit.project.dto.JobResponse;
import com.fit.project.dto.admin.AdminCvResponse;
import com.fit.project.dto.admin.AdminUserDetailResponse;
import com.fit.project.dto.admin.AdminUserResponse;
import com.fit.project.dto.admin.ReviewJobRequest;
import com.fit.project.dto.common.PageResponse;
import com.fit.project.entity.CandidateProfile;
import com.fit.project.entity.Company;
import com.fit.project.entity.Cv;
import com.fit.project.entity.Job;
import com.fit.project.entity.User;
import com.fit.project.enums.*;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.ApplicationRepository;
import com.fit.project.repository.CandidateProfileRepository;
import com.fit.project.repository.CompanyRepository;
import com.fit.project.repository.CvRepository;
import com.fit.project.repository.JobRepository;
import com.fit.project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/** Admin quản lý cơ bản: người dùng, hồ sơ (CV), doanh nghiệp, duyệt/gỡ tin tuyển dụng. */
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final CvRepository cvRepository;

    // ===== Người dùng =====

    @Transactional(readOnly = true)
    public PageResponse<AdminUserResponse> listUsers(String keyword, UserRole role, UserStatus status, int page, int size) {
        Page<User> users = userRepository.search(QueryUtils.likePattern(keyword), role, status,
                QueryUtils.page(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));

        List<Integer> ids = users.getContent().stream().map(User::getId).toList();
        Map<Integer, String> candidateNames = candidateProfileRepository.findByUserIdIn(ids).stream()
                .collect(Collectors.toMap(CandidateProfile::getUserId, CandidateProfile::getFullName));
        Map<Integer, String> companyNames = companyRepository.findByOwnerIdIn(ids).stream()
                .collect(Collectors.toMap(c -> c.getOwner().getId(), Company::getName, (a, b) -> a));

        return PageResponse.of(users, users.getContent().stream().map(u -> new AdminUserResponse(
                u.getId(), u.getEmail(),
                switch (u.getRole()) {
                    case CANDIDATE -> candidateNames.get(u.getId());
                    case EMPLOYER -> companyNames.get(u.getId());
                    case ADMIN -> "Quản trị viên";
                },
                u.getRole(), u.getStatus(), u.getCreatedAt())).toList());
    }

    @Transactional
    public void updateUserStatus(User admin, Integer userId, UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));
        if (user.getId().equals(admin.getId())) {
            throw ApiException.badRequest("Không thể tự khóa tài khoản của chính mình");
        }
        if (user.getRole() == UserRole.ADMIN) {
            throw ApiException.forbidden("Không thể khóa tài khoản quản trị viên khác");
        }
        user.setStatus(status);
    }

    @Transactional(readOnly = true)
    public AdminUserDetailResponse getUser(Integer userId) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));
        return switch (u.getRole()) {
            case CANDIDATE -> {
                CandidateProfile p = candidateProfileRepository.findById(u.getId()).orElse(null);
                yield new AdminUserDetailResponse(u.getId(), u.getEmail(), p != null ? p.getFullName() : null,
                        u.getRole(), u.getStatus(), u.getCreatedAt(),
                        p != null ? p.getPhone() : null, p != null ? p.getDob() : null,
                        p != null ? p.getAddress() : null, p != null ? p.getSummary() : null,
                        p != null ? p.getIsSearchable() : null,
                        cvRepository.countByCandidateUserId(u.getId()),
                        applicationRepository.countByCandidateUserId(u.getId()),
                        null, null, null);
            }
            case EMPLOYER -> {
                Company c = companyRepository.findFirstByOwnerIdOrderByIdAsc(u.getId()).orElse(null);
                yield new AdminUserDetailResponse(u.getId(), u.getEmail(), c != null ? c.getName() : null,
                        u.getRole(), u.getStatus(), u.getCreatedAt(),
                        null, null, c != null ? c.getAddress() : null, null, null, null, null,
                        c != null ? c.getId() : null, c != null ? c.getName() : null,
                        jobRepository.countByCompanyOwnerId(u.getId()));
            }
            case ADMIN -> new AdminUserDetailResponse(u.getId(), u.getEmail(), "Quản trị viên",
                    u.getRole(), u.getStatus(), u.getCreatedAt(),
                    null, null, null, null, null, null, null, null, null, null);
        };
    }

    // ===== Hồ sơ ứng viên (CV) =====

    @Transactional(readOnly = true)
    public PageResponse<AdminCvResponse> listCvs(String keyword, int page, int size) {
        Page<Cv> cvs = cvRepository.search(QueryUtils.likePattern(keyword),
                QueryUtils.page(page, size, Sort.by(Sort.Direction.DESC, "uploadedAt")));
        Map<Integer, Long> counts = applicationRepository.countByCvIds(cvs.getContent().stream().map(Cv::getId).toList());
        return PageResponse.of(cvs, cv -> new AdminCvResponse(cv.getId(), cv.getFileName(), cv.getFileUrl(),
                cv.getIsDefault(), cv.getUploadedAt(),
                cv.getCandidate().getUserId(), cv.getCandidate().getFullName(), cv.getCandidate().getUser().getEmail(),
                cv.getCandidate().getIsSearchable(), counts.getOrDefault(cv.getId(), 0L)));
    }

    /** CV đã dùng để nộp đơn thì không xóa được (FK RESTRICT, NTD vẫn cần xem lại hồ sơ). */
    @Transactional
    public void deleteCv(Integer cvId) {
        Cv cv = cvRepository.findById(cvId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy CV"));
        if (applicationRepository.existsByCvId(cvId)) {
            throw ApiException.conflict("CV đã được dùng để ứng tuyển, không thể xóa. Hãy ẩn hồ sơ ứng viên thay vì xóa");
        }
        cvRepository.delete(cv);
    }

    /** Ẩn/hiện hồ sơ ứng viên khỏi tìm kiếm của nhà tuyển dụng. */
    @Transactional
    public void updateCandidateSearchable(Integer candidateId, boolean searchable) {
        CandidateProfile profile = candidateProfileRepository.findById(candidateId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy hồ sơ ứng viên"));
        profile.setIsSearchable(searchable);
    }

    // ===== Doanh nghiệp =====

    @Transactional(readOnly = true)
    public PageResponse<CompanyResponse> listCompanies(String keyword, VerificationStatus status, int page, int size) {
        Page<Company> companies = companyRepository.search(QueryUtils.likePattern(keyword), status,
                QueryUtils.page(page, size, Sort.by(Sort.Direction.DESC, "id")));
        return PageResponse.of(companies, CompanyResponse::of);
    }

    @Transactional
    public CompanyResponse verifyCompany(User admin, Integer companyId, VerificationStatus status) {
        if (status == VerificationStatus.PENDING) {
            throw ApiException.badRequest("Chỉ có thể xác minh (VERIFIED) hoặc từ chối (REJECTED)");
        }
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy doanh nghiệp"));
        company.setVerificationStatus(status);
        company.setVerifiedBy(admin);
        company.setVerifiedAt(status == VerificationStatus.VERIFIED ? LocalDateTime.now() : null);
        return CompanyResponse.of(company);
    }

    // ===== Tin tuyển dụng =====

    @Transactional(readOnly = true)
    public PageResponse<JobResponse> listJobs(String keyword, JobStatus status, int page, int size) {
        Page<Job> jobs = jobRepository.searchAll(QueryUtils.likePattern(keyword), status,
                QueryUtils.page(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        Map<Integer, Long> counts = applicationRepository.countByJobIds(jobs.getContent().stream().map(Job::getId).toList());
        return PageResponse.of(jobs, j -> JobResponse.of(j, counts.getOrDefault(j.getId(), 0L)));
    }

    @Transactional
    public JobResponse reviewJob(User admin, Integer jobId, ReviewJobRequest req) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy tin tuyển dụng"));
        if (job.getStatus() != JobStatus.PENDING_REVIEW) {
            throw ApiException.conflict("Tin này không ở trạng thái chờ duyệt");
        }
        if (req.approved()) {
            job.setStatus(JobStatus.OPEN);
            job.setRejectionReason(null);
        } else {
            if (req.reason() == null || req.reason().isBlank()) {
                throw ApiException.badRequest("Vui lòng nhập lý do từ chối");
            }
            job.setStatus(JobStatus.REJECTED);
            job.setRejectionReason(req.reason().trim());
        }
        job.setReviewedBy(admin);
        job.setReviewedAt(LocalDateTime.now());
        return JobResponse.of(job);
    }

    /** Gỡ tin vi phạm đang hiển thị: chuyển sang CLOSED, lưu lý do vào rejectionReason để NTD xem. */
    @Transactional
    public JobResponse takeDownJob(User admin, Integer jobId, String reason) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy tin tuyển dụng"));
        if (job.getStatus() != JobStatus.OPEN && job.getStatus() != JobStatus.PENDING_REVIEW) {
            throw ApiException.conflict("Chỉ gỡ được tin đang hiển thị hoặc đang chờ duyệt");
        }
        job.setStatus(JobStatus.CLOSED);
        job.setRejectionReason("Gỡ bởi quản trị viên: " + reason.trim());
        job.setReviewedBy(admin);
        job.setReviewedAt(LocalDateTime.now());
        return JobResponse.of(job);
    }
}
