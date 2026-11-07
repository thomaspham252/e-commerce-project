package com.fit.project.service;

import com.fit.project.dto.wallet.ConsumeTokenRequest;
import com.fit.project.entity.TokenTransaction;
import com.fit.project.entity.TokenWallet;
import com.fit.project.entity.User;
import com.fit.project.enums.TokenTransactionType;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.ServiceFeeRepository;
import com.fit.project.repository.TokenTransactionRepository;
import com.fit.project.repository.TokenWalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Service quản lý các biến động số dư trên Ví Token với cơ chế tuần tự hóa (Pessimistic Lock)
 * và đảm bảo tính bất biến (Idempotent) cho từng giao dịch.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WalletService {

    private final TokenWalletRepository tokenWalletRepository;
    private final TokenTransactionRepository tokenTransactionRepository;
    private final ServiceFeeRepository serviceFeeRepository;

    /**
     * Tiêu dùng token có khóa tranh chấp bi quan (Pessimistic Lock) và Idempotency.
     */
    @Transactional
    public Map<String, Object> consumeTokens(User user, ConsumeTokenRequest request, String headerIdempotencyKey) {
        if (request == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Yêu cầu tiêu token không được để trống");
        }

        // 1. Xác định mức chi phí token
        int cost = request.getTokenCost() != null ? request.getTokenCost() : 0;
        String featureTitle = request.getFeatureName() != null ? request.getFeatureName() : request.getFeatureKey();

        if (request.getFeatureKey() != null && !request.getFeatureKey().isBlank()) {
            var feeOpt = serviceFeeRepository.findByFeatureKey(request.getFeatureKey());
            if (feeOpt.isPresent()) {
                cost = feeOpt.get().getTokenCost();
                featureTitle = feeOpt.get().getFeatureName();
            }
        }

        if (cost <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Số token sử dụng phải lớn hơn 0");
        }

        // 2. Xác định khóa Idempotency Key
        String finalIdempKey;
        if (headerIdempotencyKey != null && !headerIdempotencyKey.isBlank()) {
            finalIdempKey = headerIdempotencyKey.trim();
        } else if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            finalIdempKey = request.getIdempotencyKey().trim();
        } else if (request.getTargetRefId() != null && request.getFeatureKey() != null) {
            finalIdempKey = "consume:" + user.getId() + ":" + request.getFeatureKey() + ":" + request.getTargetRefId();
        } else {
            finalIdempKey = "consume:" + user.getId() + ":" + (request.getFeatureKey() != null ? request.getFeatureKey() : "default") + ":" + UUID.randomUUID();
        }

        // 3. Khóa dòng ví người dùng (Pessimistic Lock) để chống race condition
        TokenWallet wallet = tokenWalletRepository.findByUserIdForUpdate(user.getId())
                .orElseGet(() -> {
                    TokenWallet newWallet = tokenWalletRepository.save(TokenWallet.builder()
                            .user(user)
                            .balance(0)
                            .build());
                    return tokenWalletRepository.findByUserIdForUpdate(newWallet.getUser().getId())
                            .orElse(newWallet);
                });

        // 4. Kiểm tra Idempotency: nếu đã xử lý giao dịch với khóa này trước đó, trả về kết quả cũ
        Optional<TokenTransaction> existingTxOpt = tokenTransactionRepository.findByWalletUserIdAndIdempotencyKey(user.getId(), finalIdempKey);
        if (existingTxOpt.isPresent()) {
            TokenTransaction oldTx = existingTxOpt.get();
            log.info("Idempotent replay cho giao dịch tiêu token: key={}, txId={}", finalIdempKey, oldTx.getId());
            return Map.of(
                    "success", true,
                    "wallet", Map.of(
                            "userId", user.getId(),
                            "balance", wallet.getBalance()
                    ),
                    "transaction", Map.of(
                            "id", "TX-TOK-" + oldTx.getId(),
                            "amount", oldTx.getAmount(),
                            "balanceAfter", oldTx.getBalanceAfter(),
                            "idempotentReplay", true
                    )
            );
        }

        // 5. Kiểm tra số dư khả dụng
        if (wallet.getBalance() < cost) {
            log.warn("Không đủ số dư ví: userId={}, balance={}, requiredCost={}", user.getId(), wallet.getBalance(), cost);
            throw new ApiException(HttpStatus.BAD_REQUEST, "INSUFFICIENT_BALANCE: Số dư không đủ. Cần " + cost + " token nhưng bạn chỉ còn " + wallet.getBalance() + " token.");
        }

        // 6. Thực hiện trừ tiền nguyên tử
        int newBalance = wallet.getBalance() - cost;
        wallet.setBalance(newBalance);
        tokenWalletRepository.save(wallet);

        // 7. Ghi nhận sổ cái giao dịch
        TokenTransaction tx = TokenTransaction.builder()
                .wallet(wallet)
                .type(TokenTransactionType.SPEND)
                .amount(-cost)
                .balanceAfter(newBalance)
                .idempotencyKey(finalIdempKey)
                .refType(featureTitle)
                .refId(request.getTargetRefId())
                .createdAt(LocalDateTime.now())
                .build();
        tokenTransactionRepository.save(tx);

        log.info("Tiêu token thành công: userId={}, cost={}, newBalance={}, key={}", user.getId(), cost, newBalance, finalIdempKey);

        return Map.of(
                "success", true,
                "wallet", Map.of(
                        "userId", user.getId(),
                        "balance", newBalance
                ),
                "transaction", Map.of(
                        "id", "TX-TOK-" + tx.getId(),
                        "amount", -cost,
                        "balanceAfter", newBalance,
                        "idempotentReplay", false
                )
        );
    }
}

