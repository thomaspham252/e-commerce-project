import './Footer.css';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-col brand-col">
          <h2 className="footer-brand">JobViet</h2>
          <p className="footer-desc">Nền tảng tìm kiếm việc làm uy tín, kết nối hàng triệu ứng viên với các doanh nghiệp hàng đầu.</p>
        </div>
        <div className="footer-col">
          <h3>Về JobViet</h3>
          <ul>
            <li><a href="#">Giới thiệu</a></li>
            <li><a href="#">Liên hệ</a></li>
            <li><a href="#">Điều khoản</a></li>
            <li><a href="#">Bảo mật</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h3>Dành cho ứng viên</h3>
          <ul>
            <li><a href="#">Việc làm mới</a></li>
            <li><a href="#">Tạo CV</a></li>
            <li><a href="#">Công ty hàng đầu</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h3>Dành cho NTD</h3>
          <ul>
            <li><a href="#">Đăng tin tuyển dụng</a></li>
            <li><a href="#">Tìm kiếm hồ sơ</a></li>
            <li><a href="#">Bảng giá dịch vụ</a></li>
          </ul>
        </div>
        <div className="footer-col social-col">
          <h3>Kết nối</h3>
          <div className="social-links">
            <a href="#" className="social-icon fb">f</a>
            <a href="#" className="social-icon in">in</a>
            <a href="#" className="social-icon tw">t</a>
          </div>
          <p className="contact-email">contact@jobviet.vn</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 JobViet. All rights reserved.</p>
      </div>
    </footer>
  );
};
