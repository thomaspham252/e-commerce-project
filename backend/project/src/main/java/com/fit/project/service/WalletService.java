package com.fit.project.service;

import com.fit.project.dto.wallet.ConsumeTokenRequest;
import com.fit.project.dto.wallet.PurchaseComboRequest;
import com.fit.project.dto.wallet.PurchaseComboResponse;
import com.fit.project.entity.CandidateBenefitGrant;
import com.fit.project.entity.TokenTransaction;
import com.fit.project.entity.TokenWallet;
import com.fit.project.entity.User;
import com.fit.project.enums.TokenTransactionType;
import com.fit.project.enums.UtilityComboType;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.CandidateBenefitGrantRepository;
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
 * Đảm bảo chỉ bán tiện ích tuyển dụng dưới dạng COMBO trọn gói.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WalletService {

    private final TokenWalletRepository tokenWalletRepository;
    private final TokenTransactionRepository tokenTransactionRepository;
    private final ServiceFeeRepository serviceFeeRepository;
    private final CandidateBenefitGrantRepository candidateBenefitGrantRepository;

    /**
     * Mua gói combo tiện ích ứng tuyển bằng Token với cơ chế khóa bi quan (Pessimistic Lock)
     * và khóa Idempotency Key chống bấm đúp/gửi trùng giao dịch.
     * Tự động cộng dồn thời hạn sử dụng và cấp quota chat với 3 công ty NTD.
     *
     * @param user Tài khoản ứng viên mua combo
     * @param request Yêu cầu mua combo chứa mã comboId và idempotencyKey
     * @param headerIdempotencyKey Khóa idempotency truyền từ header (nếu có)
     * @return PurchaseComboResponse Phản hồi chi tiết giao dịch và quyền lợi
     */
    @Transactional
    public PurchaseComboResponse purchaseCombo(User user, PurchaseComboRequest request, String headerIdempotencyKey) {
        if (request == null || request.getComboId() == null || request.getComboId().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mã combo không được để trống");
        }

        // 1. Kiểm tra tính hợp lệ của mã gói combo
        UtilityComboType combo = UtilityComboType.fromCode(request.getComboId())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Mã gói combo không hợp lệ: " + request.getComboId()));

        int cost = combo.getPriceToken();

        // 2. Xác định khóa Idempotency Key duy nhất
        String finalIdempKey;
        if (headerIdempotencyKey != null && !headerIdempotencyKey.isBlank()) {
            finalIdempKey = headerIdempotencyKey.trim();
        } else if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            finalIdempKey = request.getIdempotencyKey().trim();
        } else {
            finalIdempKey = "combo:" + user.getId() + ":" + combo.getCode() + ":" + UUID.randomUUID();
        }

        // 3. Khóa dòng ví ứng viên (Pessimistic Lock) để chống race condition
        TokenWallet wallet = tokenWalletRepository.findByUserIdForUpdate(user.getId())
                .orElseGet(() -> {
                    TokenWallet newWallet = tokenWalletRepository.save(TokenWallet.builder()
                            .user(user)
                            .balance(0)
                            .build());
                    return tokenWalletRepository.findByUserIdForUpdate(newWallet.getUser().getId())
                            .orElse(newWallet);
                });

        // 4. Kiểm tra Idempotency Replay: nếu đã xử lý giao dịch với khóa này trước đó, trả về kết quả cũ
        Optional<TokenTransaction> existingTxOpt = tokenTransactionRepository.findByWalletUserIdAndIdempotencyKey(user.getId(), finalIdempKey);
        if (existingTxOpt.isPresent()) {
            TokenTransaction oldTx = existingTxOpt.get();
            log.info("Idempotent replay cho giao dịch mua combo: key={}, txId={}", finalIdempKey, oldTx.getId());
            CandidateBenefitGrant currentBenefit = candidateBenefitGrantRepository.findByUserId(user.getId()).orElse(null);
            return buildPurchaseResponse(user, wallet, oldTx, combo, currentBenefit, true);
        }

        // 5. Kiểm tra số dư khả dụng
        if (wallet.getBalance() < cost) {
            int missing = cost - wallet.getBalance();
            log.warn("Không đủ số dư ví để mua combo: userId={}, balance={}, cost={}, missing={}", user.getId(), wallet.getBalance(), cost, missing);
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "INSUFFICIENT_BALANCE: Số dư không đủ để mua combo \"" + combo.getDisplayName() +
                    "\". Cần " + cost + " token nhưng bạn chỉ còn " + wallet.getBalance() + " token (còn thiếu " + missing + " token).");
        }

        // 6. Thực hiện trừ token nguyên tử (Atomic Deduction)
        int newBalance = wallet.getBalance() - cost;
        wallet.setBalance(newBalance);
        tokenWalletRepository.save(wallet);

        // 7. Ghi nhận giao dịch vào sổ cái token_transactions
        TokenTransaction tx = TokenTransaction.builder()
                .wallet(wallet)
                .type(TokenTransactionType.SPEND)
                .amount(-cost)
                .balanceAfter(newBalance)
                .idempotencyKey(finalIdempKey)
                .refType("Mua combo " + combo.getDisplayName())
                .refId(combo.ordinal() + 1)
                .createdAt(LocalDateTime.now())
                .build();
        tokenTransactionRepository.save(tx);

        // 8. Cấp phát quyền lợi và cộng dồn (Cumulative Benefit Granting)
        CandidateBenefitGrant benefit = candidateBenefitGrantRepository.findByUserIdForUpdate(user.getId())
                .orElseGet(() -> CandidateBenefitGrant.builder()
                        .userId(user.getId())
                        .contactUnlockQuota(0)
                        .aiScoreQuota(0)
                        .updatedAt(LocalDateTime.now())
                        .build());

        LocalDateTime now = LocalDateTime.now();

        // Đẩy CV: cộng dồn giờ (72h)
        if (combo.getBoostHours() > 0) {
            LocalDateTime base = (benefit.getBoostCvExpireAt() != null && benefit.getBoostCvExpireAt().isAfter(now))
                    ? benefit.getBoostCvExpireAt() : now;
            benefit.setBoostCvExpireAt(base.plusHours(combo.getBoostHours()));
        }

        // Huy hiệu nổi bật: cộng dồn giờ (72h)
        if (combo.getBadgeHours() > 0) {
            LocalDateTime base = (benefit.getFeaturedBadgeExpireAt() != null && benefit.getFeaturedBadgeExpireAt().isAfter(now))
                    ? benefit.getFeaturedBadgeExpireAt() : now;
            benefit.setFeaturedBadgeExpireAt(base.plusHours(combo.getBadgeHours()));
        }

        // Ưu tiên hiển thị: cộng dồn ngày (7 ngày cho gói Toàn diện)
        if (combo.getPriorityDisplayDays() > 0) {
            LocalDateTime base = (benefit.getPriorityDisplayExpireAt() != null && benefit.getPriorityDisplayExpireAt().isAfter(now))
                    ? benefit.getPriorityDisplayExpireAt() : now;
            benefit.setPriorityDisplayExpireAt(base.plusDays(combo.getPriorityDisplayDays()));
        }

        // Quota mở khóa liên hệ chat 3 công ty NTD: cộng dồn số lượt
        if (combo.getContactUnlockQuota() > 0) {
            int currentQuota = benefit.getContactUnlockQuota() != null ? benefit.getContactUnlockQuota() : 0;
            benefit.setContactUnlockQuota(currentQuota + combo.getContactUnlockQuota());
        }

        // AI Resume Score: cộng dồn số lượt (1 lượt cho gói Toàn diện)
        if (combo.getAiScoreQuota() > 0) {
            int currentAiQuota = benefit.getAiScoreQuota() != null ? benefit.getAiScoreQuota() : 0;
            benefit.setAiScoreQuota(currentAiQuota + combo.getAiScoreQuota());
        }

        benefit.setUpdatedAt(now);
        candidateBenefitGrantRepository.save(benefit);

        log.info("Mua combo thành công: userId={}, combo={}, cost={}, newBalance={}",
                user.getId(), combo.getCode(), cost, newBalance);

        return buildPurchaseResponse(user, wallet, tx, combo, benefit, false);
    }

    /**
     * Tự động hoàn 100% token combo khi nhà tuyển dụng đóng tin trước khi xem CV ứng viên.
     */
    @Transactional
    public void refundComboTokensForClosedJob(Integer candidateUserId, String comboName, int tokenAmount) {
        TokenWallet wallet = tokenWalletRepository.findByUserIdForUpdate(candidateUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy ví token của ứng viên"));

        int newBalance = wallet.getBalance() + tokenAmount;
        wallet.setBalance(newBalance);
        tokenWalletRepository.save(wallet);

        TokenTransaction tx = TokenTransaction.builder()
                .wallet(wallet)
                .type(TokenTransactionType.REFUND)
                .amount(tokenAmount)
                .balanceAfter(newBalance)
                .refType("Hoàn 100% token combo " + comboName + " do NTD đóng tin tuyển dụng")
                .createdAt(LocalDateTime.now())
                .build();
        tokenTransactionRepository.save(tx);
        log.info("Đã tự động hoàn 100% token combo: userId={}, combo={}, amount={}", candidateUserId, comboName, tokenAmount);
    }

    private PurchaseComboResponse buildPurchaseResponse(
            User user,
            TokenWallet wallet,
            TokenTransaction tx,
            UtilityComboType combo,
            CandidateBenefitGrant benefit,
            boolean isReplay) {

        int totalConsumed = tokenTransactionRepository.findByWalletUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .filter(t -> t.getType() == TokenTransactionType.SPEND)
                .mapToInt(t -> Math.abs(t.getAmount()))
                .sum();

        int contactQuota = benefit != null && benefit.getContactUnlockQuota() != null ? benefit.getContactUnlockQuota() : 0;
        int aiQuota = benefit != null && benefit.getAiScoreQuota() != null ? benefit.getAiScoreQuota() : 0;

        return PurchaseComboResponse.builder()
                .success(true)
                .message("Kích hoạt combo \"" + combo.getDisplayName() + "\" thành công!")
                .wallet(PurchaseComboResponse.WalletInfo.builder()
                        .userId(user.getId())
                        .balance(wallet.getBalance())
                        .totalConsumed(totalConsumed)
                        .build())
                .transaction(PurchaseComboResponse.TransactionInfo.builder()
                        .id("TX-TOK-" + tx.getId())
                        .amount(tx.getAmount())
                        .balanceAfter(tx.getBalanceAfter())
                        .refType(tx.getRefType())
                        .idempotentReplay(isReplay)
                        .build())
                .benefits(PurchaseComboResponse.BenefitsInfo.builder()
                        .boostCvHours(combo.getBoostHours())
                        .featuredBadgeHours(combo.getBadgeHours())
                        .priorityDisplayDays(combo.getPriorityDisplayDays())
                        .contactUnlockQuotaAdded(combo.getContactUnlockQuota())
                        .totalContactUnlockQuota(contactQuota)
                        .aiScoreQuotaAdded(combo.getAiScoreQuota())
                        .totalAiScoreQuota(aiQuota)
                        .build())
                .build();
    }

    /**
     * Tiêu dùng token có khóa tranh chấp bi quan (Pessimistic Lock) và Idempotency (cho các module khác nếu có).
     */
    @Transactional
    public Map<String, Object> consumeTokens(User user, ConsumeTokenRequest request, String headerIdempotencyKey) {
        if (request == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Yêu cầu tiêu token không được để trống");
        }

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

        TokenWallet wallet = tokenWalletRepository.findByUserIdForUpdate(user.getId())
                .orElseGet(() -> {
                    TokenWallet newWallet = tokenWalletRepository.save(TokenWallet.builder()
                            .user(user)
                            .balance(0)
                            .build());
                    return tokenWalletRepository.findByUserIdForUpdate(newWallet.getUser().getId())
                            .orElse(newWallet);
                });

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

        if (wallet.getBalance() < cost) {
            log.warn("Không đủ số dư ví: userId={}, balance={}, requiredCost={}", user.getId(), wallet.getBalance(), cost);
            throw new ApiException(HttpStatus.BAD_REQUEST, "INSUFFICIENT_BALANCE: Số dư không đủ. Cần " + cost + " token nhưng bạn chỉ còn " + wallet.getBalance() + " token.");
        }

        int newBalance = wallet.getBalance() - cost;
        wallet.setBalance(newBalance);
        tokenWalletRepository.save(wallet);

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
