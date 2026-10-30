package com.fit.project.dto.company;

import com.fit.project.dto.common.PageResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployerReviewsSummaryResponse {
    private Integer companyId;
    private String companyName;
    private double averageRating;
    private long totalReviews;
    private long repliedCount;
    private long unrepliedCount;
    private int responseRate;
    private Map<Integer, Long> ratingBreakdown;
    private PageResponse<CompanyReviewResponse> reviews;
}

