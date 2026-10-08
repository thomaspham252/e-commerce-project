import './Header.css';
import { Link, NavLink } from 'react-router-dom';
import { Heart, History } from 'lucide-react';
import { useSavedJobs } from '../context/SavedJobsContext';
import { useApplications } from '../context/ApplicationsContext';

export const Header = () => {
  const { savedJobIds } = useSavedJobs();
  const { applications } = useApplications();

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
            <li>
              <NavLink
                to="/viec-lam-da-luu"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                <Heart size={16} />
                Việc đã lưu
                {savedJobIds.size > 0 && <span className="nav-count">{savedJobIds.size}</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/lich-su-ung-tuyen"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                <History size={16} />
                Lịch sử ứng tuyển
                {applications.length > 0 && <span className="nav-count">{applications.length}</span>}
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="header-actions">
          <Link to="/dang-nhap" className="btn btn-outline">Đăng nhập / Đăng ký</Link>
          <button className="btn btn-primary">Nhà tuyển dụng</button>
        </div>
      </div>
    </header>
  );
};
