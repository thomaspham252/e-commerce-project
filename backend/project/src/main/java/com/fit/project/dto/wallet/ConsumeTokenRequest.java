package com.fit.project.dto.wallet;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsumeTokenRequest {
    private String featureKey;
    private String featureName;
    private Integer tokenCost;
}
