package com.fit.project.dto.wallet;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletTransactionResponse {
    private String id;
    private String type;
    private Integer amount;
    private Integer balanceAfter;
    private String title;
    private String description;
    private String createdAt;
}
