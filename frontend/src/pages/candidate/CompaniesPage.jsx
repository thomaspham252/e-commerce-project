import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  MapPin,
  Briefcase,
  Star,
  ShieldCheck,
  Users,
  ExternalLink,
  ChevronRight,
  Filter,
  Sparkles,
  RotateCcw,
  Clock,
  ThumbsUp
} from 'lucide-react';
import { CompanyLogo } from '../../components/CompanyLogo';
import { companyService } from '../../services/companyService';
import './CandidateShared.css';
import './CompaniesPage.css';

export const CompaniesPage = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');

  const industries = [
    { id: 'all', label: 'Tất cả lĩnh vực' },
    { id: 'it', label: 'IT - Phần mềm' },
    { id: 'fintech', label: 'Fintech & Ví điện tử' },
    { id: 'ecommerce', label: 'Thương mại điện tử' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'retail', label: 'Bán lẻ & Tiêu dùng' },
  ];

  const locations = [
    { id: 'all', label: 'Toàn quốc' },
    { id: 'hanoi', label: 'Hà Nội' },
    { id: 'hcm', label: 'TP. Hồ Chí Minh' },
    { id: 'danang', label: 'Đà Nẵng' },
  ];

  const sizes = [
    { id: 'all', label: 'Mọi quy mô' },
    { id: 'small', label: '10 - 49 nhân viên', match: '10-49' },
    { id: 'medium', label: '100 - 499 nhân viên', match: '100-499' },
    { id: 'large', label: '1000+ nhân viên', match: '1000' },
  ];

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await companyService.getCompaniesPaged({
        keyword,
        industry: selectedIndustry !== 'all' ? selectedIndustry : '',
        location: selectedLocation !== 'all' ? selectedLocation : '',
        size: 50,
      });
      setCompanies(res.content || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách công ty:', err);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [selectedIndustry, selectedLocation]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCompanies();
  };

  const handleResetFilters = () => {
    setKeyword('');
    setSelectedIndustry('all');
    setSelectedLocation('all');
    setSelectedSize('all');
  };

  // Lọc thêm theo quy mô và từ khóa ở client nếu cần
  const filteredList = useMemo(() => {
    return companies.filter((c) => {
      if (selectedSize !== 'all') {
        const target = sizes.find((s) => s.id === selectedSize)?.match;
        if (target && !c.size?.includes(target)) return false;
      }
      if (keyword.trim()) {
        const q = keyword.toLowerCase().trim();
        const matchName = c.name?.toLowerCase().includes(q);
        const matchDesc = c.description?.toLowerCase().includes(q);
        const matchInd = c.industry?.toLowerCase().includes(q);
        const matchLoc = c.address?.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchInd && !matchLoc) return false;
      }
      return true;
    });
  }, [companies, selectedSize, keyword]);

  return (
    <div className="companies-page-wrapper">
      {/* 1. HERO BANNER KHÁM PHÁ CÔNG TY */}
      <section className="companies-hero-banner">
        <div className="container">
          <div className="companies-hero-content">
            <div className="companies-hero-tag">
              <Sparkles size={16} />
              <span>Khám phá doanh nghiệp hàng đầu</span>
            </div>
            <h1 className="companies-hero-title">
              Tìm hiểu văn hóa doanh nghiệp & Cơ hội nghề nghiệp lý tưởng
            </h1>
            <p className="companies-hero-subtitle">
              Xem đánh giá chân thực từ nhân viên, chế độ đãi ngộ, văn hóa làm việc và hàng trăm tin tuyển dụng chất lượng cao.
            </p>

            {/* Thanh tìm kiếm chính */}
            <form className="companies-search-bar" onSubmit={handleSearchSubmit}>
              <div className="companies-search-input-group">
                <Search size={20} className="companies-search-icon" />
                <input
                  type="text"
                  placeholder="Nhập tên doanh nghiệp, lĩnh vực hoặc công nghệ..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="companies-search-input"
                />
              </div>

              <div className="companies-location-select-group">
                <MapPin size={18} className="companies-select-icon" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="companies-select"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.label}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="companies-search-btn">
                <Search size={18} />
                <span>Tìm kiếm</span>
              </button>
            </form>

            {/* Quick Filter Tags theo lĩnh vực */}
            <div className="companies-industry-pills">
              <span className="companies-pills-label">Lĩnh vực:</span>
              <div className="companies-pills-list">
                {industries.map((ind) => (
                  <button
                    key={ind.id}
                    type="button"
                    className={`companies-pill-btn ${selectedIndustry === ind.id ? 'is-active' : ''}`}
                    onClick={() => setSelectedIndustry(ind.id)}
                  >
                    {ind.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT AREA */}
      <div className="container companies-main-container">
        {/* Thanh công cụ lọc & đếm số lượng */}
        <div className="companies-toolbar">
          <div className="companies-toolbar-left">
            <span className="companies-count-highlight">
              {loading ? 'Đang tìm kiếm...' : `${filteredList.length} Doanh nghiệp`}
            </span>
            <span className="companies-count-sub">đang mở cơ hội nghề nghiệp</span>
          </div>

          <div className="companies-toolbar-right">
            <div className="companies-size-filter">
              <Users size={16} className="toolbar-icon" />
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="companies-size-select"
              >
                {sizes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {(keyword || selectedIndustry !== 'all' || selectedLocation !== 'all' || selectedSize !== 'all') && (
              <button
                type="button"
                className="companies-reset-btn"
                onClick={handleResetFilters}
                title="Xóa tất cả bộ lọc"
              >
                <RotateCcw size={15} />
                <span>Làm mới</span>
              </button>
            )}
          </div>
        </div>

        {/* Danh sách thẻ công ty */}
        {loading ? (
          <div className="companies-loading-state">
            <Clock size={36} className="jd-spin" />
            <p>Đang tải danh sách doanh nghiệp uy tín...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="companies-empty-state">
            <Building2 size={54} className="companies-empty-icon" />
            <h3>Không tìm thấy doanh nghiệp phù hợp</h3>
            <p>Hãy thử thay đổi từ khóa tìm kiếm hoặc làm mới bộ lọc để xem các doanh nghiệp khác.</p>
            <button type="button" className="btn btn-primary" onClick={handleResetFilters}>
              Xem tất cả doanh nghiệp
            </button>
          </div>
        ) : (
          <div className="companies-cards-grid">
            {filteredList.map((company) => (
              <article key={company.id} className="company-card-item">
                {/* Header card: Logo + Tên + Đánh giá */}
                <div className="company-card-head">
                  <div className="company-card-logo-wrap">
                    <CompanyLogo
                      companyName={company.name}
                      initials={company.initials}
                      logoUrl={company.logo || company.logoUrl}
                      size={64}
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
                          <ShieldCheck size={14} />
                          <span>Xác thực</span>
                        </span>
                      )}
                    </div>

                    <div className="company-card-rating-row">
                      <div className="company-stars-badge">
                        <Star size={14} fill="#F59E0B" color="#F59E0B" />
                        <strong>{company.rating ? Number(company.rating).toFixed(1) : '4.8'}</strong>
                      </div>
                      <span className="company-review-text">
                        ({company.reviewCount || 0} đánh giá)
                      </span>
                      {company.recommendRate && (
                        <span className="company-recommend-text">
                          • {company.recommendRate}% khuyến khích
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Thông tin chi tiết: Lĩnh vực, Địa điểm, Quy mô */}
                <div className="company-card-info-list">
                  <div className="company-info-row">
                    <Building2 size={15} className="info-icon" />
                    <span>{company.industry || 'IT - Phần mềm'}</span>
                  </div>
                  <div className="company-info-row">
                    <MapPin size={15} className="info-icon" />
                    <span>{company.address || company.location || 'Việt Nam'}</span>
                  </div>
                  <div className="company-info-row">
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

                  <div className="company-card-actions">
                    <Link
                      to={`/cong-ty/${company.id}`}
                      className="btn-company-detail"
                    >
                      <span>Xem công ty</span>
                      <ChevronRight size={15} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

