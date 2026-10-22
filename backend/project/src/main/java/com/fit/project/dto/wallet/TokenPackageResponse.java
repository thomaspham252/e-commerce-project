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
public class TokenPackageResponse {
    private Integer id;
    private Integer tokens;
    private BigDecimal price;
    private BigDecimal priceVND;
    private Integer bonusTokens;
    private Integer totalTokens;
    private Boolean isPopular;
    private String badgeLabel;
    private String description;
    private Boolean isActive;
}
