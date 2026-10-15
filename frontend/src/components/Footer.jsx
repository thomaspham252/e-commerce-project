import React from 'react';
import { Mail, Phone, MapPin, Globe, MessageCircle, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Footer.css';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        {/* Cột 1: Thương hiệu & Giới thiệu */}
        <div className="footer-col brand-col">
          <Link to="/" className="footer-brand">JobViet</Link>
          <p className="footer-desc">
            Nền tảng kết nối nhân tài và doanh nghiệp uy tín hàng đầu Việt Nam. Tối ưu hóa cơ hội nghề nghiệp thông qua giải pháp tuyển dụng thông minh.
          </p>
          <div className="footer-contact-items">
            <div className="footer-contact-item">
              <Mail size={16} strokeWidth={1.75} className="contact-icon" />
              <span>contact@jobviet.vn</span>
            </div>
            <div className="footer-contact-item">
              <Phone size={16} strokeWidth={1.75} className="contact-icon" />
              <span>1900 6868 (8:00 - 18:00)</span>
            </div>
            <div className="footer-contact-item">
              <MapPin size={16} strokeWidth={1.75} className="contact-icon" />
              <span>Hà Nội & TP. Hồ Chí Minh</span>
            </div>
          </div>
        </div>

        {/* Cột 2: Về JobViet */}
        <div className="footer-col">
          <h3 className="footer-col-title">Về JobViet</h3>
          <ul className="footer-links-list">
            <li><a href="#">Giới thiệu nền tảng</a></li>
            <li><a href="#">Liên hệ & Trợ giúp</a></li>
            <li><a href="#">Điều khoản sử dụng</a></li>
            <li><a href="#">Chính sách bảo mật</a></li>
            <li><a href="#">Quy chế hoạt động</a></li>
          </ul>
        </div>

        {/* Cột 3: Dành cho ứng viên */}
        <div className="footer-col">
          <h3 className="footer-col-title">Dành cho ứng viên</h3>
          <ul className="footer-links-list">
            <li><Link to="/">Tìm kiếm việc làm</Link></li>
            <li><a href="#candidate-tools-section">Tạo CV chuyên nghiệp</a></li>
            <li><a href="#companies-section">Công ty tiêu biểu</a></li>
            <li><Link to="/viec-lam-da-luu">Việc làm đã lưu</Link></li>
            <li><Link to="/candidate/wallet">Ví Token ứng viên</Link></li>
          </ul>
        </div>

        {/* Cột 4: Dành cho NTD */}
        <div className="footer-col">
          <h3 className="footer-col-title">Dành cho NTD</h3>
          <ul className="footer-links-list">
            <li><Link to="/employer/jobs/create">Đăng tin tuyển dụng</Link></li>
            <li><Link to="/employer/applications">Quản lý hồ sơ ứng viên</Link></li>
            <li><Link to="/employer/pricing">Bảng giá dịch vụ</Link></li>
            <li><Link to="/employer">Bảng điều khiển NTD</Link></li>
          </ul>
        </div>

        {/* Cột 5: Kết nối */}
        <div className="footer-col connect-col">
          <h3 className="footer-col-title">Kết nối</h3>
          <p className="connect-note">Theo dõi JobViet trên các nền tảng truyền thông:</p>
          <div className="social-links-row">
            <a href="#" className="social-icon-btn" aria-label="Cộng đồng" title="Cộng đồng">
              <MessageCircle size={18} strokeWidth={1.75} />
            </a>
            <a href="#" className="social-icon-btn" aria-label="Chia sẻ" title="Chia sẻ">
              <Share2 size={18} strokeWidth={1.75} />
            </a>
            <a href="#" className="social-icon-btn" aria-label="Website" title="Website">
              <Globe size={18} strokeWidth={1.75} />
            </a>
          </div>
          <div className="footer-verified-badge">
            <span>Chứng nhận hệ thống an toàn & bảo mật</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-container">
          <p>&copy; 2026 JobViet. Nền tảng tuyển dụng & phát triển sự nghiệp thông minh. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};
