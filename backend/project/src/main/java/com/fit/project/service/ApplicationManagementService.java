package com.fit.project.service;

import com.fit.project.dto.common.PageResponse;
import com.fit.project.dto.employer.ApplicationDetailResponse;
import com.fit.project.dto.employer.ApplicationDetailResponse.HistoryItem;
import com.fit.project.dto.employer.ApplicationDetailResponse.InvitationItem;
import com.fit.project.dto.employer.ApplicationResponse;
import com.fit.project.dto.employer.UpdateApplicationStatusRequest;
import com.fit.project.entity.Application;
import com.fit.project.entity.ApplicationStatusHistory;
import com.fit.project.entity.InterviewInvitation;
import com.fit.project.entity.User;
import com.fit.project.enums.ApplicationStatus;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.ApplicationRepository;
import com.fit.project.repository.ApplicationStatusHistoryRepository;
import com.fit.project.repository.InterviewInvitationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/** NTD quản lý hồ sơ ứng tuyển vào các tin của mình. Mọi lần đổi trạng thái đều ghi lịch sử. */
@Service
@RequiredArgsConstructor
public class ApplicationManagementService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository historyRepository;
    private final InterviewInvitationRepository invitationRepository;

    @Transactional(readOnly = true)
    public PageResponse<ApplicationResponse> list(User employer, Integer jobId, ApplicationStatus status,
                                                  String keyword, int page, int size) {
        Page<Application> apps = applicationRepository.searchByOwner(employer.getId(), jobId, status,
                QueryUtils.likePattern(keyword), QueryUtils.page(page, size, Sort.by(Sort.Direction.DESC, "appliedAt")));
        return PageResponse.of(apps, ApplicationResponse::of);
    }

    /** Xem chi tiết hồ sơ; lần đầu NTD mở hồ sơ PENDING sẽ tự chuyển sang VIEWED. */
    @Transactional
    public ApplicationDetailResponse detail(User employer, Integer applicationId) {
        Application app = findOwn(employer, applicationId);
        if (app.getStatus() == ApplicationStatus.PENDING) {
            changeStatus(app, ApplicationStatus.VIEWED, employer, null);
        }
        return toDetail(app);
    }

    @Transactional
    public ApplicationDetailResponse updateStatus(User employer, Integer applicationId, UpdateApplicationStatusRequest req) {
        Application app = findOwn(employer, applicationId);
        ApplicationStatus target = req.status();
        if (!app.getStatus().canMoveTo(target)) {
            throw ApiException.conflict("Không thể chuyển hồ sơ từ " + app.getStatus() + " sang " + target);
        }
        if (target == ApplicationStatus.INVITED) {
            if (req.interviewAt() == null) {
                throw ApiException.badRequest("Vui lòng chọn thời gian phỏng vấn");
            }
            if (req.interviewAt().isBefore(LocalDateTime.now())) {
                throw ApiException.badRequest("Thời gian phỏng vấn phải ở tương lai");
            }
            invitationRepository.save(InterviewInvitation.builder()
                    .application(app)
                    .scheduledAt(req.interviewAt())
                    .location(req.interviewLocation())
                    .notes(req.note())
                    .build());
        }
        changeStatus(app, target, employer, req.note());
        return toDetail(app);
    }

    private void changeStatus(Application app, ApplicationStatus target, User by, String note) {
        historyRepository.save(ApplicationStatusHistory.builder()
                .application(app)
                .fromStatus(app.getStatus())
                .toStatus(target)
                .changedBy(by)
                .note(note)
                .build());
        app.setStatus(target);
        // Ghi ngay để updated_at và lịch sử nhất quán khi trả về
        applicationRepository.saveAndFlush(app);
    }

    private Application findOwn(User employer, Integer applicationId) {
        return applicationRepository.findByIdAndOwner(applicationId, employer.getId())
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy hồ sơ ứng tuyển"));
    }

    private ApplicationDetailResponse toDetail(Application app) {
        var history = historyRepository.findByApplicationIdOrderByChangedAtAsc(app.getId()).stream()
                .map(h -> new HistoryItem(h.getFromStatus(), h.getToStatus(), h.getChangedBy().getEmail(),
                        h.getChangedAt(), h.getNote()))
                .toList();
        var invitations = invitationRepository.findByApplicationIdOrderByIdDesc(app.getId()).stream()
                .map(i -> new InvitationItem(i.getId(), i.getScheduledAt(), i.getLocation(), i.getNotes(), i.getStatus()))
                .toList();
        return new ApplicationDetailResponse(ApplicationResponse.of(app),
                app.getStatus().nextAllowed().stream().sorted().toList(), history, invitations);
    }
}
