package com.fit.project.controller;

import com.fit.project.dto.wallet.EmployerPackageResponse;
import com.fit.project.entity.Package;
import com.fit.project.repository.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Endpoint cung cấp danh sách gói dịch vụ Nhà tuyển dụng từ database.
 */
@RestController
@RequestMapping("/api/v1/packages")
@RequiredArgsConstructor
public class PackageController {

    private final PackageRepository packageRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getActivePackages() {
        List<Package> packages = packageRepository.findByIsActiveTrue();

        List<EmployerPackageResponse> list = packages.stream().map(p -> EmployerPackageResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .price(p.getPrice())
                .priceVND(p.getPrice())
                .durationDays(p.getDurationDays())
                .jobPostLimit(p.getJobPostLimit())
                .maxJobPosts(p.getJobPostLimit())
                .cvViewLimit(p.getCvViewLimit())
                .includedTokens(p.getIncludedTokens() != null ? p.getIncludedTokens() : 0)
                .canHighlightJobs(p.getCanHighlightJobs() != null && p.getCanHighlightJobs())
                .canPrioritizeJobs(p.getCanPrioritizeJobs() != null && p.getCanPrioritizeJobs())
                .canSearchCandidates(p.getCanSearchCandidates() != null && p.getCanSearchCandidates())
                .canDirectContact(p.getCanDirectContact() != null && p.getCanDirectContact())
                .isActive(p.getIsActive() != null && p.getIsActive())
                .build()
        ).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", list
        ));
    }
}
