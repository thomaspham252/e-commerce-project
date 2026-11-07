import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Building2,
  Search,
  MapPin,
  Briefcase,
  Star,
  ShieldCheck,
  Users,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Sparkles,
  RotateCcw,
  Clock,
  X,
  Loader2,
  Check
} from 'lucide-react';
import { CompanyLogo } from '../../components/common/CompanyLogo';
import { companyService } from '../../services/companyService';
import './CompaniesPage.css';

const INDUSTRY_OPTIONS = [
  { id: 'all', label: 'Tất cả lĩnh vực' },
  { id: 'IT - Phần mềm', label: 'IT - Phần mềm' },
  { id: 'Fintech', label: 'Fintech & Ngân hàng' },
  { id: 'Thương mại điện tử', label: 'Thương mại điện tử' },
  { id: 'AI', label: 'AI & Công nghệ cao' },
  { id: 'Viễn thông', label: 'Viễn thông & Dịch vụ số' },
  { id: 'Marketing', label: 'Marketing & Truyền thông' },
];

const LOCATION_OPTIONS = [
  { id: 'all', label: 'Tất cả địa điểm' },
  { id: 'Hà Nội', label: 'Hà Nội' },
  { id: 'TP.HCM', label: 'TP. Hồ Chí Minh' },
  { id: 'Đà Nẵng', label: 'Đà Nẵng' },
  { id: 'Cần Thơ', label: 'Cần Thơ' },
];

const SIZE_OPTIONS = [
  { id: 'all', label: 'Tất cả quy mô' },
  { id: '10-49', label: '10 - 49 nhân viên' },
  { id: '50-99', label: '50 - 99 nhân viên' },
  { id: '100-499', label: '100 - 499 nhân viên' },
  { id: '500-999', label: '500 - 999 nhân viên' },
  { id: '1000+', label: '1000+ nhân viên' },
];

const STATUS_OPTIONS = [
  { id: 'all', label: 'Tất cả doanh nghiệp' },
  { id: 'verified', label: 'Doanh nghiệp đã xác thực' },
  { id: 'high_rating', label: 'Đánh giá cao (≥ 4.5★)' },
  { id: 'has_jobs', label: 'Đang có việc làm mở tuyển' },
];

const SORT_OPTIONS = [
  { id: 'latest', label: 'Mới nhất' },
  { id: 'rating_desc', label: 'Đánh giá cao nhất' },
  { id: 'jobs_desc', label: 'Nhiều việc làm nhất' },
  { id: 'name_asc', label: 'Tên A - Z' },
];

