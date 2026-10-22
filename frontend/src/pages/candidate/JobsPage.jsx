import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
  Banknote,
  Clock,
  Heart,
  ArrowRight,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Flame,
  Sparkles,
  Loader2,
  AlertCircle,
  Building2,
  Check
} from 'lucide-react';
import { CompanyLogo } from '../../components/common/CompanyLogo';
import { useSavedJobs } from '../../context/SavedJobsContext';
import { jobService } from '../../services/jobService';
import './JobsPage.css';

const JOB_TYPE_OPTIONS = [
  { id: 'all', label: 'Tất cả hình thức' },
  { id: 'Toàn thời gian', label: 'Toàn thời gian' },
  { id: 'Bán thời gian', label: 'Bán thời gian' },
  { id: 'Thực tập', label: 'Thực tập sinh' },
  { id: 'Remote', label: 'Làm việc từ xa (Remote)' },
];

const SALARY_OPTIONS = [
  { id: 'all', label: 'Tất cả mức lương', min: null, max: null },
  { id: 'under10', label: 'Dưới 10 triệu', min: null, max: 10000000 },
  { id: '10to15', label: '10 - 15 triệu', min: 10000000, max: 15000000 },
  { id: '15to20', label: '15 - 20 triệu', min: 15000000, max: 20000000 },
  { id: '20to30', label: '20 - 30 triệu', min: 20000000, max: 30000000 },
  { id: 'above30', label: 'Trên 30 triệu', min: 30000000, max: null },
];

const LEVEL_OPTIONS = [
  { id: 'all', label: 'Tất cả cấp bậc' },
  { id: 'Fresher', label: 'Intern / Fresher' },
  { id: 'Junior', label: 'Junior' },
  { id: 'Middle', label: 'Middle' },
  { id: 'Senior', label: 'Senior' },
  { id: 'Lead', label: 'Trưởng nhóm / Quản lý' },
];

const LOCATION_OPTIONS = [
  { id: 'all', label: 'Tất cả địa điểm' },
  { id: 'Hà Nội', label: 'Hà Nội' },
  { id: 'TP.HCM', label: 'TP. Hồ Chí Minh' },
  { id: 'Đà Nẵng', label: 'Đà Nẵng' },
  { id: 'Cần Thơ', label: 'Cần Thơ' },
];

