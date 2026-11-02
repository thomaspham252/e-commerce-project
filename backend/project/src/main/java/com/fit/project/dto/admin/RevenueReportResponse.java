package com.fit.project.dto.admin;

import java.util.List;

/**
 * Báo cáo doanh thu Admin: biểu đồ cột theo thời gian, cơ cấu nguồn thu (biểu đồ tròn) và tổng hợp.
 * Chỉ tính các đơn đã thanh toán (PAID/FULFILLED), theo thời điểm thanh toán paid_at. Đơn vị: VND.
 */
public record RevenueReportResponse(String from, String to, List<Point> timeline, List<Source> sources, Summary summary) {

    /** Một cột trên biểu đồ (một ngày, hoặc một tháng khi khoảng thời gian dài). */
    public record Point(String date, String label, long packageRevenue, long tokenRevenue, long totalRevenue) {
    }

    /** Một nguồn thu: SUBSCRIPTION (gói dịch vụ NTD) hoặc TOKEN (nạp token). */
    public record Source(String source, long amount, long orders) {
    }

    public record Summary(long totalRevenue, long packageRevenueTotal, long tokenRevenueTotal,
                          long totalOrders, long packageOrders, long tokenOrders, long averageOrderValue) {
    }
}
