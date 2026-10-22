package com.fit.project.service;

import com.fit.project.entity.Order;
import com.fit.project.enums.OrderStatus;
import com.fit.project.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Tác vụ nền định kỳ quét và cập nhật các đơn hàng quá thời hạn 15 phút chưa thanh toán thành CANCELLED.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderExpiryScheduler {

    private final OrderRepository orderRepository;

    @Scheduled(cron = "0 * * * * ?") // Chạy mỗi phút 1 lần
    @Transactional
    public void expireOldPendingOrders() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(15);
        List<Order> expiredOrders = orderRepository.findByStatusAndCreatedAtBefore(OrderStatus.PENDING, threshold);

        if (!expiredOrders.isEmpty()) {
            for (Order order : expiredOrders) {
                order.setStatus(OrderStatus.CANCELLED);
                log.info("Đơn hàng {} đã quá 15 phút không thanh toán -> Hủy tự động (Expired).", order.getOrderCode());
            }
            orderRepository.saveAll(expiredOrders);
        }
    }
}
