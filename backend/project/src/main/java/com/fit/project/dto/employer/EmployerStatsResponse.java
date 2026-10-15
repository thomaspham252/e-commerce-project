package com.fit.project.dto.employer;

import com.fit.project.dto.common.CountItem;

import java.util.List;

public record EmployerStatsResponse(
        List<DayPoint> timeline,
        List<CountItem> statusDistribution,
        Summary summary
) {
    /** date dạng yyyy-MM-dd, label dạng dd/MM. */
    public record DayPoint(String date, String label, long applications) {
    }

    public record Summary(long totalApplications, long activeJobs, long reviewingCount, long newApplicationsThisWeek) {
    }
}