export const JobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc params từ URL
  const keywordParam = searchParams.get('keyword') || '';
  const locationParam = searchParams.get('location') || 'all';
  const jobTypeParam = searchParams.get('jobType') || 'all';
  const levelParam = searchParams.get('level') || 'all';
  const salaryParam = searchParams.get('salary') || 'all';
  const sortParam = searchParams.get('sort') || 'latest';
  const pageParam = parseInt(searchParams.get('page') || '0', 10);

  // Form input search tạm thời
  const [keywordInput, setKeywordInput] = useState(keywordParam);
  const [locationInput, setLocationInput] = useState(locationParam);

  // Dữ liệu từ API
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 9,
    totalElements: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const { toggleSaveJob, isJobSaved } = useSavedJobs();

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

  // Gọi API tải dữ liệu việc làm
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const salaryOpt = SALARY_OPTIONS.find((s) => s.id === salaryParam) || SALARY_OPTIONS[0];
      const locQuery = locationParam === 'all' ? '' : locationParam;
      const jtQuery = jobTypeParam === 'all' ? '' : jobTypeParam;
      const lvlQuery = levelParam === 'all' ? '' : levelParam;

      const data = await jobService.getJobsPaged({
        keyword: keywordParam,
        location: locQuery,
        jobType: jtQuery,
        level: lvlQuery,
        minSalary: salaryOpt.min,
        maxSalary: salaryOpt.max,
        sort: sortParam,
        page: pageParam,
        size: 9,
      });

      setJobs(data.content);
      setPagination({
        page: data.page,
        size: data.size,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
      });
    } catch (err) {
      console.error('Lỗi khi tải việc làm:', err);
    } finally {
      setLoading(false);
    }
  }, [keywordParam, locationParam, jobTypeParam, levelParam, salaryParam, sortParam, pageParam]);

  useEffect(() => {
    fetchJobs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchJobs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({
      keyword: keywordInput.trim(),
      location: locationInput,
      page: 0,
    });
  };

  const handleFilterChange = (key, value) => {
    updateParams({ [key]: value, page: 0 });
  };

  const handleClearAllFilters = () => {
    setKeywordInput('');
    setLocationInput('all');
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(
    keywordParam ||
    locationParam !== 'all' ||
    jobTypeParam !== 'all' ||
    levelParam !== 'all' ||
    salaryParam !== 'all'
  );

  return (
    <div className="jobs-directory-page">
      {/* 1. Header Banner & Tìm kiếm trên cùng */}
      <section className="jobs-hero-header">
        <div className="container">
          <nav className="jobs-breadcrumb" aria-label="Đường dẫn">
            <Link to="/">Trang chủ</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Việc làm</span>
          </nav>

          <div className="jobs-hero-content">
            <h1 className="jobs-page-title">
              Khám phá <span className="title-highlight">cơ hội nghề nghiệp</span> phù hợp
            </h1>
            <p className="jobs-page-subtitle">
              Tìm kiếm nhanh chóng, lọc chính xác theo ngành nghề, mức lương và địa điểm làm việc
            </p>

            {/* Khung tìm kiếm tích hợp */}
            <form className="jobs-search-bar" onSubmit={handleSearchSubmit}>
              <div className="search-input-group keyword-group">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Vị trí tuyển dụng, kỹ năng, tên công ty..."
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  aria-label="Từ khóa tìm kiếm"
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

              <button type="submit" className="jobs-search-btn">
                <span>Tìm kiếm</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 2. Thân trang: Bố cục 2 Cột (Thanh lọc bên trái + Kết quả bên phải) */}
      <div className="container jobs-main-layout">
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
            <strong>{pagination.totalElements}</strong> việc làm
          </span>
        </div>

        {/* CỘT TRÁI: Thanh lọc (Sidebar Filters) */}
        <aside className={`jobs-sidebar-filter ${mobileFilterOpen ? 'is-open' : ''}`}>
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

          {/* Nhóm lọc 1: Hình thức làm việc */}
          <div className="filter-section">
            <h4 className="filter-group-title">
              <Briefcase size={16} />
              <span>Hình thức làm việc</span>
            </h4>
            <div className="filter-options-list">
              {JOB_TYPE_OPTIONS.map((opt) => (
                <label key={opt.id} className="filter-option-item">
                  <input
                    type="radio"
                    name="jobType"
                    checked={jobTypeParam === opt.id}
                    onChange={() => handleFilterChange('jobType', opt.id)}
                  />
                  <span className="custom-radio" />
                  <span className="option-label">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Nhóm lọc 2: Mức lương */}
          <div className="filter-section">
            <h4 className="filter-group-title">
              <Banknote size={16} />
              <span>Mức lương</span>
            </h4>
            <div className="filter-options-list">
              {SALARY_OPTIONS.map((opt) => (
                <label key={opt.id} className="filter-option-item">
                  <input
                    type="radio"
                    name="salary"
                    checked={salaryParam === opt.id}
                    onChange={() => handleFilterChange('salary', opt.id)}
                  />
                  <span className="custom-radio" />
                  <span className="option-label">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Nhóm lọc 3: Cấp bậc */}
          <div className="filter-section">
            <h4 className="filter-group-title">
              <Building2 size={16} />
              <span>Cấp bậc / Vị trí</span>
            </h4>
            <div className="filter-options-list">
              {LEVEL_OPTIONS.map((opt) => (
                <label key={opt.id} className="filter-option-item">
                  <input
                    type="radio"
                    name="level"
                    checked={levelParam === opt.id}
                    onChange={() => handleFilterChange('level', opt.id)}
                  />
                  <span className="custom-radio" />
                  <span className="option-label">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Nhóm lọc 4: Địa điểm */}
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

        {/* CỘT PHẢI: Danh sách việc làm & Phân trang */}
        <main className="jobs-content-area">
          {/* Thanh điều khiển trên cùng (Sort + Total) */}
          <div className="jobs-control-bar">
            <div className="results-count-text">
              Tìm thấy <strong className="count-number">{pagination.totalElements}</strong> việc làm
              {keywordParam && <span> cho "<em>{keywordParam}</em>"</span>}
            </div>

            <div className="sort-selector-wrap">
              <span className="sort-label">Sắp xếp:</span>
              <select
                className="sort-select"
                value={sortParam}
                onChange={(e) => updateParams({ sort: e.target.value, page: 0 })}
                aria-label="Sắp xếp việc làm"
              >
                <option value="latest">Mới nhất</option>
                <option value="salary_desc">Lương cao đến thấp</option>
                <option value="salary_asc">Lương thấp đến cao</option>
                <option value="deadline">Hạn nộp gần nhất</option>
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
              {jobTypeParam !== 'all' && (
                <span className="filter-chip">
                  {jobTypeParam}
                  <button onClick={() => updateParams({ jobType: 'all', page: 0 })} aria-label="Xóa hình thức">
                    <X size={12} />
                  </button>
                </span>
              )}
              {levelParam !== 'all' && (
                <span className="filter-chip">
                  Cấp bậc: {levelParam}
                  <button onClick={() => updateParams({ level: 'all', page: 0 })} aria-label="Xóa cấp bậc">
                    <X size={12} />
                  </button>
                </span>
              )}
              {salaryParam !== 'all' && (
                <span className="filter-chip">
                  {SALARY_OPTIONS.find((s) => s.id === salaryParam)?.label}
                  <button onClick={() => updateParams({ salary: 'all', page: 0 })} aria-label="Xóa mức lương">
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

          {/* Danh sách việc làm */}
          {loading ? (
            <div className="jobs-loading-box">
              <Loader2 size={36} className="jobs-spinner" />
              <p>Đang tìm kiếm việc làm phù hợp...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="jobs-empty-state">
              <div className="empty-icon-wrap">
                <AlertCircle size={40} />
              </div>
              <h3>Không tìm thấy việc làm phù hợp</h3>
              <p>Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh các tiêu chí trong bộ lọc.</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleClearAllFilters}
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <>
              <div className="jobs-directory-grid">
                {jobs.map((job) => {
                  const saved = isJobSaved(job.id);
                  return (
                    <article key={job.id} className="directory-job-card">
                      {/* Top row: Logo + Info + Heart */}
                      <div className="card-header-row">
                        <CompanyLogo
                          companyName={job.companyName}
                          initials={job.initials}
                          logoUrl={job.logoUrl}
                          size={52}
                          className="directory-card-logo"
                        />

                        <div className="card-header-info">
                          <Link to={`/viec-lam/${job.id}`} className="job-title-link">
                            <h3 className="job-title" title={job.title}>
                              {job.title}
                            </h3>
                          </Link>
                          <p className="job-company-name">{job.companyName}</p>
                        </div>

                        <button
                          type="button"
                          className={`job-save-btn ${saved ? 'is-saved' : ''}`}
                          onClick={() => toggleSaveJob(job.id)}
                          title={saved ? 'Bỏ lưu việc làm' : 'Lưu việc làm'}
                          aria-label={saved ? 'Bỏ lưu việc làm' : 'Lưu việc làm'}
                        >
                          <Heart
                            size={18}
                            strokeWidth={1.75}
                            className={saved ? 'heart-fill' : ''}
                          />
                        </button>
                      </div>

                      {/* Meta Tags */}
                      <div className="card-meta-tags">
                        {job.isHot && (
                          <span className="card-badge badge-danger">
                            <Flame size={12} strokeWidth={1.75} />
                            <span>Hot</span>
                          </span>
                        )}
                        <span className="card-badge badge-neutral">{job.jobType || 'Toàn thời gian'}</span>
                        {job.level && <span className="card-badge badge-neutral">{job.level}</span>}
                      </div>

                      {/* Attributes: Lương & Địa điểm */}
                      <div className="card-attributes-list">
                        <div className="attr-item salary-attr">
                          <Banknote size={15} strokeWidth={1.75} className="attr-icon" />
                          <span className="attr-text">{job.salary}</span>
                        </div>
                        <div className="attr-item location-attr">
                          <MapPin size={15} strokeWidth={1.75} className="attr-icon" />
                          <span className="attr-text">{job.location}</span>
                        </div>
                      </div>

                      {/* Footer: Time Ago + Button */}
                      <div className="card-footer-row">
                        <div className="post-time-meta">
                          <Clock size={14} strokeWidth={1.75} />
                          <span>{job.timeAgo}</span>
                        </div>

                        <Link to={`/viec-lam/${job.id}`} className="card-detail-btn">
                          <span>Chi tiết</span>
                          <ArrowRight size={14} strokeWidth={2} />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* 3. Phân trang chuyên nghiệp (Pagination) */}
              {pagination.totalPages > 1 && (
                <div className="jobs-pagination-wrapper">
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
