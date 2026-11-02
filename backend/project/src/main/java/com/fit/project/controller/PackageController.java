package com.fit.project.controller;

import com.fit.project.dto.admin.SavePackageRequest;
import com.fit.project.dto.wallet.EmployerPackageResponse;
import com.fit.project.entity.Package;
import com.fit.project.enums.UserRole;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.PackageRepository;
import com.fit.project.service.CurrentUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Gói dịch vụ Nhà tuyển dụng (bảng packages): NTD xem các gói đang mở bán,
 * Admin xem toàn bộ, tạo, sửa và bật/tắt mở bán.
 */
@RestController
@RequestMapping("/api/v1/packages")
@RequiredArgsConstructor
public class PackageController {

    private final PackageRepository packageRepository;
    private final CurrentUserService currentUserService;

    /** all=true (chỉ Admin): lấy cả gói đã tạm ngưng để quản lý. */
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getPackages(
            @RequestHeader(value = CurrentUserService.HEADER, required = false) Integer userId,
            @RequestParam(name = "all", defaultValue = "false") boolean all) {
        List<Package> packages;
        if (all) {
            currentUserService.require(userId, UserRole.ADMIN);
            packages = packageRepository.findAll(Sort.by("price"));
        } else {
            packages = packageRepository.findByIsActiveTrue();
        }
        return ok(packages.stream().map(PackageController::toResponse).toList());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<Map<String, Object>> createPackage(
            @RequestHeader(value = CurrentUserService.HEADER, required = false) Integer userId,
            @Valid @RequestBody SavePackageRequest req) {
        currentUserService.require(userId, UserRole.ADMIN);
        Package pkg = new Package();
        pkg.setIsActive(true);
        apply(pkg, req);
        return ok(toResponse(packageRepository.save(pkg)));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Map<String, Object>> updatePackage(
            @RequestHeader(value = CurrentUserService.HEADER, required = false) Integer userId,
            @PathVariable Integer id,
            @Valid @RequestBody SavePackageRequest req) {
        currentUserService.require(userId, UserRole.ADMIN);
        Package pkg = findPackage(id);
        apply(pkg, req);
        return ok(toResponse(packageRepository.save(pkg)));
    }

    @PatchMapping("/{id}/toggle-status")
    @Transactional
    public ResponseEntity<Map<String, Object>> togglePackageStatus(
            @RequestHeader(value = CurrentUserService.HEADER, required = false) Integer userId,
            @PathVariable Integer id) {
        currentUserService.require(userId, UserRole.ADMIN);
        Package pkg = findPackage(id);
        pkg.setIsActive(!Boolean.TRUE.equals(pkg.getIsActive()));
        return ok(toResponse(packageRepository.save(pkg)));
    }

    private Package findPackage(Integer id) {
        return packageRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy gói dịch vụ ID: " + id));
    }

    private static void apply(Package pkg, SavePackageRequest req) {
        pkg.setName(req.name().trim());
        pkg.setPrice(req.price());
        pkg.setDurationDays(req.durationDays());
        pkg.setJobPostLimit(req.jobPostLimit());
        pkg.setCvViewLimit(req.cvViewLimit());
        pkg.setIncludedTokens(req.includedTokens() != null ? req.includedTokens() : 0);
        pkg.setCanHighlightJobs(Boolean.TRUE.equals(req.canHighlightJobs()));
        pkg.setCanPrioritizeJobs(Boolean.TRUE.equals(req.canPrioritizeJobs()));
        pkg.setCanSearchCandidates(Boolean.TRUE.equals(req.canSearchCandidates()));
        pkg.setCanDirectContact(Boolean.TRUE.equals(req.canDirectContact()));
    }

    private static EmployerPackageResponse toResponse(Package p) {
        return EmployerPackageResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .price(p.getPrice())
                .priceVND(p.getPrice())
                .durationDays(p.getDurationDays())
                .jobPostLimit(p.getJobPostLimit())
                .maxJobPosts(p.getJobPostLimit())
                .cvViewLimit(p.getCvViewLimit())
                .includedTokens(p.getIncludedTokens() != null ? p.getIncludedTokens() : 0)
                .canHighlightJobs(Boolean.TRUE.equals(p.getCanHighlightJobs()))
                .canPrioritizeJobs(Boolean.TRUE.equals(p.getCanPrioritizeJobs()))
                .canSearchCandidates(Boolean.TRUE.equals(p.getCanSearchCandidates()))
                .canDirectContact(Boolean.TRUE.equals(p.getCanDirectContact()))
                .isActive(Boolean.TRUE.equals(p.getIsActive()))
                .build();
    }

    private static ResponseEntity<Map<String, Object>> ok(Object data) {
        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }
}
