package com.fit.project.dto.common;

/** Một lát của biểu đồ tròn: key là mã trạng thái (VD: OPEN, PENDING). */
public record CountItem(String key, long count) {
}
