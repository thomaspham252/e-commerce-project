import React from 'react';
import './Header.css';
import { Link, NavLink } from 'react-router-dom';
import { Heart, History, Coins, PlusCircle } from 'lucide-react';
import { useSavedJobs } from '../context/SavedJobsContext';
import { useApplications } from '../context/ApplicationsContext';
import { useWallet } from '../context/WalletContext.jsx';

/**
 * Thanh điều hướng chính (Header) của JobViet.
 * Tích hợp huy hiệu số dư Token của ứng viên và nút truy cập nhanh vào Ví Token.
 */
export const Header = () => {
  const { savedJobIds } = useSavedJobs();
  const { applications } = useApplications();
  const { balance = 0, loading = false } = useWallet();

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
                {savedJobIds?.size > 0 && <span className="nav-count">{savedJobIds.size}</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/lich-su-ung-tuyen"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                <History size={16} />
                Lịch sử ứng tuyển
                {applications?.length > 0 && <span className="nav-count">{applications.length}</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/candidate/wallet"
                className={({ isActive }) => (isActive ? 'nav-link nav-wallet-link active' : 'nav-link nav-wallet-link')}
              >
                <Coins size={16} />
                Ví Token
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          {/* Huy hiệu số dư Token của ứng viên */}
          <Link
            to="/candidate/wallet"
            className="header-token-badge"
            title="Xem và quản lý Ví Token Ứng viên"
            id="header-token-wallet-badge"
          >
            <div className="token-badge-icon-box">
              <Coins size={16} />
            </div>
            <div className="token-badge-info">
              <span className="token-badge-amount">
                {loading ? '...' : Number(balance).toLocaleString('vi-VN')}
              </span>
              <span className="token-badge-unit">Token</span>
            </div>
            <span className="token-badge-add-btn" title="Nạp thêm token">
              <PlusCircle size={14} />
            </span>
          </Link>

          <Link to="/dang-nhap" className="btn btn-outline">Đăng nhập</Link>
          <Link to="/employer" className="btn btn-primary">Nhà tuyển dụng</Link>
        </div>
      </div>
    </header>
  );
};
