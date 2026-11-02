package com.fit.project.service;

import com.fit.project.dto.admin.AdminOverviewResponse;
import com.fit.project.dto.admin.MonthlyStat;
import com.fit.project.dto.admin.RevenueReportResponse;
import com.fit.project.dto.common.CountItem;
import com.fit.project.dto.employer.EmployerStatsResponse;
import com.fit.project.dto.employer.EmployerStatsResponse.DayPoint;
import com.fit.project.dto.stats.PublicStatsResponse;
import com.fit.project.enums.*;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.ApplicationRepository;
import com.fit.project.repository.CompanyRepository;
import com.fit.project.repository.JobRepository;
import com.fit.project.repository.OrderRepository;
import com.fit.project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/** Thống kê: biểu đồ cột theo thời gian và biểu đồ tròn theo trạng thái. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatisticsService {

    /** Khoảng dài hơn mức này thì gom cột theo tháng thay vì theo ngày. */
    private static final int MAX_DAILY_POINTS = 62;
    private static final DateTimeFormatter DAY_LABEL = DateTimeFormatter.ofPattern("dd/MM");

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final OrderRepository orderRepository;

    /** Đơn được tính là doanh thu: đã thanh toán (kể cả đã kích hoạt dịch vụ). */
    private static final List<OrderStatus> REVENUE_STATUSES = List.of(OrderStatus.PAID, OrderStatus.FULFILLED);

    // ===== Báo cáo doanh thu (Admin) =====

    /**
     * Doanh thu theo thời gian, tách gói dịch vụ NTD (SUBSCRIPTION) và nạp token (TOKEN).
     * from = null → ngày có đơn thanh toán đầu tiên (chưa có đơn → 30 ngày gần nhất); to = null → hôm nay.
     * Khoảng dài hơn {@value #MAX_DAILY_POINTS} ngày thì gom cột theo tháng.
     */
    public RevenueReportResponse adminRevenue(LocalDate from, LocalDate to) {
        LocalDate end = to != null ? to : LocalDate.now();
        LocalDate start = from;
        if (start == null) {
            LocalDateTime firstPaid = orderRepository.findFirstPaidAt(REVENUE_STATUSES);
            start = firstPaid != null && firstPaid.toLocalDate().isBefore(end)
                    ? firstPaid.toLocalDate()
                    : end.minusDays(29);
        }
        if (start.isAfter(end)) {
            throw ApiException.badRequest("Ngày bắt đầu phải trước ngày kết thúc");
        }

        List<Object[]> rows = orderRepository.findPaidRevenueRows(
                REVENUE_STATUSES, start.atStartOfDay(), end.plusDays(1).atStartOfDay());

        boolean daily = ChronoUnit.DAYS.between(start, end) + 1 <= MAX_DAILY_POINTS;
        // key: ngày đầu của cột (theo ngày hoặc theo tháng) → [doanh thu gói, doanh thu token]
        Map<LocalDate, long[]> buckets = new TreeMap<>();
        long packageRevenue = 0, tokenRevenue = 0, packageOrders = 0, tokenOrders = 0;
        for (Object[] row : rows) {
            LocalDate paidDate = ((LocalDateTime) row[0]).toLocalDate();
            OrderType type = (OrderType) row[1];
            long amount = row[2] != null ? ((BigDecimal) row[2]).setScale(0, RoundingMode.HALF_UP).longValue() : 0L;
            LocalDate key = daily ? paidDate : paidDate.withDayOfMonth(1);
            long[] bucket = buckets.computeIfAbsent(key, k -> new long[2]);
            if (type == OrderType.SUBSCRIPTION) {
                bucket[0] += amount;
                packageRevenue += amount;
                packageOrders++;
            } else {
                bucket[1] += amount;
                tokenRevenue += amount;
                tokenOrders++;
            }
        }

        List<RevenueReportResponse.Point> timeline = new ArrayList<>();
        if (daily) {
            for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
                timeline.add(revenuePoint(d, d.format(DAY_LABEL), buckets.get(d)));
            }
        } else {
            for (YearMonth m = YearMonth.from(start); !m.isAfter(YearMonth.from(end)); m = m.plusMonths(1)) {
                LocalDate d = m.atDay(1);
                timeline.add(revenuePoint(d, "T" + m.getMonthValue() + "/" + m.getYear(), buckets.get(d)));
            }
        }

        long totalRevenue = packageRevenue + tokenRevenue;
        long totalOrders = packageOrders + tokenOrders;
        List<RevenueReportResponse.Source> sources = List.of(
                new RevenueReportResponse.Source(OrderType.SUBSCRIPTION.name(), packageRevenue, packageOrders),
                new RevenueReportResponse.Source(OrderType.TOKEN.name(), tokenRevenue, tokenOrders));
        var summary = new RevenueReportResponse.Summary(totalRevenue, packageRevenue, tokenRevenue,
                totalOrders, packageOrders, tokenOrders, totalOrders > 0 ? Math.round((double) totalRevenue / totalOrders) : 0);
        return new RevenueReportResponse(start.toString(), end.toString(), timeline, sources, summary);
    }

    private static RevenueReportResponse.Point revenuePoint(LocalDate date, String label, long[] bucket) {
        long pkg = bucket != null ? bucket[0] : 0;
        long token = bucket != null ? bucket[1] : 0;
        return new RevenueReportResponse.Point(date.toString(), label, pkg, token, pkg + token);
    }

    // ===== Công khai (Landing Page) =====

    /**
     * Lấy số liệu thống kê thực tế công khai để hiển thị trên Landing Page Nhà tuyển dụng.
     */
    public PublicStatsResponse getPublicStats() {
        long candidates = userRepository.countByRole(UserRole.CANDIDATE);
        long companies = companyRepository.count();
        long jobs = jobRepository.countByStatus(JobStatus.OPEN);
        long applications = applicationRepository.count();
        return new PublicStatsResponse(candidates, companies, jobs, applications);
    }

    // ===== Admin =====

    public AdminOverviewResponse adminOverview() {
        YearMonth thisMonth = YearMonth.now();
        LocalDateTime thisMonthStart = thisMonth.atDay(1).atStartOfDay();
        LocalDateTime lastMonthStart = thisMonth.minusMonths(1).atDay(1).atStartOfDay();
        return new AdminOverviewResponse(
                userRepository.count(),
                userRepository.countByRole(UserRole.CANDIDATE),
                userRepository.countByRole(UserRole.EMPLOYER),
                companyRepository.count(),
                companyRepository.countByVerificationStatus(VerificationStatus.PENDING),
                jobRepository.count(),
                jobRepository.countByStatus(JobStatus.PENDING_REVIEW),
                jobRepository.countByStatus(JobStatus.OPEN),
                applicationRepository.count(),
                userRepository.findCreatedAtBetween(thisMonthStart, LocalDateTime.now().plusSeconds(1)).size(),
                userRepository.findCreatedAtBetween(lastMonthStart, thisMonthStart).size());
    }

    /**
     * Biểu đồ cột: số người dùng mới, tin đăng mới, hồ sơ ứng tuyển theo từng tháng.
     * Có fromMonth/toMonth thì lấy đúng khoảng đó (thiếu toMonth → tháng hiện tại);
     * không có thì lấy {@code months} tháng gần nhất.
     */
    public List<MonthlyStat> adminMonthly(YearMonth fromMonth, YearMonth toMonth, int months) {
        YearMonth last = toMonth != null ? toMonth : YearMonth.now();
        YearMonth first;
        if (fromMonth != null) {
            first = fromMonth;
            if (first.isAfter(last)) {
                throw ApiException.badRequest("Tháng bắt đầu phải trước tháng kết thúc");
            }
            if (ChronoUnit.MONTHS.between(first, last) >= 24) {
                throw ApiException.badRequest("Khoảng thời gian tối đa 24 tháng");
            }
        } else {
            if (months < 1 || months > 24) {
                throw ApiException.badRequest("Số tháng phải từ 1 đến 24");
            }
            first = last.minusMonths(months - 1L);
        }
        LocalDateTime from = first.atDay(1).atStartOfDay();
        LocalDateTime to = last.plusMonths(1).atDay(1).atStartOfDay();

        Map<YearMonth, Long> users = groupByMonth(userRepository.findCreatedAtBetween(from, to));
        Map<YearMonth, Long> jobs = groupByMonth(jobRepository.findCreatedAtBetween(from, to));
        Map<YearMonth, Long> apps = groupByMonth(applicationRepository.findAppliedAtBetween(from, to));

        List<MonthlyStat> result = new ArrayList<>();
        for (YearMonth m = first; !m.isAfter(last); m = m.plusMonths(1)) {
            result.add(new MonthlyStat(m.toString(), "T" + m.getMonthValue() + "/" + m.getYear(),
                    users.getOrDefault(m, 0L), jobs.getOrDefault(m, 0L), apps.getOrDefault(m, 0L)));
        }
        return result;
    }

    /** Biểu đồ tròn: tỷ lệ tin tuyển dụng theo trạng thái. */
    public List<CountItem> adminJobStatus() {
        Map<JobStatus, Long> counts = QueryUtils.toCountMap(jobRepository.countGroupByStatus());
        return Arrays.stream(JobStatus.values())
                .map(s -> new CountItem(s.name(), counts.getOrDefault(s, 0L)))
                .filter(item -> item.count() > 0)
                .toList();
    }

    // ===== Nhà tuyển dụng =====

    /**
     * Thống kê hồ sơ ứng tuyển vào các tin của NTD trong khoảng [from, to].
     * from = null → 1 năm trước to; to = null → hôm nay.
     */
    public EmployerStatsResponse employerStats(Integer ownerId, LocalDate from, LocalDate to) {
        LocalDate end = to != null ? to : LocalDate.now();
        LocalDate start = from != null ? from : end.minusYears(1).plusDays(1);
        if (start.isAfter(end)) {
            throw ApiException.badRequest("Ngày bắt đầu phải trước ngày kết thúc");
        }
        LocalDateTime fromTime = start.atStartOfDay();
        LocalDateTime toTime = end.plusDays(1).atStartOfDay();

        List<LocalDateTime> appliedAt = applicationRepository.findAppliedAtByOwner(ownerId, fromTime, toTime);
        List<DayPoint> timeline = ChronoUnit.DAYS.between(start, end) + 1 <= MAX_DAILY_POINTS
                ? dailyTimeline(appliedAt, start, end)
                : monthlyTimeline(appliedAt, YearMonth.from(start), YearMonth.from(end));

        Map<ApplicationStatus, Long> byStatus =
                QueryUtils.toCountMap(applicationRepository.countStatusByOwner(ownerId, fromTime, toTime));
        List<CountItem> distribution = Arrays.stream(ApplicationStatus.values())
                .map(s -> new CountItem(s.name(), byStatus.getOrDefault(s, 0L)))
                .filter(item -> item.count() > 0)
                .toList();

        LocalDateTime weekAgo = LocalDate.now().minusDays(6).atStartOfDay();
        long newThisWeek = applicationRepository
                .findAppliedAtByOwner(ownerId, weekAgo, LocalDateTime.now().plusSeconds(1)).size();

        var summary = new EmployerStatsResponse.Summary(
                appliedAt.size(),
                jobRepository.countByCompanyOwnerIdAndStatus(ownerId, JobStatus.OPEN),
                byStatus.getOrDefault(ApplicationStatus.VIEWED, 0L) + byStatus.getOrDefault(ApplicationStatus.INVITED, 0L),
                newThisWeek);
        return new EmployerStatsResponse(timeline, distribution, summary);
    }

    private List<DayPoint> dailyTimeline(List<LocalDateTime> times, LocalDate start, LocalDate end) {
        Map<LocalDate, Long> perDay = times.stream()
                .collect(Collectors.groupingBy(LocalDateTime::toLocalDate, Collectors.counting()));
        List<DayPoint> points = new ArrayList<>();
        for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
            points.add(new DayPoint(d.toString(), d.format(DAY_LABEL), perDay.getOrDefault(d, 0L)));
        }
        return points;
    }

    private List<DayPoint> monthlyTimeline(List<LocalDateTime> times, YearMonth first, YearMonth last) {
        Map<YearMonth, Long> perMonth = groupByMonth(times);
        List<DayPoint> points = new ArrayList<>();
        for (YearMonth m = first; !m.isAfter(last); m = m.plusMonths(1)) {
            points.add(new DayPoint(m.atDay(1).toString(), "T" + m.getMonthValue() + "/" + m.getYear(),
                    perMonth.getOrDefault(m, 0L)));
        }
        return points;
    }

    private static Map<YearMonth, Long> groupByMonth(List<LocalDateTime> times) {
        return times.stream().collect(Collectors.groupingBy(YearMonth::from, Collectors.counting()));
    }
}
