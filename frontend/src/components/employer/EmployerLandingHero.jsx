import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiArrowRight, FiSearch, FiZap, FiUsers } from 'react-icons/fi';

/**
 * Hero Section: Tiêu đề nổi bật, mô tả giá trị và mockup giải pháp tuyển dụng thông minh.
 */
export const EmployerLandingHero = () => {
  return (
    <section className="employer-hero-section">
      <div className="employer-landing-container hero-grid">
        {/* Nội dung giới thiệu bên trái */}
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="eyebrow-badge">GIẢI PHÁP ĐỘT PHÁ 2026</span>
            <span>Nền tảng Tuyển dụng thông minh</span>
          </div>

          <h1 className="hero-title">
            Tuyển dụng đúng người, đúng thời điểm cùng <span className="highlight-text">JobViet</span>
          </h1>

          <p className="hero-description">
            Tiếp cận hơn 100.000+ ứng viên tiềm năng trên khắp cả nước. Đăng tin nhanh chóng,
            quản lý hồ sơ tập trung và rút ngắn thời gian tuyển chọn với trợ lực từ nền tảng hiện đại.
          </p>

          <div className="hero-cta-group">
            <Link to="/employer/register" className="btn-hero-primary">
              <span>Đăng ký tuyển dụng ngay</span>
              <FiArrowRight size={18} />
            </Link>
            <a href="#giai-phap" className="btn-hero-outline">
              <span>Khám phá giải pháp</span>
            </a>
          </div>

          <div className="hero-trust-indicators">
            <div className="trust-item">
              <FiCheckCircle className="trust-icon" />
              <span>Tiếp cận ứng viên chuẩn xác</span>
            </div>
            <div className="trust-item">
              <FiCheckCircle className="trust-icon" />
              <span>Đăng tin dễ dàng & duyệt nhanh</span>
            </div>
            <div className="trust-item">
              <FiCheckCircle className="trust-icon" />
              <span>Hỗ trợ tư vấn 24/7</span>
            </div>
          </div>
        </div>

        {/* Minh họa tính năng gợi ý ứng viên bên phải */}
        <div className="hero-mockup-wrapper">
          <div className="mockup-card-main">
            <div className="mockup-card-header">
              <div className="mockup-header-title">
                <FiZap className="mockup-spark-icon" />
                <span>Gợi ý Ứng viên Phù hợp</span>
              </div>
              <span className="match-tag-high">Tính năng nổi bật</span>
            </div>

            {/* Danh sách minh họa hồ sơ */}
            <div className="mockup-candidate-list">
              <div className="mockup-candidate-item active">
                <div className="candidate-avatar">IT</div>
                <div className="candidate-info">
                  <div className="candidate-name">Hồ sơ Ứng viên #1</div>
                  <div className="candidate-role">Senior Fullstack Developer (Java & React)</div>
                  <div className="candidate-meta">Đầy đủ chứng chỉ chuyên môn • Hà Nội</div>
                </div>
                <span className="candidate-badge-verified">Đã xác thực</span>
              </div>

              <div className="mockup-candidate-item">
                <div className="candidate-avatar alt">MKT</div>
                <div className="candidate-info">
                  <div className="candidate-name">Hồ sơ Ứng viên #2</div>
                  <div className="candidate-role">Product Marketing Manager</div>
                  <div className="candidate-meta">Kinh nghiệm dự án thực tế • TP. Hồ Chí Minh</div>
                </div>
                <span className="candidate-badge-ready">Sẵn sàng</span>
              </div>

              <div className="mockup-candidate-item">
                <div className="candidate-avatar alt2">DA</div>
                <div className="candidate-info">
                  <div className="candidate-name">Hồ sơ Ứng viên #3</div>
                  <div className="candidate-role">Data Analyst & BI Specialist</div>
                  <div className="candidate-meta">Chuyên môn phân tích dữ liệu • Đà Nẵng</div>
                </div>
                <span className="candidate-badge-ready">Sẵn sàng</span>
              </div>
            </div>

            <div className="mockup-card-footer">
              <div className="footer-stat">
                <FiUsers size={14} />
                <span>Hồ sơ ứng viên được kết nối trực tiếp</span>
              </div>
              <Link to="/employer/register" className="mockup-link-action">
                Tiếp cận ngay <FiArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

