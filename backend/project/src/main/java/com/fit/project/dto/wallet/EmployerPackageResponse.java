package com.fit.project.dto.wallet;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployerPackageResponse {
    private Integer id;
    private String name;
    private BigDecimal price;
    private BigDecimal priceVND;
    private Integer durationDays;
    private Integer jobPostLimit;
    private Integer maxJobPosts;
    private Integer cvViewLimit;
    private Integer includedTokens;
    private Boolean canHighlightJobs;
    private Boolean canPrioritizeJobs;
    private Boolean canSearchCandidates;
    private Boolean canDirectContact;
    private Boolean isActive;
}
