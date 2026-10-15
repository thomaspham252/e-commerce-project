package com.fit.project.controller;

import com.fit.project.dto.CompanyResponse;
import com.fit.project.dto.JobResponse;
import com.fit.project.dto.common.PageResponse;
import com.fit.project.dto.employer.*;
import com.fit.project.entity.User;
import com.fit.project.enums.ApplicationStatus;
import com.fit.project.enums.JobStatus;
import com.fit.project.enums.UserRole;
import com.fit.project.service.ApplicationManagementService;
import com.fit.project.service.CurrentUserService;
import com.fit.project.service.EmployerService;
import com.fit.project.service.StatisticsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/employer")
@RequiredArgsConstructor
public class EmployerController {

    private final CurrentUserService currentUserService;
    private final EmployerService employerService;
    private final ApplicationManagementService applicationService;
    private final StatisticsService statisticsService;

    // ===== Hồ sơ doanh nghiệp =====

    /** 204 khi NTD chưa tạo hồ sơ doanh nghiệp. */
    @GetMapping("/company")
    public ResponseEntity<CompanyResponse> getCompany(@RequestHeader(CurrentUserService.HEADER) Integer userId) {
        return employerService.getCompany(employer(userId))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PutMapping("/company")
    public CompanyResponse saveCompany(@RequestHeader(CurrentUserService.HEADER) Integer userId,
                                       @Valid @RequestBody CompanyRequest req) {
        return employerService.saveCompany(employer(userId), req);
    }

    // ===== Tin tuyển dụng =====

    @GetMapping("/jobs")
    public PageResponse<JobResponse> listJobs(@RequestHeader(CurrentUserService.HEADER) Integer userId,
                                              @RequestParam(required = false) String keyword,
                                              @RequestParam(required = false) JobStatus status,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "10") int size) {
        return employerService.listJobs(employer(userId), keyword, status, page, size);
    }

    @GetMapping("/jobs/{id}")
    public JobResponse getJob(@RequestHeader(CurrentUserService.HEADER) Integer userId, @PathVariable Integer id) {
        return employerService.getJob(employer(userId), id);
    }

    @PostMapping("/jobs")
    @ResponseStatus(HttpStatus.CREATED)
    public JobResponse createJob(@RequestHeader(CurrentUserService.HEADER) Integer userId,
                                 @Valid @RequestBody JobRequest req) {
        return employerService.createJob(employer(userId), req);
    }

    @PutMapping("/jobs/{id}")
    public JobResponse updateJob(@RequestHeader(CurrentUserService.HEADER) Integer userId,
                                 @PathVariable Integer id,
                                 @Valid @RequestBody JobRequest req) {
        return employerService.updateJob(employer(userId), id, req);
    }

    @PatchMapping("/jobs/{id}/close")
    public JobResponse closeJob(@RequestHeader(CurrentUserService.HEADER) Integer userId, @PathVariable Integer id) {
        return employerService.closeJob(employer(userId), id);
    }

    @DeleteMapping("/jobs/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteJob(@RequestHeader(CurrentUserService.HEADER) Integer userId, @PathVariable Integer id) {
        employerService.deleteJob(employer(userId), id);
    }

    // ===== Quản lý ứng tuyển =====

    @GetMapping("/applications")
    public PageResponse<ApplicationResponse> listApplications(@RequestHeader(CurrentUserService.HEADER) Integer userId,
                                                              @RequestParam(required = false) Integer jobId,
                                                              @RequestParam(required = false) ApplicationStatus status,
                                                              @RequestParam(required = false) String keyword,
                                                              @RequestParam(defaultValue = "0") int page,
                                                              @RequestParam(defaultValue = "10") int size) {
        return applicationService.list(employer(userId), jobId, status, keyword, page, size);
    }

    @GetMapping("/applications/{id}")
    public ApplicationDetailResponse applicationDetail(@RequestHeader(CurrentUserService.HEADER) Integer userId,
                                                       @PathVariable Integer id) {
        return applicationService.detail(employer(userId), id);
    }

    @PatchMapping("/applications/{id}/status")
    public ApplicationDetailResponse updateApplicationStatus(@RequestHeader(CurrentUserService.HEADER) Integer userId,
                                                             @PathVariable Integer id,
                                                             @Valid @RequestBody UpdateApplicationStatusRequest req) {
        return applicationService.updateStatus(employer(userId), id, req);
    }

    // ===== Thống kê =====

    @GetMapping("/stats")
    public EmployerStatsResponse stats(@RequestHeader(CurrentUserService.HEADER) Integer userId,
                                       @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                       @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return statisticsService.employerStats(employer(userId).getId(), from, to);
    }

    private User employer(Integer userId) {
        return currentUserService.require(userId, UserRole.EMPLOYER);
    }
}
