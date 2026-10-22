package com.fit.project.dto.wallet;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletResponse {
    private Integer userId;
    private String userName;
    private String userEmail;
    private Integer balance;
    private Integer totalDeposited;
    private Integer totalConsumed;
}
