import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiShield } from 'react-icons/fi';

/**
 * Footer chuyên biệt dành cho Cổng thông tin Nhà tuyển dụng JobViet.
 */
export const EmployerLandingFooter = () => {
  return (
    <footer className="employer-landing-footer">
      <div className="employer-landing-container footer-content-grid">
        {/* Cột 1: Thông tin thương hiệu */}
        <div className="footer-col brand-col">
          <div className="footer-logo">JobViet</div>
          <p className="footer-brand-desc">
            Nền tảng kết nối nhân tài và doanh nghiệp hàng đầu. Mang lại giải pháp tuyển dụng thông minh,
            minh bạch và hiệu quả vượt trội cho mọi tổ chức.
          </p>
          <div className="footer-contact-items">
            <div className="contact-row">
              <FiPhone size={15} className="contact-icon" />
              <span>Hotline Doanh nghiệp: 1900 6868 (8:00 - 18:00)</span>
            </div>
            <div className="contact-row">
              <FiMail size={15} className="contact-icon" />
              <span>Email hỗ trợ: hotro-tuyendung@jobviet.vn</span>
            </div>
            <div className="contact-row">
              <FiMapPin size={15} className="contact-icon" />
              <span>Tòa nhà Innovation Hub, Quận Cầu Giấy, Hà Nội</span>
            </div>
          </div>
        </div>

        {/* Cột 2: Giải pháp Nhà tuyển dụng */}
        <div className="footer-col">
          <h4 className="footer-col-title">Dành cho Nhà tuyển dụng</h4>
          <ul className="footer-links-list">
            <li><Link to="/employer/register">Đăng ký tài khoản tuyển dụng</Link></li>
            <li><Link to="/employer/login">Đăng nhập tài khoản</Link></li>
            <li><Link to="/employer/pricing">Bảng giá dịch vụ tuyển dụng</Link></li>
            <li><a href="#giai-phap">Hệ sinh thái giải pháp</a></li>
            <li><a href="#quy-trinh">Quy trình đăng tin & duyệt hồ sơ</a></li>
          </ul>
        </div>

        {/* Cột 3: Về JobViet & Pháp lý */}
        <div className="footer-col">
          <h4 className="footer-col-title">Về JobViet</h4>
          <ul className="footer-links-list">
            <li><Link to="/">Cổng thông tin Ứng viên</Link></li>
            <li><Link to="/cong-ty">Danh bạ Doanh nghiệp</Link></li>
            <li><Link to="/viec-lam">Tìm kiếm Việc làm</Link></li>
            <li><a href="#loi-ich">Quy chế hoạt động sàn</a></li>
            <li><a href="#lien-he">Chính sách bảo mật dữ liệu</a></li>
          </ul>
        </div>

        {/* Cột 4: Cam kết chất lượng */}
        <div className="footer-col">
          <h4 className="footer-col-title">Cam kết & Bảo vệ</h4>
          <div className="footer-trust-box">
            <FiShield size={24} className="trust-shield-icon" />
            <p>
              100% tài khoản và tin tuyển dụng được kiểm duyệt chặt chẽ, đảm bảo tính xác thực và an toàn thông tin doanh nghiệp.
            </p>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div className="employer-landing-container bottom-bar-inner">
          <p>© 2026 JobViet. Bản quyền thuộc về Nền tảng Tuyển dụng JobViet. Mọi quyền được bảo lưu.</p>
          <div className="bottom-links">
            <span>Điều khoản sử dụng</span>
            <span>•</span>
            <span>Chính sách bảo mật</span>
            <span>•</span>
            <span>Tiêu chuẩn cộng đồng</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

