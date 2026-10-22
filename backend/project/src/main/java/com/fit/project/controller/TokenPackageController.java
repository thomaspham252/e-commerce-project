package com.fit.project.controller;

import com.fit.project.dto.wallet.TokenPackageResponse;
import com.fit.project.entity.TokenPackage;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.TokenPackageRepository;
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

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getTokenPackages(
            @RequestParam(name = "all", defaultValue = "false") boolean all) {
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
    public ResponseEntity<Map<String, Object>> createTokenPackage(@RequestBody Map<String, Object> payload) {
        int tokens = Integer.parseInt(payload.get("tokens").toString());
        BigDecimal price = new BigDecimal(payload.get("priceVND") != null ? payload.get("priceVND").toString() : payload.get("price").toString());
        int bonus = payload.get("bonusTokens") != null ? Integer.parseInt(payload.get("bonusTokens").toString()) : 0;
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
    public ResponseEntity<Map<String, Object>> updateTokenPackage(@PathVariable Integer id, @RequestBody Map<String, Object> payload) {
        TokenPackage pkg = tokenPackageRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy gói Token ID: " + id));

        if (payload.containsKey("tokens") && payload.get("tokens") != null) {
            pkg.setTokens(Integer.parseInt(payload.get("tokens").toString()));
        }
        if (payload.containsKey("priceVND") && payload.get("priceVND") != null) {
            pkg.setPrice(new BigDecimal(payload.get("priceVND").toString()));
        } else if (payload.containsKey("price") && payload.get("price") != null) {
            pkg.setPrice(new BigDecimal(payload.get("price").toString()));
        }
        if (payload.containsKey("bonusTokens") && payload.get("bonusTokens") != null) {
            pkg.setBonusTokens(Integer.parseInt(payload.get("bonusTokens").toString()));
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

    @PatchMapping("/{id}/toggle-status")
    @Transactional
    public ResponseEntity<Map<String, Object>> toggleTokenPackageStatus(@PathVariable Integer id) {
        TokenPackage pkg = tokenPackageRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy gói Token ID: " + id));
        pkg.setIsActive(!Boolean.TRUE.equals(pkg.getIsActive()));
        TokenPackage saved = tokenPackageRepository.save(pkg);
        return ResponseEntity.ok(Map.of("success", true, "data", saved));
    }
}
