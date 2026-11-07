package com.fit.project.controller;

import com.fit.project.dto.candidate.CandidateBenefitResponse;
import com.fit.project.dto.wallet.ConsumeTokenRequest;
import com.fit.project.dto.wallet.WalletResponse;
import com.fit.project.dto.wallet.WalletTransactionResponse;
import com.fit.project.entity.CandidateBenefitGrant;
import com.fit.project.entity.CandidateUnlockedCompany;
import com.fit.project.entity.Order;
import com.fit.project.entity.TokenTransaction;
import com.fit.project.entity.TokenWallet;
import com.fit.project.entity.User;
import com.fit.project.enums.OrderStatus;
import com.fit.project.enums.OrderType;
import com.fit.project.enums.TokenTransactionType;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.*;
import com.fit.project.service.CurrentUserService;
import com.fit.project.service.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller quản lý Ví Token, truy vấn số dư, lịch sử biến động và nạp/tiêu token.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final CurrentUserService currentUserService;
    private final TokenWalletRepository tokenWalletRepository;
    private final TokenTransactionRepository tokenTransactionRepository;
    private final OrderRepository orderRepository;
    private final ServiceFeeRepository serviceFeeRepository;
    private final WalletService walletService;
    private final CandidateBenefitGrantRepository candidateBenefitGrantRepository;
    private final CandidateUnlockedCompanyRepository candidateUnlockedCompanyRepository;
    private final CompanyRepository companyRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getWallet(
            @RequestHeader(value = CurrentUserService.HEADER, required = false) Integer currentUserId) {
        User user = currentUserService.requireUser(currentUserId);

        TokenWallet wallet = tokenWalletRepository.findByUserId(user.getId())
                .orElseGet(() -> tokenWalletRepository.save(TokenWallet.builder()
                        .user(user)
                        .balance(0)
                        .build()));

        List<TokenTransaction> txs = tokenTransactionRepository.findByWalletUserIdOrderByCreatedAtDesc(user.getId());

        int totalDeposited = txs.stream()
                .filter(t -> t.getType() == TokenTransactionType.PURCHASE || t.getType() == TokenTransactionType.WELCOME)
                .mapToInt(TokenTransaction::getAmount)
                .sum();

        int totalConsumed = txs.stream()
                .filter(t -> t.getType() == TokenTransactionType.SPEND)
                .mapToInt(t -> Math.abs(t.getAmount()))
                .sum();

        WalletResponse response = WalletResponse.builder()
                .userId(user.getId())
                .userName(user.getEmail())
                .userEmail(user.getEmail())
                .balance(wallet.getBalance())
                .totalDeposited(totalDeposited)
                .totalConsumed(totalConsumed)
                .build();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", response
        ));
    }

    @GetMapping("/transactions")
    public ResponseEntity<Map<String, Object>> getTransactions(
            @RequestHeader(value = CurrentUserService.HEADER, required = false) Integer currentUserId) {
        User user = currentUserService.requireUser(currentUserId);

        List<TokenTransaction> txs = tokenTransactionRepository.findByWalletUserIdOrderByCreatedAtDesc(user.getId());

        List<WalletTransactionResponse> responses = txs.stream().map(t -> {
            String typeStr = "DEPOSIT";
            String title = "Nạp token qua VietQR SePay";
            int amount = t.getAmount();

            if (t.getType() == TokenTransactionType.SPEND) {
                typeStr = "CONSUME";
                title = t.getRefType() != null ? t.getRefType() : "Sử dụng tính năng";
                amount = -Math.abs(amount);
            } else if (t.getType() == TokenTransactionType.WELCOME) {
                typeStr = "BONUS";
                title = "Quà tặng chào mừng ứng viên";
            } else if (t.getType() == TokenTransactionType.REFUND) {
                typeStr = "REFUND";
                title = "Hoàn lại token hệ thống";
            }

            String desc = t.getOrder() != null ? "Đơn hàng: " + t.getOrder().getOrderCode() : "Hệ thống JobViet";

            return WalletTransactionResponse.builder()
                    .id("TX-TOK-" + t.getId())
                    .type(typeStr)
                    .amount(amount)
                    .balanceAfter(t.getBalanceAfter())
                    .title(title)
                    .description(desc)
                    .createdAt(t.getCreatedAt().toString())
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", responses
        ));
    }

    @GetMapping("/deposits")
    public ResponseEntity<Map<String, Object>> getDeposits(
            @RequestHeader(value = CurrentUserService.HEADER, required = false) Integer currentUserId) {
        User user = currentUserService.requireUser(currentUserId);

        List<Order> orders = orderRepository.findByUserIdAndOrderTypeOrderByCreatedAtDesc(user.getId(), OrderType.TOKEN);

        List<Map<String, Object>> list = orders.stream().map(o -> {
            String statusStr = o.getStatus().name();
            if (o.getStatus() == OrderStatus.PAID || o.getStatus() == OrderStatus.FULFILLED) {
                statusStr = "SUCCESS";
            }
            return Map.<String, Object>of(
                    "orderId", o.getOrderCode(),
                    "orderCode", o.getOrderCode(),
                    "amount", o.getTotalAmount(),
                    "actualAmount", o.getTotalAmount(),
                    "status", statusStr,
                    "serviceName", "Nạp token ứng viên",
                    "createdAt", o.getCreatedAt().toString(),
                    "paidAt", o.getPaidAt() != null ? o.getPaidAt().toString() : ""
            );
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", list
        ));
    }

    @PostMapping("/consume")
    public ResponseEntity<Map<String, Object>> consumeTokens(
            @RequestBody ConsumeTokenRequest request,
            @RequestHeader(value = "X-Idempotency-Key", required = false) String headerIdempotencyKey,
            @RequestHeader(value = CurrentUserService.HEADER, required = true) Integer currentUserId) {
        User user = currentUserService.requireUser(currentUserId);
        Map<String, Object> result = walletService.consumeTokens(user, request, headerIdempotencyKey);
        return ResponseEntity.ok(result);
    }

    /**
     * Lấy trạng thái quyền lợi tiện ích ứng tuyển hiện tại của ứng viên.
     */
    @GetMapping("/benefits")
    public ResponseEntity<Map<String, Object>> getBenefits(
            @RequestHeader(value = CurrentUserService.HEADER, required = false) Integer currentUserId) {
        User user = currentUserService.requireUser(currentUserId);
        LocalDateTime now = LocalDateTime.now();
        CandidateBenefitGrant grant = candidateBenefitGrantRepository.findByUserId(user.getId()).orElse(null);
        List<CandidateUnlockedCompany> unlocked = candidateUnlockedCompanyRepository.findByCandidateUserId(user.getId());
        List<Long> companyIds = unlocked.stream().map(CandidateUnlockedCompany::getCompanyId).toList();

        List<Integer> cids = unlocked.stream().map(u -> u.getCompanyId().intValue()).toList();
        Map<Integer, com.fit.project.entity.Company> compMap = cids.isEmpty() ? Map.of()
                : companyRepository.findAllById(cids).stream().collect(Collectors.toMap(com.fit.project.entity.Company::getId, c -> c));

        List<CandidateBenefitResponse.UnlockedCompanyInfo> companyInfos = unlocked.stream().map(u -> {
            com.fit.project.entity.Company c = compMap.get(u.getCompanyId().intValue());
            return CandidateBenefitResponse.UnlockedCompanyInfo.builder()
                    .companyId(u.getCompanyId().intValue())
                    .companyName(c != null ? c.getName() : "Doanh nghiệp tuyển dụng")
                    .companyLogo(c != null ? c.getLogo() : null)
                    .unlockedAt(u.getUnlockedAt())
                    .build();
        }).toList();

        boolean isBoostActive = grant != null && grant.getBoostCvExpireAt() != null && grant.getBoostCvExpireAt().isAfter(now);
        boolean isFeaturedBadgeActive = grant != null && grant.getFeaturedBadgeExpireAt() != null && grant.getFeaturedBadgeExpireAt().isAfter(now);
        boolean isPriorityActive = grant != null && grant.getPriorityDisplayExpireAt() != null && grant.getPriorityDisplayExpireAt().isAfter(now);
        int contactUnlockQuota = (grant != null && grant.getContactUnlockQuota() != null) ? grant.getContactUnlockQuota() : 0;
        int aiScoreQuota = (grant != null && grant.getAiScoreQuota() != null) ? grant.getAiScoreQuota() : 0;

        CandidateBenefitResponse res = CandidateBenefitResponse.builder()
                .userId(user.getId())
                .isBoostActive(isBoostActive)
                .boostCvExpireAt(grant != null ? grant.getBoostCvExpireAt() : null)
                .isFeaturedBadgeActive(isFeaturedBadgeActive)
                .featuredBadgeExpireAt(grant != null ? grant.getFeaturedBadgeExpireAt() : null)
                .isPriorityActive(isPriorityActive)
                .priorityDisplayExpireAt(grant != null ? grant.getPriorityDisplayExpireAt() : null)
                .contactUnlockQuota(contactUnlockQuota)
                .aiScoreQuota(aiScoreQuota)
                .unlockedCompanyIds(companyIds)
                .unlockedCompanies(companyInfos)
                .build();

        return ResponseEntity.ok(Map.of("success", true, "data", res));
    }

    /**
     * Mua gói combo tiện ích ứng tuyển bằng Token với cơ chế chống bấm đúp Idempotency.
     */
    @PostMapping("/combo/purchase")
    public ResponseEntity<com.fit.project.dto.wallet.PurchaseComboResponse> purchaseCombo(
            @RequestBody com.fit.project.dto.wallet.PurchaseComboRequest request,
            @RequestHeader(value = "X-Idempotency-Key", required = false) String headerIdempotencyKey,
            @RequestHeader(value = CurrentUserService.HEADER, required = false) Integer currentUserId) {
        User user = currentUserService.requireUser(currentUserId);
        com.fit.project.dto.wallet.PurchaseComboResponse response = walletService.purchaseCombo(user, request, headerIdempotencyKey);
        return ResponseEntity.ok(response);
    }
}
