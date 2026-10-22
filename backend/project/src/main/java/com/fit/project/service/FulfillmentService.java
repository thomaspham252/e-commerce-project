package com.fit.project.service;

import com.fit.project.entity.*;
import com.fit.project.entity.Package;
import com.fit.project.enums.OrderStatus;
import com.fit.project.enums.OrderType;
import com.fit.project.enums.SubscriptionStatus;
import com.fit.project.enums.TokenTransactionType;
import com.fit.project.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service xử lý cấp phát quyền lợi (cộng số dư Token hoặc kích hoạt gói Subscription)
 * sau khi đơn hàng được thanh toán thành công.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FulfillmentService {

    private final TokenWalletRepository tokenWalletRepository;
    private final TokenTransactionRepository tokenTransactionRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public void fulfillOrder(Order order) {
        if (order.getStatus() == OrderStatus.FULFILLED) {
            log.warn("Đơn hàng {} đã được cấp phát trước đó, bỏ qua fulfillment.", order.getOrderCode());
            return;
        }

        User user = order.getUser();

        if (order.getOrderType() == OrderType.TOKEN) {
            fulfillTokenOrder(order, user);
        } else if (order.getOrderType() == OrderType.SUBSCRIPTION) {
            fulfillSubscriptionOrder(order, user);
        }

        order.setStatus(OrderStatus.FULFILLED);
        order.setFulfilledAt(LocalDateTime.now());
        orderRepository.save(order);
        log.info("Cấp phát thành công quyền lợi cho đơn hàng {}", order.getOrderCode());
    }

    private void fulfillTokenOrder(Order order, User user) {
        int tokensToAdd = 0;
        if (order.getTokenPackage() != null) {
            tokensToAdd = order.getTokenPackage().getTokens();
            if (order.getTokenPackage().getBonusTokens() != null && order.getTokenPackage().getBonusTokens() > 0) {
                tokensToAdd += order.getTokenPackage().getBonusTokens();
            }
        } else {
            // Trường hợp dự phòng nếu không có FK trực tiếp
            tokensToAdd = 100;
        }

        TokenWallet wallet = tokenWalletRepository.findByUserId(user.getId())
                .orElseGet(() -> tokenWalletRepository.save(TokenWallet.builder()
                        .user(user)
                        .balance(0)
                        .build()));

        int newBalance = wallet.getBalance() + tokensToAdd;
        wallet.setBalance(newBalance);
        tokenWalletRepository.save(wallet);

        String idempotencyKey = "order:" + order.getId();
        if (!tokenTransactionRepository.existsByIdempotencyKey(idempotencyKey)) {
            TokenTransaction tx = TokenTransaction.builder()
                    .wallet(wallet)
                    .type(TokenTransactionType.PURCHASE)
                    .amount(tokensToAdd)
                    .balanceAfter(newBalance)
                    .idempotencyKey(idempotencyKey)
                    .order(order)
                    .createdAt(LocalDateTime.now())
                    .build();
            tokenTransactionRepository.save(tx);
        }

        log.info("Đã cộng {} tokens cho userId={}. Số dư mới: {}", tokensToAdd, user.getId(), newBalance);
    }

    private void fulfillSubscriptionOrder(Order order, User employer) {
        Package packageEntity = order.getPackageEntity();
        if (packageEntity == null) {
            log.error("Đơn hàng subscription {} không có packageEntity liên kết!", order.getOrderCode());
            return;
        }

        int durationDays = packageEntity.getDurationDays();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startAt = now;
        LocalDateTime endAt = now.plusDays(durationDays);

        // Kiểm tra xem nhà tuyển dụng có gói đang active không để gia hạn tiếp
        var existingActive = subscriptionRepository.findFirstByEmployerIdAndStatusOrderByEndAtDesc(
                employer.getId(), SubscriptionStatus.ACTIVE);
        if (existingActive.isPresent() && existingActive.get().getEndAt().isAfter(now)) {
            startAt = existingActive.get().getEndAt();
            endAt = startAt.plusDays(durationDays);
        }

        Subscription subscription = Subscription.builder()
                .employer(employer)
                .packageEntity(packageEntity)
                .order(order)
                .startAt(startAt)
                .endAt(endAt)
                .status(SubscriptionStatus.ACTIVE)
                .build();
        subscriptionRepository.save(subscription);
        log.info("Kích hoạt gói {} cho employerId={}, hiệu lực từ {} đến {}",
                packageEntity.getName(), employer.getId(), startAt, endAt);

        // Nếu gói có tặng kèm tokens thì cộng vào ví của nhà tuyển dụng
        if (packageEntity.getIncludedTokens() != null && packageEntity.getIncludedTokens() > 0) {
            int bonusTokens = packageEntity.getIncludedTokens();
            TokenWallet wallet = tokenWalletRepository.findByUserId(employer.getId())
                    .orElseGet(() -> tokenWalletRepository.save(TokenWallet.builder()
                            .user(employer)
                            .balance(0)
                            .build()));
            int newBalance = wallet.getBalance() + bonusTokens;
            wallet.setBalance(newBalance);
            tokenWalletRepository.save(wallet);

            String idempotencyKey = "subscription_bonus:" + order.getId();
            if (!tokenTransactionRepository.existsByIdempotencyKey(idempotencyKey)) {
                TokenTransaction tx = TokenTransaction.builder()
                        .wallet(wallet)
                        .type(TokenTransactionType.WELCOME)
                        .amount(bonusTokens)
                        .balanceAfter(newBalance)
                        .idempotencyKey(idempotencyKey)
                        .order(order)
                        .createdAt(LocalDateTime.now())
                        .build();
                tokenTransactionRepository.save(tx);
            }
            log.info("Đã tặng {} tokens khuyến mãi đi kèm gói cho employerId={}", bonusTokens, employer.getId());
        }
    }
}
