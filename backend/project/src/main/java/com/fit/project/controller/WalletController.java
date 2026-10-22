package com.fit.project.controller;

import com.fit.project.dto.wallet.ConsumeTokenRequest;
import com.fit.project.dto.wallet.WalletResponse;
import com.fit.project.dto.wallet.WalletTransactionResponse;
import com.fit.project.entity.Order;
import com.fit.project.entity.TokenTransaction;
import com.fit.project.entity.TokenWallet;
import com.fit.project.entity.User;
import com.fit.project.enums.OrderStatus;
import com.fit.project.enums.OrderType;
import com.fit.project.enums.TokenTransactionType;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.OrderRepository;
import com.fit.project.repository.ServiceFeeRepository;
import com.fit.project.repository.TokenTransactionRepository;
import com.fit.project.repository.TokenWalletRepository;
import com.fit.project.service.CurrentUserService;
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
@Transactional(readOnly = true)
public class WalletController {

    private final CurrentUserService currentUserService;
    private final TokenWalletRepository tokenWalletRepository;
    private final TokenTransactionRepository tokenTransactionRepository;
    private final OrderRepository orderRepository;
    private final ServiceFeeRepository serviceFeeRepository;

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
                    "serviceName", "Nạp Token Ứng viên",
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
    @Transactional
    public ResponseEntity<Map<String, Object>> consumeTokens(
            @RequestBody ConsumeTokenRequest request,
            @RequestHeader(value = CurrentUserService.HEADER, required = false) Integer currentUserId) {
        User user = currentUserService.requireUser(currentUserId);

        TokenWallet wallet = tokenWalletRepository.findByUserId(user.getId())
                .orElseGet(() -> tokenWalletRepository.save(TokenWallet.builder()
                        .user(user)
                        .balance(0)
                        .build()));

        int cost = request.getTokenCost() != null ? request.getTokenCost() : 0;
        String featureTitle = request.getFeatureName() != null ? request.getFeatureName() : request.getFeatureKey();

        if (request.getFeatureKey() != null) {
            var feeOpt = serviceFeeRepository.findByFeatureKey(request.getFeatureKey());
            if (feeOpt.isPresent()) {
                cost = feeOpt.get().getTokenCost();
                featureTitle = feeOpt.get().getFeatureName();
            }
        }

        if (cost <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Số token sử dụng phải lớn hơn 0");
        }

        if (wallet.getBalance() < cost) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "error", "INSUFFICIENT_BALANCE",
                    "message", "Số dư không đủ. Cần " + cost + " token nhưng bạn chỉ còn " + wallet.getBalance() + " token."
            ));
        }

        int newBalance = wallet.getBalance() - cost;
        wallet.setBalance(newBalance);
        tokenWalletRepository.save(wallet);

        String idempKey = "consume:" + user.getId() + ":" + System.currentTimeMillis();
        TokenTransaction tx = TokenTransaction.builder()
                .wallet(wallet)
                .type(TokenTransactionType.SPEND)
                .amount(-cost)
                .balanceAfter(newBalance)
                .idempotencyKey(idempKey)
                .refType(featureTitle)
                .createdAt(LocalDateTime.now())
                .build();
        tokenTransactionRepository.save(tx);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "wallet", Map.of(
                        "userId", user.getId(),
                        "balance", newBalance
                ),
                "transaction", Map.of(
                        "id", "TX-TOK-" + tx.getId(),
                        "amount", -cost,
                        "balanceAfter", newBalance
                )
        ));
    }
}
