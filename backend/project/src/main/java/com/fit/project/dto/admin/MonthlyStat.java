package com.fit.project.dto.admin;

/** Một cột của biểu đồ theo tháng. month dạng yyyy-MM, label dạng "T5/2026". */
public record MonthlyStat(String month, String label, long users, long jobs, long applications) {
}
