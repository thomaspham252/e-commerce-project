package com.fit.project.service;

import com.fit.project.dto.employer.EmployerOrderResponse;
import com.fit.project.dto.employer.EmployerSubscriptionResponse;
import com.fit.project.entity.Company;
import com.fit.project.entity.Order;
import com.fit.project.entity.Package;
import com.fit.project.entity.Subscription;
import com.fit.project.entity.User;
import com.fit.project.enums.OrderType;
import com.fit.project.enums.SubscriptionStatus;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.CompanyRepository;
import com.fit.project.repository.JobRepository;
import com.fit.project.repository.OrderRepository;
import com.fit.project.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Gói dịch vụ của NTD lấy từ bảng subscriptions: gói đang dùng, hạn mức tin đăng và lịch sử mua gói.
 * <ul>
 *   <li>Đang có gói (ACTIVE): được đăng {@code packages.job_post_limit} tin kể từ ngày gói bắt đầu (null = không giới hạn).</li>
 *   <li>Chưa từng mua gói (FREE): được đăng miễn phí {@value #FREE_JOB_POSTS} tin.</li>
 *   <li>Gói gần nhất đã hết hạn (EXPIRED): phải gia hạn hoặc mua gói mới mới đăng tiếp được.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmployerSubscriptionService {

    /** Số tin được đăng miễn phí khi NTD chưa từng mua gói. */
    public static final int FREE_JOB_POSTS = 3;

    private final SubscriptionRepository subscriptionRepository;
    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final OrderRepository orderRepository;

    public EmployerSubscriptionResponse getCurrent(User employer) {
        LocalDateTime now = LocalDateTime.now();
        String companyName = companyRepository.findFirstByOwnerIdOrderByIdAsc(employer.getId())
                .map(Company::getName).orElse(null);

        Optional<Subscription> current = currentSubscription(employer, now);
        if (current.isPresent()) {
            Subscription s = current.get();
            Package p = s.getPackageEntity();
            long used = jobRepository.countByCompanyOwnerIdAndCreatedAtGreaterThanEqual(employer.getId(), s.getStartAt());
            long remainingDays = Math.max(0, (long) Math.ceil(Duration.between(now, s.getEndAt()).toHours() / 24.0));
            return new EmployerSubscriptionResponse("ACTIVE", s.getId(), p.getId(), p.getName(), companyName,
                    s.getStartAt(), s.getEndAt(), remainingDays, used, p.getJobPostLimit(), p.getCvViewLimit(),
                    Boolean.TRUE.equals(p.getCanDirectContact()), Boolean.TRUE.equals(p.getCanHighlightJobs()),
                    Boolean.TRUE.equals(p.getCanPrioritizeJobs()), Boolean.TRUE.equals(p.getCanSearchCandidates()),
                    s.getOrder() != null ? s.getOrder().getOrderCode() : null);
        }

        long totalJobs = jobRepository.countByCompanyOwnerId(employer.getId());
        Optional<Subscription> latest = subscriptionRepository.findFirstByEmployerIdOrderByEndAtDesc(employer.getId());
        if (latest.isPresent()) {
            Subscription s = latest.get();
            Package p = s.getPackageEntity();
            long used = jobRepository.countByCompanyOwnerIdAndCreatedAtGreaterThanEqual(employer.getId(), s.getStartAt());
            return new EmployerSubscriptionResponse("EXPIRED", s.getId(), p.getId(), p.getName(), companyName,
                    s.getStartAt(), s.getEndAt(), 0, used, p.getJobPostLimit(), p.getCvViewLimit(),
                    false, false, false, false,
                    s.getOrder() != null ? s.getOrder().getOrderCode() : null);
        }

        return new EmployerSubscriptionResponse("FREE", null, null, "Gói miễn phí", companyName,
                null, null, 0, totalJobs, FREE_JOB_POSTS, 0,
                false, false, false, false, null);
    }

    /** Chặn tạo tin khi hết hạn mức; gọi trước khi lưu tin mới. */
    public void assertCanPostJob(User employer) {
        EmployerSubscriptionResponse sub = getCurrent(employer);
        if ("EXPIRED".equals(sub.status())) {
            throw ApiException.forbidden("Gói dịch vụ của bạn đã hết hạn. Vui lòng gia hạn hoặc mua gói mới để tiếp tục đăng tin.");
        }
        if (sub.maxJobPosts() != null && sub.usedJobPosts() >= sub.maxJobPosts()) {
            throw ApiException.forbidden("FREE".equals(sub.status())
                    ? "Bạn đã dùng hết " + FREE_JOB_POSTS + " tin đăng miễn phí. Vui lòng mua gói dịch vụ để đăng thêm tin."
                    : "Bạn đã dùng hết " + sub.maxJobPosts() + " tin đăng của gói hiện tại. Vui lòng nâng cấp gói để đăng thêm.");
        }
    }

    /** Lịch sử đơn mua gói của chính NTD, mới nhất trước. */
    public List<EmployerOrderResponse> listOrders(User employer) {
        return orderRepository.findByUserIdAndOrderTypeOrderByCreatedAtDesc(employer.getId(), OrderType.SUBSCRIPTION)
                .stream()
                .map(EmployerSubscriptionService::toOrderResponse)
                .toList();
    }

    private Optional<Subscription> currentSubscription(User employer, LocalDateTime now) {
        return subscriptionRepository.findInEffect(employer.getId(), SubscriptionStatus.ACTIVE, now)
                .stream().findFirst();
    }

    private static EmployerOrderResponse toOrderResponse(Order o) {
        String name = o.getPackageEntity() != null ? o.getPackageEntity().getName() : "Gói dịch vụ NTD";
        return new EmployerOrderResponse(o.getOrderCode(), name, o.getTotalAmount(),
                o.getStatus().name(), o.getCreatedAt(), o.getPaidAt());
    }
}
