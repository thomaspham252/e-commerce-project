import React from 'react';
import './Header.css';
import { Link, NavLink } from 'react-router-dom';
import { Heart, Coins, PlusCircle } from 'lucide-react';
import { useSavedJobs } from '../context/SavedJobsContext';
import { useWallet } from '../context/WalletContext.jsx';

/**
 * Thanh điều hướng chính (Header) của JobViet.
 * Tích hợp huy hiệu số dư Token của ứng viên và nút truy cập nhanh vào Ví Token.
 */
export const Header = () => {
  const { savedJobIds } = useSavedJobs();
  const { balance = 0, loading = false } = useWallet();

  return (
    <header className="header">
      <div className="container header-container">
        <div className="header-left-cluster">
          <Link to="/" className="logo">
            JobViet
          </Link>
          <nav className="main-nav" aria-label="Điều hướng chính">
            <ul>
              <li><Link to="/">Việc làm</Link></li>
              <li><a href="#companies-section">Công ty</a></li>
              <li><a href="#candidate-tools-section">Tạo CV</a></li>
              <li><a href="#cam-nang-section">Cẩm nang</a></li>
              <li>
                <NavLink
                  to="/viec-lam-da-luu"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  title="Danh sách việc làm đã lưu"
                >
                  <Heart size={16} strokeWidth={1.75} />
                  <span>Việc đã lưu</span>
                  {savedJobIds?.size > 0 && <span className="nav-count">{savedJobIds.size}</span>}
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>

        <div className="header-actions">
          {/* Huy hiệu số dư Token của ứng viên */}
          <Link
            to="/candidate/wallet"
            className="header-token-badge"
            title="Xem và quản lý Ví Token Ứng viên"
            id="header-token-wallet-badge"
          >
            <div className="token-badge-icon-box">
              <Coins size={16} strokeWidth={1.75} />
            </div>
            <div className="token-badge-info">
              <span className="token-badge-amount">
                {loading ? '...' : Number(balance).toLocaleString('vi-VN')}
              </span>
              <span className="token-badge-unit">Token</span>
            </div>
            <span className="token-badge-add-btn" title="Nạp thêm token">
              <PlusCircle size={14} strokeWidth={1.75} />
            </span>
          </Link>

          <Link to="/dang-nhap" className="btn btn-outline">Đăng nhập</Link>
          <Link to="/employer" className="btn btn-primary">Nhà tuyển dụng</Link>
        </div>
      </div>
    </header>
  );
};
