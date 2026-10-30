package com.fit.project.controller;

import com.fit.project.dto.common.PageResponse;
import com.fit.project.dto.company.*;
import com.fit.project.service.CompanyPublicService;
import com.fit.project.service.CurrentUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyPublicService companyService;

    @GetMapping
    public PageResponse<CompanySummaryResponse> listCompanies(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String industry,
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return companyService.getPublicCompanies(keyword, industry, location, page, size);
    }

    @GetMapping("/{id}")
    public CompanyDetailResponse getCompanyDetail(@PathVariable Integer id) {
        return companyService.getCompanyDetail(id);
    }

    @GetMapping("/{id}/reviews")
    public PageResponse<CompanyReviewResponse> listReviews(
            @PathVariable Integer id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return companyService.getReviews(id, page, size);
    }

    @PostMapping("/{id}/reviews")
    @ResponseStatus(HttpStatus.CREATED)
    public CompanyReviewResponse createReview(
            @RequestHeader(name = CurrentUserService.HEADER, required = false) Integer userId,
            @PathVariable Integer id,
            @Valid @RequestBody CreateReviewRequest request
    ) {
        Integer activeUserId = userId != null ? userId : 5; // Mặc định ungvien1 nếu chạy test
        return companyService.createReview(activeUserId, id, request);
    }

    @PostMapping("/{id}/reviews/{reviewId}/reply")
    public CompanyReviewResponse replyReview(
            @RequestHeader(name = CurrentUserService.HEADER, required = false) Integer userId,
            @PathVariable Integer id,
            @PathVariable Integer reviewId,
            @Valid @RequestBody CreateReplyRequest request
    ) {
        Integer activeUserId = userId != null ? userId : 2; // Mặc định employer
        return companyService.replyReview(activeUserId, id, reviewId, request);
    }
}

