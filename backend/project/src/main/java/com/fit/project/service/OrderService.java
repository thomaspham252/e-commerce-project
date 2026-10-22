package com.fit.project.service;

import com.fit.project.dto.order.CreateOrderRequest;
import com.fit.project.dto.order.OrderResponse;
import com.fit.project.dto.order.OrderStatusResponse;
import com.fit.project.entity.Order;
import com.fit.project.entity.Package;
import com.fit.project.entity.TokenPackage;
import com.fit.project.entity.User;
import com.fit.project.enums.OrderStatus;
import com.fit.project.enums.OrderType;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.OrderRepository;
import com.fit.project.repository.PackageRepository;
import com.fit.project.repository.TokenPackageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

/**
 * Service quản lý vòng đời đơn hàng thanh toán mua gói và nạp token.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final PackageRepository packageRepository;
    private final TokenPackageRepository tokenPackageRepository;
    private final CurrentUserService currentUserService;

    @Value("${sepay.bank-code:MBBank}")
    private String bankCode;

    @Value("${sepay.account-number:0383792033}")
    private String accountNumber;

    @Value("${sepay.account-holder:CONG TY TNHH JOBVIET}")
    private String accountHolder;

    private final Random random = new Random();

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, Integer currentUserId) {
        User user = currentUserService.requireUser(currentUserId);

        if (request.getOrderType() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Vui lòng chọn loại đơn hàng (subscription hoặc token)");
        }

        BigDecimal subtotal;
        String serviceName;
        Package packageEntity = null;
        TokenPackage tokenPackage = null;
        Map<String, Object> snapshotMap = new HashMap<>();

        if (request.getOrderType() == OrderType.TOKEN) {
            if (request.getTokenPackageId() == null) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Vui lòng chọn gói nạp Token");
            }
            tokenPackage = tokenPackageRepository.findById(request.getTokenPackageId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Gói Token không tồn tại"));
            subtotal = tokenPackage.getPrice();
            serviceName = "Gói nạp " + tokenPackage.getTokens() + " Token";
            snapshotMap.put("tokens", tokenPackage.getTokens());
            snapshotMap.put("price", tokenPackage.getPrice());
            snapshotMap.put("name", serviceName);
        } else {
            if (request.getPackageId() == null) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Vui lòng chọn gói dịch vụ hội viên");
            }
            packageEntity = packageRepository.findById(request.getPackageId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Gói dịch vụ không tồn tại"));
            subtotal = packageEntity.getPrice();
            serviceName = packageEntity.getName();
            snapshotMap.put("packageId", packageEntity.getId());
            snapshotMap.put("name", packageEntity.getName());
            snapshotMap.put("price", packageEntity.getPrice());
            snapshotMap.put("durationDays", packageEntity.getDurationDays());
            snapshotMap.put("jobPostLimit", packageEntity.getJobPostLimit());
            snapshotMap.put("cvViewLimit", packageEntity.getCvViewLimit());
            snapshotMap.put("includedTokens", packageEntity.getIncludedTokens());
        }

        String productSnapshot;
        if (request.getOrderType() == OrderType.TOKEN && tokenPackage != null) {
            productSnapshot = String.format("{\"tokens\":%d,\"price\":%s,\"name\":\"%s\"}",
                    tokenPackage.getTokens(), tokenPackage.getPrice(), serviceName);
        } else if (packageEntity != null) {
            productSnapshot = String.format("{\"packageId\":%d,\"name\":\"%s\",\"price\":%s,\"durationDays\":%d}",
                    packageEntity.getId(), packageEntity.getName(), packageEntity.getPrice(), packageEntity.getDurationDays());
        } else {
            productSnapshot = "{}";
        }

        String dateStr = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        String randomSuffix = String.format("%04d", random.nextInt(10000));
        String orderCode = "PAY-" + dateStr + "-" + randomSuffix;

        Order order = Order.builder()
                .orderCode(orderCode)
                .user(user)
                .orderType(request.getOrderType())
                .packageEntity(packageEntity)
                .tokenPackage(tokenPackage)
                .subtotal(subtotal)
                .discountAmount(BigDecimal.ZERO)
                .totalAmount(subtotal)
                .productSnapshot(productSnapshot)
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        Order saved = orderRepository.save(order);
        log.info("Khởi tạo đơn hàng mới: orderCode={}, userId={}, totalAmount={}", orderCode, user.getId(), subtotal);

        return toOrderResponse(saved, serviceName);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByCode(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng: " + orderCode));
        String serviceName = extractServiceName(order);
        return toOrderResponse(order, serviceName);
    }

    @Transactional(readOnly = true)
    public OrderStatusResponse getOrderStatus(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng: " + orderCode));
        return OrderStatusResponse.builder()
                .orderCode(order.getOrderCode())
                .status(order.getStatus().name())
                .amount(order.getTotalAmount())
                .actualAmount(order.getStatus() == OrderStatus.PAID || order.getStatus() == OrderStatus.FULFILLED ? order.getTotalAmount() : null)
                .paidAt(order.getPaidAt() != null ? order.getPaidAt().toString() : null)
                .build();
    }

    @Transactional
    public void cancelOrder(String orderCode, Integer currentUserId) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng: " + orderCode));
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Chỉ có thể hủy đơn hàng ở trạng thái Chờ thanh toán");
        }
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        log.info("Đã hủy đơn hàng: orderCode={}", orderCode);
    }

    private String extractServiceName(Order order) {
        if (order.getOrderType() == OrderType.TOKEN && order.getTokenPackage() != null) {
            return "Gói nạp " + order.getTokenPackage().getTokens() + " Token";
        }
        if (order.getPackageEntity() != null) {
            return order.getPackageEntity().getName();
        }
        return "Dịch vụ JobViet";
    }

    public OrderResponse toOrderResponse(Order order, String serviceName) {
        String cleanCode = order.getOrderCode().replace("-", "");
        String transferContent = "JOBVIET " + cleanCode;
        String encodedContent = URLEncoder.encode(transferContent, StandardCharsets.UTF_8);
        String qrUrl = String.format("https://img.vietqr.io/image/%s-%s-compact2.png?amount=%d&addInfo=%s",
                bankCode, accountNumber, order.getTotalAmount().longValue(), encodedContent);

        LocalDateTime expiresAt = order.getCreatedAt().plusMinutes(15);

        return OrderResponse.builder()
                .orderCode(order.getOrderCode())
                .orderType(order.getOrderType().name())
                .serviceName(serviceName)
                .amount(order.getTotalAmount())
                .actualAmount(order.getStatus() == OrderStatus.PAID || order.getStatus() == OrderStatus.FULFILLED ? order.getTotalAmount() : null)
                .status(order.getStatus().name())
                .bankCode(bankCode)
                .bankName(getBankDisplayName(bankCode))
                .accountNumber(accountNumber)
                .accountHolder(accountHolder)
                .transferContent(transferContent)
                .qrCodeUrl(qrUrl)
                .createdAt(order.getCreatedAt().toString())
                .expiresAt(expiresAt.toString())
                .paidAt(order.getPaidAt() != null ? order.getPaidAt().toString() : null)
                .build();
    }

    private String getBankDisplayName(String code) {
        if (code == null) return "Ngân hàng";
        return switch (code.toUpperCase()) {
            case "BIDV" -> "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)";
            case "MBBANK", "MB" -> "Ngân hàng TMCP Quân Đội (MB)";
            case "VIETCOMBANK", "VCB" -> "Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)";
            case "TECHCOMBANK", "TCB" -> "Ngân hàng TMCP Kỹ Thương Việt Nam (Techcombank)";
            case "VIETINBANK", "CTG" -> "Ngân hàng TMCP Công Thương Việt Nam (VietinBank)";
            case "ACB" -> "Ngân hàng TMCP Á Châu (ACB)";
            case "TPBANK", "TPB" -> "Ngân hàng TMCP Tiên Phong (TPBank)";
            default -> "Ngân hàng " + code;
        };
    }
}
