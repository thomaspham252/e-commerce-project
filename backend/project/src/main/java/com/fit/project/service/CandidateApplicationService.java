package com.fit.project.service;

import com.fit.project.dto.candidate.ApplyRequest;
import com.fit.project.dto.candidate.CandidateApplicationResponse;
import com.fit.project.dto.candidate.CandidateCvResponse;
import com.fit.project.entity.Application;
import com.fit.project.entity.CandidateProfile;
import com.fit.project.entity.InterviewInvitation;
import com.fit.project.entity.Job;
import com.fit.project.entity.User;
import com.fit.project.enums.ApplicationStatus;
import com.fit.project.enums.JobStatus;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.ApplicationRepository;
import com.fit.project.repository.CandidateProfileRepository;
import com.fit.project.repository.CvRepository;
import com.fit.project.repository.InterviewInvitationRepository;
import com.fit.project.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Ứng viên nộp đơn, xem lịch sử ứng tuyển và rút đơn. */
@Service
@RequiredArgsConstructor
public class CandidateApplicationService {

    /** Chỉ rút được khi NTD chưa ra quyết định (chưa mời phỏng vấn / từ chối / tuyển). */
    private static final Set<ApplicationStatus> WITHDRAWABLE = EnumSet.of(ApplicationStatus.PENDING, ApplicationStatus.VIEWED);

    private final ApplicationRepository applicationRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final CvRepository cvRepository;
    private final JobRepository jobRepository;
    private final InterviewInvitationRepository invitationRepository;

    @Transactional(readOnly = true)
    public List<CandidateCvResponse> listCvs(User candidate) {
        return cvRepository.findByCandidateUserIdOrderByIsDefaultDescUploadedAtDesc(candidate.getId()).stream()
                .map(CandidateCvResponse::of)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CandidateApplicationResponse> listMine(User candidate) {
        List<Application> apps = applicationRepository.findByCandidateWithJob(candidate.getId());
        if (apps.isEmpty()) return List.of();

        // Lời mời phỏng vấn mới nhất của từng đơn
        Map<Integer, InterviewInvitation> latestInvitation = new HashMap<>();
        for (InterviewInvitation inv : invitationRepository.findByApplicationIdInOrderByIdDesc(
                apps.stream().map(Application::getId).toList())) {
            latestInvitation.putIfAbsent(inv.getApplication().getId(), inv);
        }
        return apps.stream()
                .map(a -> CandidateApplicationResponse.of(a, latestInvitation.get(a.getId())))
                .toList();
    }

    @Transactional
    public CandidateApplicationResponse apply(User candidate, ApplyRequest req) {
        CandidateProfile profile = candidateProfileRepository.findById(candidate.getId())
                .orElseThrow(() -> ApiException.badRequest("Bạn cần hoàn thiện hồ sơ ứng viên trước khi ứng tuyển"));

        Job job = jobRepository.findById(req.jobId())
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy tin tuyển dụng"));
        if (job.getStatus() != JobStatus.OPEN) {
            throw ApiException.conflict("Tin tuyển dụng này không còn nhận hồ sơ");
        }
        if (job.getDeadline() != null && job.getDeadline().isBefore(LocalDate.now())) {
            throw ApiException.conflict("Tin tuyển dụng đã hết hạn nộp hồ sơ");
        }
        if (applicationRepository.existsByJobIdAndCandidateUserId(job.getId(), candidate.getId())) {
            throw ApiException.conflict("Bạn đã ứng tuyển vị trí này rồi");
        }

        var cv = cvRepository.findByIdAndCandidateUserId(req.cvId(), candidate.getId())
                .orElseThrow(() -> ApiException.badRequest("CV không tồn tại hoặc không thuộc về bạn"));

        String coverLetter = req.coverLetter() == null || req.coverLetter().isBlank() ? null : req.coverLetter().trim();
        Application app;
        try {
            app = applicationRepository.saveAndFlush(Application.builder()
                    .job(job)
                    .candidate(profile)
                    .cv(cv)
                    .coverLetter(coverLetter)
                    .build());
        } catch (DataIntegrityViolationException e) {
            // Hai request nộp cùng lúc: unique (job_id, candidate_id) chặn bản thứ hai
            throw ApiException.conflict("Bạn đã ứng tuyển vị trí này rồi");
        }
        return CandidateApplicationResponse.of(app, null);
    }

    @Transactional
    public void withdraw(User candidate, Integer applicationId) {
        Application app = applicationRepository.findByIdAndCandidate(applicationId, candidate.getId())
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy đơn ứng tuyển"));
        if (!WITHDRAWABLE.contains(app.getStatus())) {
            throw ApiException.conflict("Nhà tuyển dụng đã xử lý đơn này nên không thể rút");
        }
        // Lịch sử trạng thái / lời mời bị xoá theo ON DELETE CASCADE ở DB
        applicationRepository.delete(app);
    }
}
