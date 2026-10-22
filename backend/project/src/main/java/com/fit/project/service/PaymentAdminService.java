package com.fit.project.service;

import com.fit.project.dto.payment.PaymentHistoryResponse;
import com.fit.project.entity.Order;
import com.fit.project.entity.Payment;
import com.fit.project.repository.OrderRepository;
import com.fit.project.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service phục vụ nghiệp vụ tra cứu và quản lý lịch sử thanh toán của Quản trị viên (Admin).
 */
@Service
@RequiredArgsConstructor
public class PaymentAdminService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public Page<PaymentHistoryResponse> getPayments(String status, String orderType, String search, Pageable pageable) {
        Page<Payment> paymentPage = paymentRepository.findAllByOrderByCreatedAtDesc(pageable);

        List<PaymentHistoryResponse> list = paymentPage.getContent().stream().map(p -> {
            Order order = p.getOrder();
            String userName = order.getUser() != null ? order.getUser().getEmail() : "N/A";
            String userEmail = order.getUser() != null ? order.getUser().getEmail() : "N/A";

            return PaymentHistoryResponse.builder()
                    .id(p.getId())
                    .orderCode(order.getOrderCode())
                    .orderType(order.getOrderType().name())
                    .userName(userName)
                    .userEmail(userEmail)
                    .expectedAmount(order.getTotalAmount())
                    .actualAmount(p.getAmount())
                    .referenceCode(p.getTransactionCode())
                    .gateway(p.getGateway())
                    .status(p.getStatus().name())
                    .createdAt(p.getCreatedAt().toString())
                    .paidAt(p.getPaidAt() != null ? p.getPaidAt().toString() : null)
                    .build();
        }).collect(Collectors.toList());

        // Lọc theo search nếu có
        if (search != null && !search.isBlank()) {
            String q = search.trim().toLowerCase();
            list = list.stream().filter(item ->
                    item.getOrderCode().toLowerCase().contains(q) ||
                    item.getUserEmail().toLowerCase().contains(q) ||
                    (item.getReferenceCode() != null && item.getReferenceCode().toLowerCase().contains(q))
            ).collect(Collectors.toList());
        }

        return new PageImpl<>(list, pageable, paymentPage.getTotalElements());
    }
}
