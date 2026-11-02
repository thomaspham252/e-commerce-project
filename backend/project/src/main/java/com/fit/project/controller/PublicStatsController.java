package com.fit.project.controller;

import com.fit.project.dto.stats.PublicStatsResponse;
import com.fit.project.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller công khai cung cấp các số liệu thống kê chung cho trang chủ và Landing Page Nhà tuyển dụng.
 */
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicStatsController {

    private final StatisticsService statisticsService;

    @GetMapping("/stats")
    public PublicStatsResponse getPublicStats() {
        return statisticsService.getPublicStats();
    }
}

