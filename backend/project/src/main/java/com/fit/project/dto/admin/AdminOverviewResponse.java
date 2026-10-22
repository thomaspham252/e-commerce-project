package com.fit.project.dto.admin;

public record AdminOverviewResponse(
        long totalUsers,
        long candidates,
        long employers,
        long companies,
        long pendingCompanies,
        long totalJobs,
        long pendingJobs,
        long openJobs,
        long totalApplications,
        long newUsersThisMonth,
        long newUsersLastMonth
) {
}
