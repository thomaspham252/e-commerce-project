package com.fit.project.controller;

import com.fit.project.dto.candidate.ApplyRequest;
import com.fit.project.dto.candidate.CandidateApplicationResponse;
import com.fit.project.dto.candidate.CandidateCvResponse;
import com.fit.project.entity.User;
import com.fit.project.enums.UserRole;
import com.fit.project.service.CandidateApplicationService;
import com.fit.project.service.CurrentUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Chức năng dành cho ứng viên: CV của tôi, nộp đơn, lịch sử ứng tuyển. */
@RestController
@RequestMapping("/api/candidate")
@RequiredArgsConstructor
public class CandidateController {

    private final CurrentUserService currentUserService;
    private final CandidateApplicationService applicationService;

    @GetMapping("/cvs")
    public List<CandidateCvResponse> listCvs(@RequestHeader(CurrentUserService.HEADER) Integer userId) {
        return applicationService.listCvs(candidate(userId));
    }

    @GetMapping("/applications")
    public List<CandidateApplicationResponse> listApplications(@RequestHeader(CurrentUserService.HEADER) Integer userId) {
        return applicationService.listMine(candidate(userId));
    }

    @PostMapping("/applications")
    @ResponseStatus(HttpStatus.CREATED)
    public CandidateApplicationResponse apply(@RequestHeader(CurrentUserService.HEADER) Integer userId,
                                              @Valid @RequestBody ApplyRequest req) {
        return applicationService.apply(candidate(userId), req);
    }

    @DeleteMapping("/applications/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void withdraw(@RequestHeader(CurrentUserService.HEADER) Integer userId, @PathVariable Integer id) {
        applicationService.withdraw(candidate(userId), id);
    }

    private User candidate(Integer userId) {
        return currentUserService.require(userId, UserRole.CANDIDATE);
    }
}
