import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import {
  Search,
  MapPin,
  ChevronRight,
  Monitor,
  Calculator,
  Megaphone,
  ShoppingCart,
  Building2,
  Compass,
  Headphones,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Briefcase,
  Users
} from 'lucide-react';
import {
  HERO_POPULAR_KEYWORDS,
  HERO_SIDEBAR_CATEGORIES,
  
} from '../../data/homeConstants';
import './HeroHomeSection.css';

const ICON_MAP = {
  Monitor,
  Calculator,
  Megaphone,
  ShoppingCart,
  Building2,
  Compass,
  Headphones
};

export const HeroHomeSection = ({ onSearch }) => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(keyword.trim(), location.trim());
    }
  };

  const handleKeywordClick = (kw) => {
    setKeyword(kw);
    if (onSearch) {
      onSearch(kw, location.trim());
    }
  };

  // Lấy 3 chỉ số chính để hiển thị gọn gàng trong Hero
  const [stats, setStats] = useState({ jobCount: 0, companyCount: 0, candidateCount: 0 });

  useEffect(() => {
    let active = true;
    apiClient.get('/public/stats').then((res) => {
      if (active && res.data) {
        setStats({
          jobCount: res.data.jobCount || 0,
          companyCount: res.data.companyCount || 0,
          candidateCount: res.data.candidateCount || 0,
        });
      }
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  const heroStats = [
    { id: 'jobs', value: stats.jobCount > 0 ? stats.jobCount.toLocaleString('vi-VN') + '+' : '100+', label: 'Việc làm mở tuyển', iconName: 'Briefcase' },
    { id: 'companies', value: stats.companyCount > 0 ? stats.companyCount.toLocaleString('vi-VN') + '+' : '20+', label: 'Doanh nghiệp uy tín', iconName: 'Building2' },
    { id: 'candidates', value: stats.candidateCount > 0 ? stats.candidateCount.toLocaleString('vi-VN') + '+' : '10+', label: 'Ứng viên gia nhập', iconName: 'Users' },
  ];

  return (
    <div className="hero-section-wrapper">
      {/* Vùng Hero nền Emerald đậm */}
      <section className="hero-home-banner">
        <div className="container hero-banner-container">
          {/* Tiêu đề lớn căn giữa */}
          <div className="hero-header-content">
            <h1 className="hero-title">
              Tìm việc làm mơ ước. <span className="hero-title-highlight">Định hình tương lai.</span>
            </h1>
            <p className="hero-subtitle">
              Khám phá hơn 18.500+ cơ hội nghề nghiệp chất lượng cao từ các doanh nghiệp hàng đầu Việt Nam
            </p>
          </div>

          {/* Ô tìm kiếm lớn màu trắng nổi bật */}
          <form className="hero-search-box" onSubmit={handleSubmit}>
            <div className="hero-search-field keyword-field">
              <Search size={20} strokeWidth={1.75} className="field-icon" />
              <input
                type="text"
                placeholder="Vị trí tuyển dụng, kỹ năng, công ty..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                aria-label="Từ khóa tìm kiếm"
              />
            </div>

            <div className="search-field-divider" />

            <div className="hero-search-field location-field">
              <MapPin size={20} strokeWidth={1.75} className="field-icon" />
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                aria-label="Lọc theo địa điểm"
              >
                <option value="">Tất cả địa điểm</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Cần Thơ">Cần Thơ</option>
                <option value="Làm việc từ xa">Làm việc từ xa (Remote)</option>
              </select>
            </div>

            <button type="submit" className="hero-search-btn">
              <Search size={18} strokeWidth={1.75} />
              <span>Tìm kiếm</span>
            </button>
          </form>

          {/* Từ khóa phổ biến dạng chip trong suốt viền trắng mờ */}
          <div className="hero-trending-tags">
            <span className="trending-label">Từ khóa phổ biến:</span>
            <div className="trending-list">
              {HERO_POPULAR_KEYWORDS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="trending-tag-chip"
                  onClick={() => handleKeywordClick(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Hàng số liệu nền tảng tích hợp gọn gàng dưới chip */}
          <div className="hero-stats-row">
            {heroStats.map((st) => {
              const StatIcon =
                st.iconName === 'Building2'
                  ? Building2
                  : st.iconName === 'Users'
                  ? Users
                  : Briefcase;
              return (
                <div key={st.id} className="hero-stat-item">
                  <StatIcon size={18} strokeWidth={1.75} className="hero-stat-icon" />
                  <div className="hero-stat-text">
                    <strong className="hero-stat-val">{st.value}</strong>
                    <span className="hero-stat-lbl">{st.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cụm 2 cột đè lên mép dưới Hero với margin âm (-56px) */}
      <section className="hero-overlap-section">
        <div className="container hero-overlap-container">
          <div className="hero-split-grid">
            {/* Cột trái: Danh mục nghề phổ biến (Thẻ nền trắng, viền mảnh) */}
            <div className="hero-category-sidebar">
              <div className="category-sidebar-header">
                <h2 className="sidebar-title">Danh mục nghề phổ biến</h2>
              </div>
              <ul className="category-nav-list">
                {HERO_SIDEBAR_CATEGORIES.map((cat) => {
                  const IconComponent = ICON_MAP[cat.icon] || Monitor;
                  return (
                    <li key={cat.id}>
                      <button
                        type="button"
                        className="category-nav-item"
                        onClick={() => handleKeywordClick(cat.name)}
                      >
                        <div className="category-nav-left">
                          <span className="category-nav-icon">
                            <IconComponent size={18} strokeWidth={1.75} />
                          </span>
                          <span className="category-nav-name">{cat.name}</span>
                        </div>
                        <div className="category-nav-right">
                          {cat.count && <span className="category-nav-count">{cat.count}</span>}
                          <ChevronRight size={16} strokeWidth={1.75} className="category-nav-arrow" />
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Cột phải: Banner Career Boost nền trắng tinh khôi, nhấn emerald, không dùng nền đậm */}
            <div className="hero-career-card">
              <div className="career-card-inner">
                <div className="career-badge">
                  <Sparkles size={14} strokeWidth={1.75} />
                  <span>JobViet Career Boost</span>
                </div>

                <h2 className="career-heading">
                  Khởi đầu sự nghiệp vững vàng với <span className="text-emerald">hồ sơ chuẩn tuyển dụng</span>
                </h2>

                <p className="career-desc">
                  Tạo CV chuẩn ATS, nhận gợi ý việc làm tương thích từ thuật toán thông minh và ứng tuyển nhanh chóng chỉ với 1 cú click.
                </p>

                <div className="career-checklist">
                  <div className="career-check-item">
                    <CheckCircle2 size={18} strokeWidth={1.75} className="check-icon" />
                    <span>Tiếp cận mạng lưới hơn 5.200+ doanh nghiệp đã xác thực</span>
                  </div>
                  <div className="career-check-item">
                    <CheckCircle2 size={18} strokeWidth={1.75} className="check-icon" />
                    <span>Bảo mật dữ liệu cá nhân và thông tin liên hệ 100%</span>
                  </div>
                  <div className="career-check-item">
                    <CheckCircle2 size={18} strokeWidth={1.75} className="check-icon" />
                    <span>Tham khảo mức lương thị trường chuẩn xác theo từng cấp bậc</span>
                  </div>
                </div>

                <div className="career-card-actions">
                  <a href="#candidate-tools-section" className="career-cta-btn">
                    <span>Khám phá công cụ cho ứng viên</span>
                    <ArrowRight size={16} strokeWidth={1.75} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
