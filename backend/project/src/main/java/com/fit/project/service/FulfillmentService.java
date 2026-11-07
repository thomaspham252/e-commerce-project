package com.fit.project.service;

import com.fit.project.entity.*;
import com.fit.project.entity.Package;
import com.fit.project.enums.OrderStatus;
import com.fit.project.enums.OrderType;
import com.fit.project.enums.SubscriptionStatus;
import com.fit.project.enums.TokenTransactionType;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
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
    private final JobRepository jobRepository;
    private final CandidateProfileViewRepository candidateProfileViewRepository;

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
        if (order.getTokenPackage() == null) {
            log.error("Đơn hàng token {} không liên kết với gói token hợp lệ!", order.getOrderCode());
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Đơn hàng token không liên kết với gói token hợp lệ");
        }

        int tokensToAdd = order.getTokenPackage().getTokens();
        if (order.getTokenPackage().getBonusTokens() != null && order.getTokenPackage().getBonusTokens() > 0) {
            tokensToAdd += order.getTokenPackage().getBonusTokens();
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
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Đơn hàng subscription không liên kết với gói dịch vụ hợp lệ");
        }

        int durationDays = packageEntity.getDurationDays();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startAt = now;
        LocalDateTime endAt = now.plusDays(durationDays);
        int bonusJobPosts = 0;
        int bonusCvViews = 0;

        // Tìm gói đang có hiệu lực hiện tại của NTD
        var currentActiveOpt = subscriptionRepository.findInEffect(
                employer.getId(), SubscriptionStatus.ACTIVE, now).stream().findFirst();

        if (currentActiveOpt.isPresent()) {
            Subscription currentSub = currentActiveOpt.get();
            Package currentPkg = currentSub.getPackageEntity();

            if (isHigherTier(packageEntity, currentPkg)) {
                // NÂNG CẤP LÊN GÓI CAO HƠN (VD: Basic -> Pro, Pro -> Enterprise):
                // 1. Tính toán số tin và lượt xem CV còn lại của gói cũ để cộng dồn
                long usedPosts = jobRepository.countBySubscriptionId(currentSub.getId());
                int currentPostLimit = (currentPkg.getJobPostLimit() != null ? currentPkg.getJobPostLimit() : 0)
                        + (currentSub.getBonusJobPosts() != null ? currentSub.getBonusJobPosts() : 0);
                int remainingPosts = Math.max(0, currentPostLimit - (int) usedPosts);

                long usedViews = candidateProfileViewRepository.countBySubscriptionId(currentSub.getId());
                int currentViewLimit = (currentPkg.getCvViewLimit() != null ? currentPkg.getCvViewLimit() : 0)
                        + (currentSub.getBonusCvViews() != null ? currentSub.getBonusCvViews() : 0);
                int remainingViews = Math.max(0, currentViewLimit - (int) usedViews);

                bonusJobPosts = remainingPosts;
                bonusCvViews = remainingViews;

                // 2. Kích hoạt gói mới NGAY LẬP TỨC
                startAt = now;
                endAt = now.plusDays(durationDays);

                // 3. Đóng gói cũ ngay (chuyển sang EXPIRED và set endAt về hiện tại)
                currentSub.setStatus(SubscriptionStatus.EXPIRED);
                currentSub.setEndAt(now);
                subscriptionRepository.save(currentSub);

                log.info("NÂNG CẤP GÓI: employerId={} nâng cấp từ {} lên {}. Kích hoạt ngay lập tức. Cộng dồn: +{} tin tuyển dụng, +{} lượt xem CV.",
                        employer.getId(), currentPkg.getName(), packageEntity.getName(), bonusJobPosts, bonusCvViews);
            } else {
                // CÙNG GÓI HOẶC GÓI THẤP HƠN: Giữ cơ chế gối đầu / gia hạn nối tiếp
                var latestActive = subscriptionRepository.findFirstByEmployerIdAndStatusOrderByEndAtDesc(
                        employer.getId(), SubscriptionStatus.ACTIVE);
                if (latestActive.isPresent() && latestActive.get().getEndAt().isAfter(now)) {
                    startAt = latestActive.get().getEndAt();
                    endAt = startAt.plusDays(durationDays);
                }
            }
        }

        Subscription subscription = Subscription.builder()
                .employer(employer)
                .packageEntity(packageEntity)
                .order(order)
                .startAt(startAt)
                .endAt(endAt)
                .bonusJobPosts(bonusJobPosts)
                .bonusCvViews(bonusCvViews)
                .status(SubscriptionStatus.ACTIVE)
                .build();
        subscriptionRepository.save(subscription);
        log.info("Kích hoạt gói {} cho employerId={}, hiệu lực từ {} đến {}, bonusJobPosts={}, bonusCvViews={}",
                packageEntity.getName(), employer.getId(), startAt, endAt, bonusJobPosts, bonusCvViews);
    }

    private boolean isHigherTier(Package newPkg, Package oldPkg) {
        if (newPkg == null || oldPkg == null) return false;
        // So sánh theo giá bán: gói mới đắt hơn gói cũ -> Nâng cấp
        if (newPkg.getPrice() != null && oldPkg.getPrice() != null) {
            return newPkg.getPrice().compareTo(oldPkg.getPrice()) > 0;
        }
        int newLimit = newPkg.getJobPostLimit() != null ? newPkg.getJobPostLimit() : 0;
        int oldLimit = oldPkg.getJobPostLimit() != null ? oldPkg.getJobPostLimit() : 0;
        return newLimit > oldLimit;
    }
}
