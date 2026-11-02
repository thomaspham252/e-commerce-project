package com.fit.project.controller;

import com.fit.project.dto.wallet.TokenPackageResponse;
import com.fit.project.entity.TokenPackage;
import com.fit.project.exception.ApiException;
import com.fit.project.enums.UserRole;
import com.fit.project.repository.TokenPackageRepository;
import com.fit.project.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Endpoint cung cấp danh sách gói nạp Token từ database và quản lý bởi Admin.
 */
@RestController
@RequestMapping("/api/v1/token-packages")
@RequiredArgsConstructor
public class TokenPackageController {

    private final TokenPackageRepository tokenPackageRepository;
    private final CurrentUserService currentUserService;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getTokenPackages(
            @RequestHeader(value = CurrentUserService.HEADER, required = false) Integer userId,
            @RequestParam(name = "all", defaultValue = "false") boolean all) {
        if (all) {
            // Danh sách đầy đủ (kể cả gói đã tắt) chỉ dành cho Admin
            currentUserService.require(userId, UserRole.ADMIN);
        }
        List<TokenPackage> packages = all ? tokenPackageRepository.findAll() : tokenPackageRepository.findByIsActiveTrue();

        List<TokenPackageResponse> responses = packages.stream().map(pkg -> {
            int bonus = pkg.getBonusTokens() != null ? pkg.getBonusTokens() : 0;
            boolean isPopular = Boolean.TRUE.equals(pkg.getIsPopular());
            String badge = pkg.getBadgeLabel();
            String desc = pkg.getDescription() != null ? pkg.getDescription() : ("Gói nạp " + pkg.getTokens() + " Token");

            // Mặc định hỗ trợ gợi ý nếu dữ liệu chưa set
            if (pkg.getBonusTokens() == null || pkg.getBonusTokens() == 0) {
                if (pkg.getTokens() == 120 || pkg.getTokens() == 100) {
                    bonus = 15;
                    isPopular = true;
                    if (badge == null) badge = "Tặng 15% Token • Phổ biến ⭐";
                } else if (pkg.getTokens() == 300 || pkg.getTokens() == 200) {
                    bonus = 40;
                    if (badge == null) badge = "Tiết kiệm 5% chi phí";
                } else if (pkg.getTokens() >= 500) {
                    bonus = 120;
                    if (badge == null) badge = "Siêu ưu đãi VIP • Tặng 120 Token";
                }
            }

            int total = pkg.getTokens() + bonus;

            return TokenPackageResponse.builder()
                    .id(pkg.getId())
                    .tokens(pkg.getTokens())
                    .price(pkg.getPrice())
                    .priceVND(pkg.getPrice())
                    .bonusTokens(bonus)
                    .totalTokens(total)
                    .isPopular(isPopular)
                    .badgeLabel(badge)
                    .description(desc)
                    .isActive(pkg.getIsActive())
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", responses
        ));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<Map<String, Object>> createTokenPackage(
            @RequestHeader(value = CurrentUserService.HEADER, required = false) Integer userId,
            @RequestBody Map<String, Object> payload) {
        currentUserService.require(userId, UserRole.ADMIN);
        Integer tokens = intField(payload, "tokens", "Số Token", 1);
        BigDecimal price = priceField(payload);
        if (tokens == null) throw ApiException.badRequest("Vui lòng nhập số Token");
        if (price == null) throw ApiException.badRequest("Vui lòng nhập giá bán");
        Integer bonusValue = intField(payload, "bonusTokens", "Số Token tặng thêm", 0);
        int bonus = bonusValue != null ? bonusValue : 0;
        String badge = payload.get("badgeLabel") != null ? payload.get("badgeLabel").toString() : null;
        String desc = payload.get("description") != null ? payload.get("description").toString() : null;
        boolean popular = payload.get("isPopular") != null && Boolean.parseBoolean(payload.get("isPopular").toString());

        TokenPackage pkg = TokenPackage.builder()
                .tokens(tokens)
                .price(price)
                .bonusTokens(bonus)
                .badgeLabel(badge)
                .description(desc)
                .isPopular(popular)
                .isActive(true)
                .build();
        TokenPackage saved = tokenPackageRepository.save(pkg);
        return ResponseEntity.ok(Map.of("success", true, "data", saved));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateTokenPackage(
            @RequestHeader(value = CurrentUserService.HEADER, required = false) Integer userId,
            @PathVariable Integer id,
            @RequestBody Map<String, Object> payload) {
        currentUserService.require(userId, UserRole.ADMIN);
        TokenPackage pkg = tokenPackageRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy gói Token ID: " + id));

        Integer tokens = intField(payload, "tokens", "Số Token", 1);
        if (tokens != null) {
            pkg.setTokens(tokens);
        }
        BigDecimal price = priceField(payload);
        if (price != null) {
            pkg.setPrice(price);
        }
        Integer bonus = intField(payload, "bonusTokens", "Số Token tặng thêm", 0);
        if (bonus != null) {
            pkg.setBonusTokens(bonus);
        }
        if (payload.containsKey("badgeLabel")) {
            pkg.setBadgeLabel(payload.get("badgeLabel") != null ? payload.get("badgeLabel").toString() : null);
        }
        if (payload.containsKey("description")) {
            pkg.setDescription(payload.get("description") != null ? payload.get("description").toString() : null);
        }
        if (payload.containsKey("isPopular")) {
            pkg.setIsPopular(Boolean.parseBoolean(payload.get("isPopular").toString()));
        }

        TokenPackage saved = tokenPackageRepository.save(pkg);
        return ResponseEntity.ok(Map.of("success", true, "data", saved));
    }

    /** Đọc số nguyên từ payload; null nếu không gửi. Sai định dạng hoặc nhỏ hơn min → 400. */
    private static Integer intField(Map<String, Object> payload, String key, String label, int min) {
        Object raw = payload.get(key);
        if (raw == null || raw.toString().isBlank()) return null;
        int value;
        try {
            value = new BigDecimal(raw.toString().trim()).intValueExact();
        } catch (NumberFormatException | ArithmeticException e) {
            throw ApiException.badRequest(label + " phải là số nguyên hợp lệ");
        }
        if (value < min) {
            throw ApiException.badRequest(label + (min > 0 ? " phải lớn hơn 0" : " không được âm"));
        }
        return value;
    }

    /** Giá bán (nhận priceVND hoặc price); null nếu không gửi. Sai định dạng hoặc ≤ 0 → 400. */
    private static BigDecimal priceField(Map<String, Object> payload) {
        Object raw = payload.get("priceVND") != null ? payload.get("priceVND") : payload.get("price");
        if (raw == null || raw.toString().isBlank()) return null;
        BigDecimal price;
        try {
            price = new BigDecimal(raw.toString().trim());
        } catch (NumberFormatException e) {
            throw ApiException.badRequest("Giá bán phải là số hợp lệ");
        }
        if (price.signum() <= 0) {
            throw ApiException.badRequest("Giá bán phải lớn hơn 0");
        }
        return price;
    }

    @PatchMapping("/{id}/toggle-status")
    @Transactional
    public ResponseEntity<Map<String, Object>> toggleTokenPackageStatus(
            @RequestHeader(value = CurrentUserService.HEADER, required = false) Integer userId,
            @PathVariable Integer id) {
        currentUserService.require(userId, UserRole.ADMIN);
        TokenPackage pkg = tokenPackageRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy gói Token ID: " + id));
        pkg.setIsActive(!Boolean.TRUE.equals(pkg.getIsActive()));
        TokenPackage saved = tokenPackageRepository.save(pkg);
        return ResponseEntity.ok(Map.of("success", true, "data", saved));
    }
}
