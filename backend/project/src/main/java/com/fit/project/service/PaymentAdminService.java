package com.fit.project.service;

import com.fit.project.dto.payment.PaymentHistoryResponse;
import com.fit.project.entity.CandidateProfile;
import com.fit.project.entity.Company;
import com.fit.project.entity.Order;
import com.fit.project.entity.Payment;
import com.fit.project.entity.User;
import com.fit.project.enums.OrderType;
import com.fit.project.enums.PaymentStatus;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.CandidateProfileRepository;
import com.fit.project.repository.CompanyRepository;
import com.fit.project.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service phục vụ nghiệp vụ tra cứu và quản lý lịch sử thanh toán của Quản trị viên (Admin).
 */
@Service
@RequiredArgsConstructor
public class PaymentAdminService {

    private final PaymentRepository paymentRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final CompanyRepository companyRepository;

    /**
     * Danh sách giao dịch mới nhất trước. status / orderType = "ALL" hoặc trống thì không lọc;
     * from / to là ngày tạo giao dịch (bao gồm cả hai đầu).
     */
    @Transactional(readOnly = true)
    public Page<PaymentHistoryResponse> getPayments(String status, String orderType, String search,
                                                    LocalDate from, LocalDate to, int page, int size) {
        Pageable pageable = QueryUtils.page(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Payment> payments = paymentRepository.searchForAdmin(
                parseEnum(PaymentStatus.class, status, "Trạng thái giao dịch"),
                parseEnum(OrderType.class, orderType, "Loại giao dịch"),
                from != null ? from.atStartOfDay() : null,
                to != null ? to.plusDays(1).atStartOfDay() : null,
                QueryUtils.likePattern(search),
                pageable);

        Map<Integer, String> names = displayNames(payments.getContent().stream()
                .map(p -> p.getOrder().getUser())
                .filter(Objects::nonNull)
                .map(User::getId)
                .distinct()
                .toList());

        return payments.map(p -> toResponse(p, names));
    }

    /** Thống kê nhanh toàn bộ giao dịch: số lượng theo trạng thái + số giao dịch lệch tiền. */
    @Transactional(readOnly = true)
    public Map<String, Long> getSummary() {
        Map<String, Long> summary = new LinkedHashMap<>();
        for (PaymentStatus s : PaymentStatus.values()) {
            summary.put(s.name(), 0L);
        }
        for (Object[] row : paymentRepository.countGroupByStatus()) {
            summary.put(((PaymentStatus) row[0]).name(), ((Number) row[1]).longValue());
        }
        summary.put("AMOUNT_MISMATCH", paymentRepository.countAmountMismatch(PaymentStatus.SUCCESS));
        return summary;
    }

    private PaymentHistoryResponse toResponse(Payment p, Map<Integer, String> names) {
        Order order = p.getOrder();
        User user = order.getUser();
        return PaymentHistoryResponse.builder()
                .id(p.getId())
                .orderCode(order.getOrderCode())
                .orderType(order.getOrderType().name())
                .serviceName(serviceName(order))
                .userName(user != null ? names.getOrDefault(user.getId(), user.getEmail()) : "N/A")
                .userEmail(user != null ? user.getEmail() : "N/A")
                .expectedAmount(order.getTotalAmount())
                .actualAmount(p.getAmount())
                .referenceCode(p.getTransactionCode())
                .gateway(p.getGateway())
                .status(p.getStatus().name())
                .createdAt(p.getCreatedAt().toString())
                .paidAt(p.getPaidAt() != null ? p.getPaidAt().toString() : null)
                .build();
    }

    private static String serviceName(Order order) {
        if (order.getOrderType() == OrderType.SUBSCRIPTION && order.getPackageEntity() != null) {
            return order.getPackageEntity().getName();
        }
        if (order.getOrderType() == OrderType.TOKEN && order.getTokenPackage() != null) {
            return "Gói " + order.getTokenPackage().getTokens() + " Token";
        }
        return null;
    }

    /** Tên hiển thị: họ tên ứng viên hoặc tên công ty của NTD (không có thì dùng email). */
    private Map<Integer, String> displayNames(List<Integer> userIds) {
        if (userIds.isEmpty()) return Map.of();
        Map<Integer, String> names = new HashMap<>();
        companyRepository.findByOwnerIdIn(userIds)
                .forEach(c -> names.putIfAbsent(c.getOwner().getId(), c.getName()));
        names.putAll(candidateProfileRepository.findByUserIdIn(userIds).stream()
                .collect(Collectors.toMap(CandidateProfile::getUserId, CandidateProfile::getFullName)));
        return names;
    }

    private static <E extends Enum<E>> E parseEnum(Class<E> type, String value, String label) {
        if (value == null || value.isBlank() || "ALL".equalsIgnoreCase(value)) return null;
        try {
            return Enum.valueOf(type, value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest(label + " không hợp lệ: " + value);
        }
    }
}
