package com.fit.project.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Arrays;
import java.util.Optional;

/**
 * Danh mục các gói combo tiện ích ứng tuyển JobViet.
 * Cố định 3 gói theo quy định trong đặc tả nghiệp vụ:
 * 1. Nổi bật (30 token)
 * 2. Liên hệ nhanh (50 token)
 * 3. Toàn diện (90 token)
 */
@Getter
@RequiredArgsConstructor
public enum UtilityComboType {

    HIGHLIGHT(
            "COMBO_HIGHLIGHT",
            "Nổi bật",
            30,
            45,
            72,  // 72h Đẩy CV
            72,  // 72h Huy hiệu nổi bật
            0,   // Không có ưu tiên hiển thị
            0,   // Không có lượt mở khóa liên hệ
            0    // Không có AI Resume Score
    ),
    QUICK_CONTACT(
            "COMBO_QUICK_CONTACT",
            "Liên hệ nhanh",
            50,
            75,
            72,  // 72h Đẩy CV
            72,  // 72h Huy hiệu nổi bật
            0,   // Không có ưu tiên hiển thị
            3,   // 3 lượt mở khóa chat công ty NTD
            0    // Không có AI Resume Score
    ),
    COMPREHENSIVE(
            "COMBO_COMPREHENSIVE",
            "Toàn diện",
            90,
            110,
            72,  // 72h Đẩy CV
            72,  // 72h Huy hiệu nổi bật
            7,   // 7 ngày ưu tiên hiển thị
            3,   // 3 lượt mở khóa chat công ty NTD
            1    // 1 lượt AI Resume Score
    );

    private final String code;
    private final String displayName;
    private final int priceToken;
    private final int originalPriceToken;
    private final int boostHours;
    private final int badgeHours;
    private final int priorityDisplayDays;
    private final int contactUnlockQuota;
    private final int aiScoreQuota;

    /**
     * Tìm kiếm gói combo theo mã code (ví dụ: COMBO_HIGHLIGHT hoặc HIGHLIGHT).
     */
    public static Optional<UtilityComboType> fromCode(String code) {
        if (code == null || code.isBlank()) {
            return Optional.empty();
        }
        String normalized = code.trim().toUpperCase();
        return Arrays.stream(values())
                .filter(c -> c.getCode().equalsIgnoreCase(normalized) || c.name().equalsIgnoreCase(normalized))
                .findFirst();
    }
}

