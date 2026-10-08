import './Header.css';
import { Link } from 'react-router-dom';

export const Header = () => {
  return (
    <header className="header">
      <div className="container header-container">
        <Link to="/" className="logo">
          JobViet
        </Link>
        <nav className="main-nav">
          <ul>
            <li><Link to="/">Việc làm</Link></li>
            <li><a href="#">Công ty</a></li>
            <li><a href="#">Hồ sơ & CV</a></li>
            <li><Link to="/thanh-toan">Nạp Token / Mua gói</Link></li>
            <li><Link to="/admin/payments">Quản lý SePay</Link></li>
          </ul>
        </nav>
        <div className="header-actions">
          <Link to="/dang-nhap" className="btn btn-outline">Đăng nhập / Đăng ký</Link>
          <Link to="/employer" className="btn btn-primary">Nhà tuyển dụng</Link>
        </div>
      </div>
    </header>
  );
};
