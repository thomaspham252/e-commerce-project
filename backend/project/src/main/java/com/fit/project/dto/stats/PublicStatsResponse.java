package com.fit.project.dto.stats;

/**
 * DTO trả về số liệu thống kê thực tế công khai phục vụ Landing Page.
 */
public record PublicStatsResponse(
        long candidateCount,
        long companyCount,
        long jobCount,
        long applicationCount
) {
}