export const CompaniesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc params từ URL
  const keywordParam = searchParams.get('keyword') || '';
  const locationParam = searchParams.get('location') || 'all';
  const industryParam = searchParams.get('industry') || 'all';
  const sizeParam = searchParams.get('size') || 'all';
  const statusParam = searchParams.get('status') || 'all';
  const sortParam = searchParams.get('sort') || 'latest';
  const pageParam = parseInt(searchParams.get('page') || '0', 10);

  // Form input search tạm thời
  const [keywordInput, setKeywordInput] = useState(keywordParam);
  const [locationInput, setLocationInput] = useState(locationParam);

  // Dữ liệu từ API
  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 8,
    totalElements: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Đồng bộ URL params với keyword input
  useEffect(() => {
    setKeywordInput(keywordParam);
    setLocationInput(locationParam);
  }, [keywordParam, locationParam]);

  // Cập nhật URL params
  const updateParams = useCallback((newParams) => {
    setSearchParams((prev) => {
      const merged = new URLSearchParams(prev);
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'all' || (key === 'page' && value === 0)) {
          merged.delete(key);
        } else {
          merged.set(key, String(value));
        }
      });
      return merged;
    });
  }, [setSearchParams]);

  // Gọi API tải dữ liệu công ty
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await companyService.getCompaniesPaged({
        keyword: keywordParam,
        location: locationParam,
        industry: industryParam,
        companySize: sizeParam,
        status: statusParam,
        sort: sortParam,
        page: pageParam,
        pageSize: 8,
      });

      setCompanies(data.content || []);
      setPagination({
        page: data.page,
        size: data.size,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
      });
    } catch (err) {
      console.error('Lỗi khi tải danh sách công ty:', err);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [keywordParam, locationParam, industryParam, sizeParam, statusParam, sortParam, pageParam]);

  useEffect(() => {
    fetchCompanies();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchCompanies]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({
      keyword: keywordInput.trim(),
      location: locationInput,
      page: 0,
    });
  };

  const handleFilterChange = (filterType, value) => {
    updateParams({
      [filterType]: value,
      page: 0,
    });
  };

  const handleClearAllFilters = () => {
    setKeywordInput('');
    setLocationInput('all');
    setSearchParams({});
  };

  const hasActiveFilters =
    Boolean(keywordParam) ||
    locationParam !== 'all' ||
    industryParam !== 'all' ||
    sizeParam !== 'all' ||
    statusParam !== 'all' ||
    sortParam !== 'latest';

  return (
    <div className="companies-page-wrapper">
      {/* 1. HERO BANNER KHÁM PHÁ CÔNG TY */}
      <section className="companies-hero-banner">
        <div className="container">
          {/* Breadcrumb điều hướng */}
          <nav className="companies-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Danh bạ Doanh nghiệp</span>
          </nav>

          <div className="companies-hero-content">
            <div className="companies-hero-tag">
              <Sparkles size={15} />
              <span>Khám phá doanh nghiệp hàng đầu</span>
            </div>
            <h1 className="companies-hero-title">
              Tìm hiểu văn hóa & Cơ hội nghề nghiệp lý tưởng
            </h1>
            <p className="companies-hero-subtitle">
              Xem đánh giá chân thực từ nhân viên, chế độ đãi ngộ, văn hóa làm việc và hàng trăm tin tuyển dụng chất lượng cao.
            </p>

            {/* Thanh tìm kiếm chính */}
            <form className="companies-search-bar" onSubmit={handleSearchSubmit}>
              <div className="search-input-group keyword-group">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Nhập tên doanh nghiệp, kỹ năng, lĩnh vực..."
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  aria-label="Từ khóa tìm kiếm công ty"
                />
              </div>

              <div className="search-bar-divider" />

              <div className="search-input-group location-group">
                <MapPin size={20} className="search-icon" />
                <select
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  aria-label="Lọc theo địa điểm"
                >
                  {LOCATION_OPTIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.label}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="companies-search-btn">
                <span>Tìm kiếm</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 2. THÂN TRANG: BỐ CỤC 2 CỘT (Sidebar Bộ lọc bên trái + Kết quả bên phải) */}
      <div className="container companies-main-layout">
        {/* Nút bật bộ lọc trên Mobile */}
        <div className="mobile-filter-trigger-bar">
          <button
            type="button"
            className="mobile-filter-toggle-btn"
            onClick={() => setMobileFilterOpen(true)}
          >
            <SlidersHorizontal size={18} />
            <span>Bộ lọc ({hasActiveFilters ? 'Đang bật' : 'Tất cả'})</span>
          </button>
          <span className="mobile-results-count">
            <strong>{pagination.totalElements}</strong> doanh nghiệp
          </span>
        </div>

        {/* CỘT TRÁI: Thanh lọc (Sidebar Filters) */}
        <aside className={`companies-sidebar-filter ${mobileFilterOpen ? 'is-open' : ''}`}>
          <div className="sidebar-filter-header">
            <div className="filter-title-wrap">
              <SlidersHorizontal size={18} className="filter-header-icon" />
              <h3>Bộ lọc tìm kiếm</h3>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                className="clear-all-filter-btn"
                onClick={handleClearAllFilters}
              >
                Xóa lọc
              </button>
            )}
            <button
              type="button"
              className="mobile-close-filter-btn"
              onClick={() => setMobileFilterOpen(false)}
              aria-label="Đóng bộ lọc"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nhóm lọc 1: Lĩnh vực hoạt động */}
          <div className="filter-section">
            <h4 className="filter-group-title">
              <Building2 size={16} />
              <span>Lĩnh vực hoạt động</span>
            </h4>
            <div className="filter-options-list">
              {INDUSTRY_OPTIONS.map((opt) => (
                <label key={opt.id} className="filter-option-item">
                  <input
                    type="radio"
                    name="industry"
                    checked={industryParam === opt.id}
                    onChange={() => handleFilterChange('industry', opt.id)}
                  />
                  <span className="custom-radio" />
                  <span className="option-label">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Nhóm lọc 2: Khu vực / Địa điểm */}
          <div className="filter-section">
            <h4 className="filter-group-title">
              <MapPin size={16} />
              <span>Khu vực</span>
            </h4>
            <div className="filter-options-list">
              {LOCATION_OPTIONS.map((opt) => (
                <label key={opt.id} className="filter-option-item">
                  <input
                    type="radio"
                    name="locationFilter"
                    checked={locationParam === opt.id}
                    onChange={() => handleFilterChange('location', opt.id)}
                  />
                  <span className="custom-radio" />
                  <span className="option-label">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Nhóm lọc 3: Quy mô nhân sự */}
          <div className="filter-section">
            <h4 className="filter-group-title">
              <Users size={16} />
              <span>Quy mô nhân sự</span>
            </h4>
            <div className="filter-options-list">
              {SIZE_OPTIONS.map((opt) => (
                <label key={opt.id} className="filter-option-item">
                  <input
                    type="radio"
                    name="size"
                    checked={sizeParam === opt.id}
                    onChange={() => handleFilterChange('size', opt.id)}
                  />
                  <span className="custom-radio" />
                  <span className="option-label">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Nhóm lọc 4: Trạng thái & Uy tín */}
          <div className="filter-section">
            <h4 className="filter-group-title">
              <ShieldCheck size={16} />
              <span>Trạng thái & Uy tín</span>
            </h4>
            <div className="filter-options-list">
              {STATUS_OPTIONS.map((opt) => (
                <label key={opt.id} className="filter-option-item">
                  <input
                    type="radio"
                    name="status"
                    checked={statusParam === opt.id}
                    onChange={() => handleFilterChange('status', opt.id)}
                  />
                  <span className="custom-radio" />
                  <span className="option-label">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Nút Áp dụng trên Mobile */}
          <div className="mobile-filter-apply-box">
            <button
              type="button"
              className="btn btn-primary mobile-apply-btn"
              onClick={() => setMobileFilterOpen(false)}
            >
              Áp dụng bộ lọc ({pagination.totalElements})
            </button>
          </div>
        </aside>

        {/* Lớp phủ mờ (Backdrop) khi mở filter trên Mobile */}
        {mobileFilterOpen && (
          <div
            className="mobile-filter-backdrop"
            onClick={() => setMobileFilterOpen(false)}
          />
        )}

        {/* CỘT PHẢI: Danh sách doanh nghiệp & Phân trang */}
        <main className="companies-content-area">
          {/* Thanh điều khiển trên cùng (Sort + Total) */}
          <div className="companies-control-bar">
            <div className="results-count-text">
              Tìm thấy <strong className="count-number">{pagination.totalElements}</strong> doanh nghiệp
              {keywordParam && <span> cho "<em>{keywordParam}</em>"</span>}
            </div>

            <div className="sort-selector-wrap">
              <span className="sort-label">Sắp xếp:</span>
              <select
                className="sort-select"
                value={sortParam}
                onChange={(e) => updateParams({ sort: e.target.value, page: 0 })}
                aria-label="Sắp xếp doanh nghiệp"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="active-filters-chips">
              <span className="active-filter-label">Đang lọc theo:</span>
              {keywordParam && (
                <span className="filter-chip">
                  Từ khóa: {keywordParam}
                  <button onClick={() => updateParams({ keyword: '', page: 0 })} aria-label="Xóa từ khóa">
                    <X size={12} />
                  </button>
                </span>
              )}
              {locationParam !== 'all' && (
                <span className="filter-chip">
                  {locationParam}
                  <button onClick={() => updateParams({ location: 'all', page: 0 })} aria-label="Xóa địa điểm">
                    <X size={12} />
                  </button>
                </span>
              )}
              {industryParam !== 'all' && (
                <span className="filter-chip">
                  {industryParam}
                  <button onClick={() => updateParams({ industry: 'all', page: 0 })} aria-label="Xóa lĩnh vực">
                    <X size={12} />
                  </button>
                </span>
              )}
              {sizeParam !== 'all' && (
                <span className="filter-chip">
                  Quy mô: {sizeParam}
                  <button onClick={() => updateParams({ size: 'all', page: 0 })} aria-label="Xóa quy mô">
                    <X size={12} />
                  </button>
                </span>
              )}
              {statusParam !== 'all' && (
                <span className="filter-chip">
                  {STATUS_OPTIONS.find((s) => s.id === statusParam)?.label || statusParam}
                  <button onClick={() => updateParams({ status: 'all', page: 0 })} aria-label="Xóa trạng thái">
                    <X size={12} />
                  </button>
                </span>
              )}
              <button
                type="button"
                className="clear-all-chips-btn"
                onClick={handleClearAllFilters}
              >
                Xóa tất cả
              </button>
            </div>
          )}

          {/* Danh sách thẻ công ty */}
          {loading ? (
            <div className="companies-loading-box">
              <Loader2 size={36} className="companies-spinner" />
              <p>Đang tải danh sách doanh nghiệp uy tín...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="companies-empty-state">
              <div className="empty-icon-wrap">
                <Building2 size={32} />
              </div>
              <h3>Không tìm thấy doanh nghiệp phù hợp</h3>
              <p>Hãy thử thay đổi từ khóa tìm kiếm hoặc làm mới bộ lọc để khám phá các doanh nghiệp khác.</p>
              <button type="button" className="btn btn-primary" onClick={handleClearAllFilters}>
                Xem tất cả doanh nghiệp
              </button>
            </div>
          ) : (
            <>
              <div className="companies-cards-grid">
                {companies.map((company) => (
                  <article key={company.id} className="company-card-item">
                    {/* Header card: Logo + Tên + Đánh giá */}
                    <div className="company-card-head">
                      <div className="company-card-logo-wrap">
                        <CompanyLogo
                          companyName={company.name}
                          initials={company.initials}
                          logoUrl={company.logo || company.logoUrl}
                          size={56}
                          className="company-item-logo"
                        />
                      </div>

                      <div className="company-card-meta-top">
                        <div className="company-card-title-row">
                          <Link to={`/cong-ty/${company.id}`} className="company-card-name" title={company.name}>
                            {company.name}
                          </Link>
                          {company.verificationStatus === 'VERIFIED' && (
                            <span className="company-verified-tag" title="Doanh nghiệp đã được xác thực">
                              <ShieldCheck size={13} />
                              <span>Xác thực</span>
                            </span>
                          )}
                        </div>

                        <div className="company-card-rating-row">
                          {company.reviewCount > 0 && company.rating != null ? (
                            <>
                              <div className="company-stars-badge">
                                <Star size={13} fill="#F59E0B" color="#F59E0B" />
                                <strong>{Number(company.rating).toFixed(1)}</strong>
                              </div>
                              <span className="company-review-text">
                                ({company.reviewCount} đánh giá)
                              </span>
                              {company.recommendRate != null && (
                                <span className="company-recommend-text">
                                  • {company.recommendRate}% khuyến khích
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="company-no-reviews-text">Chưa có đánh giá nào</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Thông tin chi tiết: Lĩnh vực, Địa điểm, Quy mô */}
                    <div className="company-card-info-list">
                      <div className="company-info-row" title={company.industry}>
                        <Building2 size={15} className="info-icon" />
                        <span>{company.industry || 'IT - Phần mềm'}</span>
                      </div>
                      <div className="company-info-row" title={company.address || company.location}>
                        <MapPin size={15} className="info-icon" />
                        <span>{company.address || company.location || 'Việt Nam'}</span>
                      </div>
                      <div className="company-info-row" title={company.size}>
                        <Users size={15} className="info-icon" />
                        <span>{company.size || '100 - 499 nhân viên'}</span>
                      </div>
                    </div>

                    {/* Giới thiệu ngắn */}
                    <p className="company-card-description">
                      {company.description || 'Doanh nghiệp uy tín phát triển bền vững cùng đội ngũ kỹ sư chất lượng cao.'}
                    </p>

                    {/* Footer card: Việc làm mở & Nút chi tiết */}
                    <div className="company-card-foot">
                      <div className="company-open-jobs-badge">
                        <Briefcase size={14} />
                        <span>
                          <strong>{company.openJobsCount || 0}</strong> việc làm đang tuyển
                        </span>
                      </div>

                      <Link
                        to={`/cong-ty/${company.id}`}
                        className="btn-company-detail"
                      >
                        <span>Xem công ty</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* 3. Phân trang chuyên nghiệp (Pagination) */}
              {pagination.totalPages > 1 && (
                <div className="companies-pagination-wrapper">
                  <button
                    type="button"
                    className="pagination-btn pagination-prev"
                    disabled={pagination.page === 0}
                    onClick={() => updateParams({ page: pagination.page - 1 })}
                    aria-label="Trang trước"
                  >
                    <ChevronLeft size={16} />
                    <span>Trước</span>
                  </button>

                  <div className="pagination-numbers">
                    {Array.from({ length: pagination.totalPages }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`page-number-btn ${pagination.page === i ? 'is-active' : ''}`}
                        onClick={() => updateParams({ page: i })}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="pagination-btn pagination-next"
                    disabled={pagination.page >= pagination.totalPages - 1}
                    onClick={() => updateParams({ page: pagination.page + 1 })}
                    aria-label="Trang sau"
                  >
                    <span>Sau</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
