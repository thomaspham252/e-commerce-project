package com.fit.project.service;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

final class QueryUtils {

    private static final int MAX_PAGE_SIZE = 100;

    private QueryUtils() {
    }

    /** Chuyển từ khóa thành pattern LIKE (đã lowercase); rỗng → null để bỏ qua điều kiện. */
    static String likePattern(String keyword) {
        if (keyword == null || keyword.isBlank()) return null;
        return "%" + keyword.trim().toLowerCase() + "%";
    }

    static Pageable page(int page, int size, Sort sort) {
        return PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, MAX_PAGE_SIZE), sort);
    }

    /** Kết quả query dạng [key, count] → Map. */
    static <K> Map<K, Long> toCountMap(List<Object[]> rows) {
        Map<K, Long> map = new HashMap<>();
        for (Object[] row : rows) {
            @SuppressWarnings("unchecked") K key = (K) row[0];
            map.put(key, ((Number) row[1]).longValue());
        }
        return map;
    }
}
