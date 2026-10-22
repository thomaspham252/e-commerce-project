package com.fit.project.controller;

import com.fit.project.dto.CompanyResponse;
import com.fit.project.dto.JobResponse;
import com.fit.project.dto.admin.*;
import com.fit.project.dto.common.CountItem;
import com.fit.project.dto.common.PageResponse;
import com.fit.project.entity.User;
import com.fit.project.enums.*;
import com.fit.project.service.AdminService;
import com.fit.project.service.CurrentUserService;
import com.fit.project.service.StatisticsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final CurrentUserService currentUserService;
    private final AdminService adminService;
    private final StatisticsService statisticsService;

    // ===== Người dùng =====

    @GetMapping("/users")
    public PageResponse<AdminUserResponse> listUsers(@RequestHeader(CurrentUserService.HEADER) Integer userId,
                                                     @RequestParam(required = false) String keyword,
                                                     @RequestParam(required = false) UserRole role,
                                                     @RequestParam(required = false) UserStatus status,
                                                     @RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "10") int size) {
        admin(userId);
        return adminService.listUsers(keyword, role, status, page, size);
    }

    @PatchMapping("/users/{id}/status")
    public void updateUserStatus(@RequestHeader(CurrentUserService.HEADER) Integer userId,
                                 @PathVariable Integer id,
                                 @Valid @RequestBody UpdateUserStatusRequest req) {
        adminService.updateUserStatus(admin(userId), id, req.status());
    }

    @GetMapping("/users/{id}")
    public AdminUserDetailResponse getUser(@RequestHeader(CurrentUserService.HEADER) Integer userId,
                                           @PathVariable Integer id) {
        admin(userId);
        return adminService.getUser(id);
    }

    @PatchMapping("/users/{id}/searchable")
    public void updateSearchable(@RequestHeader(CurrentUserService.HEADER) Integer userId,
                                 @PathVariable Integer id,
                                 @Valid @RequestBody UpdateSearchableRequest req) {
        admin(userId);
        adminService.updateCandidateSearchable(id, req.searchable());
    }

    // ===== Hồ sơ (CV) =====

    @GetMapping("/cvs")
    public PageResponse<AdminCvResponse> listCvs(@RequestHeader(CurrentUserService.HEADER) Integer userId,
                                                 @RequestParam(required = false) String keyword,
                                                 @RequestParam(defaultValue = "0") int page,
                                                 @RequestParam(defaultValue = "10") int size) {
        admin(userId);
        return adminService.listCvs(keyword, page, size);
    }

    @DeleteMapping("/cvs/{id}")
    public void deleteCv(@RequestHeader(CurrentUserService.HEADER) Integer userId,
                         @PathVariable Integer id) {
        admin(userId);
        adminService.deleteCv(id);
    }

    // ===== Doanh nghiệp =====

    @GetMapping("/companies")
    public PageResponse<CompanyResponse> listCompanies(@RequestHeader(CurrentUserService.HEADER) Integer userId,
                                                       @RequestParam(required = false) String keyword,
                                                       @RequestParam(required = false) VerificationStatus status,
                                                       @RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "10") int size) {
        admin(userId);
        return adminService.listCompanies(keyword, status, page, size);
    }

    @PatchMapping("/companies/{id}/verification")
    public CompanyResponse verifyCompany(@RequestHeader(CurrentUserService.HEADER) Integer userId,
                                         @PathVariable Integer id,
                                         @Valid @RequestBody VerifyCompanyRequest req) {
        return adminService.verifyCompany(admin(userId), id, req.status());
    }

    // ===== Tin tuyển dụng =====

    @GetMapping("/jobs")
    public PageResponse<JobResponse> listJobs(@RequestHeader(CurrentUserService.HEADER) Integer userId,
                                              @RequestParam(required = false) String keyword,
                                              @RequestParam(required = false) JobStatus status,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "10") int size) {
        admin(userId);
        return adminService.listJobs(keyword, status, page, size);
    }

    @PatchMapping("/jobs/{id}/review")
    public JobResponse reviewJob(@RequestHeader(CurrentUserService.HEADER) Integer userId,
                                 @PathVariable Integer id,
                                 @Valid @RequestBody ReviewJobRequest req) {
        return adminService.reviewJob(admin(userId), id, req);
    }

    @PatchMapping("/jobs/{id}/take-down")
    public JobResponse takeDownJob(@RequestHeader(CurrentUserService.HEADER) Integer userId,
                                   @PathVariable Integer id,
                                   @Valid @RequestBody TakeDownJobRequest req) {
        return adminService.takeDownJob(admin(userId), id, req.reason());
    }

    // ===== Thống kê =====

    @GetMapping("/stats/overview")
    public AdminOverviewResponse overview(@RequestHeader(CurrentUserService.HEADER) Integer userId) {
        admin(userId);
        return statisticsService.adminOverview();
    }

    @GetMapping("/stats/monthly")
    public List<MonthlyStat> monthly(@RequestHeader(CurrentUserService.HEADER) Integer userId,
                                     @RequestParam(defaultValue = "6") int months,
                                     @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM") YearMonth from,
                                     @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM") YearMonth to) {
        admin(userId);
        return statisticsService.adminMonthly(from, to, months);
    }

    @GetMapping("/stats/job-status")
    public List<CountItem> jobStatus(@RequestHeader(CurrentUserService.HEADER) Integer userId) {
        admin(userId);
        return statisticsService.adminJobStatus();
    }

    private User admin(Integer userId) {
        return currentUserService.require(userId, UserRole.ADMIN);
    }
}
