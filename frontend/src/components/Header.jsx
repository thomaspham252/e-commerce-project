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
            <li><a href="#">Công cụ</a></li>
          </ul>
        </nav>
        <div className="header-actions">
          <button className="btn btn-outline">Đăng nhập / Đăng ký</button>
          <button className="btn btn-primary">Nhà tuyển dụng</button>
        </div>
      </div>
    </header>
  );
};
