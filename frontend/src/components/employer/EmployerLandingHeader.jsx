import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX, FiArrowRight, FiUser } from 'react-icons/fi';

/**
 * Header chuyên biệt dành cho Landing Page Nhà tuyển dụng JobViet.
 * Tuân thủ nhận diện thương hiệu xanh lá #047857 và hỗ trợ responsive trên di động.
 */
export const EmployerLandingHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="employer-landing-header">
      <div className="employer-landing-container header-inner">
        {/* Logo & Phân biệt Cổng Tuyển Dụng */}
        <div className="header-brand-group">
          <Link to="/employer" className="brand-logo">
            JobViet
          </Link>
          <span className="brand-badge">Tuyển dụng</span>
        </div>

        {/* Menu Điều Hướng Desktop */}
        <nav className="header-nav-desktop" aria-label="Menu Nhà tuyển dụng">
          <a href="#giai-phap" className="nav-item">Giải pháp</a>
          <a href="#tinh-nang" className="nav-item">Tính năng</a>
          <a href="#quy-trinh" className="nav-item">Quy trình</a>
          <a href="#loi-ich" className="nav-item">Lợi ích</a>
          <Link to="/employer/pricing" className="nav-item">Bảng giá</Link>
          <a href="#lien-he" className="nav-item">Liên hệ</a>
        </nav>

        {/* Nút Hành Động Desktop */}
        <div className="header-actions-desktop">
          <Link to="/" className="btn-link-candidate" title="Chuyển sang trang Ứng viên tìm việc">
            <FiUser size={15} />
            <span>Dành cho Ứng viên</span>
          </Link>
          <Link to="/employer/login" className="btn-login-employer">
            Đăng nhập
          </Link>
          <Link to="/employer/register" className="btn-register-employer">
            <span>Đăng ký tuyển dụng</span>
            <FiArrowRight size={16} />
          </Link>
        </div>

        {/* Nút Hamburger Mobile */}
        <button
          className="btn-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
        >
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Menu Drawer Mobile */}
      {mobileMenuOpen && (
        <div className="header-drawer-mobile">
          <div className="drawer-links">
            <a href="#giai-phap" onClick={() => setMobileMenuOpen(false)}>Giải pháp tuyển dụng</a>
            <a href="#tinh-nang" onClick={() => setMobileMenuOpen(false)}>Tính năng thông minh</a>
            <a href="#quy-trinh" onClick={() => setMobileMenuOpen(false)}>Quy trình 4 bước</a>
            <a href="#loi-ich" onClick={() => setMobileMenuOpen(false)}>Lợi ích đối tác</a>
            <Link to="/employer/pricing" onClick={() => setMobileMenuOpen(false)}>Bảng giá dịch vụ</Link>
            <a href="#lien-he" onClick={() => setMobileMenuOpen(false)}>Liên hệ tư vấn</a>
            <Link to="/" className="drawer-candidate-link" onClick={() => setMobileMenuOpen(false)}>
              Chuyển sang cổng Ứng viên
            </Link>
          </div>
          <div className="drawer-actions">
            <Link to="/employer/login" className="btn-drawer-login" onClick={() => setMobileMenuOpen(false)}>
              Đăng nhập
            </Link>
            <Link to="/employer/register" className="btn-drawer-register" onClick={() => setMobileMenuOpen(false)}>
              Đăng ký tuyển dụng ngay
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

