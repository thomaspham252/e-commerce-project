package com.fit.project.controller;

import com.fit.project.dto.JobResponse;
import com.fit.project.dto.common.PageResponse;
import com.fit.project.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @GetMapping
    public PageResponse<JobResponse> listJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String jobType,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) BigDecimal minSalary,
            @RequestParam(required = false) BigDecimal maxSalary,
            @RequestParam(defaultValue = "latest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return jobService.getPublicJobs(
                keyword,
                location,
                jobType,
                level,
                minSalary,
                maxSalary,
                sort,
                page,
                size
        );
    }

    @GetMapping("/{id}")
    public JobResponse getJob(@PathVariable Integer id) {
        return jobService.getJobDetail(id);
    }
}
