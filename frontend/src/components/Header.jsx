import React, { useState, useEffect, useRef } from 'react';
import './Header.css';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Heart, Coins, PlusCircle, User, LogOut, ChevronDown, ShieldCheck, Briefcase } from 'lucide-react';
import { useSavedJobs } from '../context/SavedJobsContext';
import { useWallet } from '../context/WalletContext.jsx';
import { getAuthSession, clearAuthSession } from '../services/apiClient';

/**
 * Thanh điều hướng chính (Header) của JobViet.
 * Tích hợp huy hiệu số dư Token của ứng viên và hiển thị thông tin khi người dùng đã đăng nhập.
 */
export const Header = () => {
  const navigate = useNavigate();
  const { savedJobIds } = useSavedJobs();
  const { balance = 0, loading = false } = useWallet();
  const [currentUser, setCurrentUser] = useState(() => getAuthSession());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getAuthSession());
    };

    window.addEventListener('auth-session-changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('auth-session-changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    setDropdownOpen(false);
    navigate('/');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Quản trị viên', className: 'role-badge-admin' };
      case 'EMPLOYER':
        return { label: 'Nhà tuyển dụng', className: 'role-badge-employer' };
      default:
        return { label: 'Ứng viên', className: 'role-badge-candidate' };
    }
  };

  return (
    <header className="header">
      <div className="container header-container">
        <div className="header-left-cluster">
          <Link to="/" className="logo">
            JobViet
          </Link>
          <nav className="main-nav" aria-label="Điều hướng chính">
            <ul>
              <li>
                <NavLink
                  to="/viec-lam"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  Việc làm
                </NavLink>
              </li>
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

          {currentUser ? (
            <div className="header-user-menu" ref={dropdownRef}>
              <button
                type="button"
                className="header-user-btn"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className="header-user-avatar">
                  <User size={18} />
                </div>
                <div className="header-user-summary">
                  <span className="header-user-email" title={currentUser.email}>
                    {currentUser.email}
                  </span>
                  <span className={`header-role-badge ${getRoleBadge(currentUser.role).className}`}>
                    {getRoleBadge(currentUser.role).label}
                  </span>
                </div>
                <ChevronDown size={14} className={`header-chevron ${dropdownOpen ? 'open' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="header-dropdown-menu">
                  <div className="header-dropdown-header">
                    <p className="dropdown-signed-in">Đã đăng nhập bằng</p>
                    <p className="dropdown-email">{currentUser.email}</p>
                  </div>
                  <div className="header-dropdown-divider" />
                  
                  {currentUser.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      className="header-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <ShieldCheck size={16} />
                      <span>Trang Quản trị (Admin)</span>
                    </Link>
                  )}

                  {currentUser.role === 'EMPLOYER' && (
                    <Link
                      to="/employer"
                      className="header-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Briefcase size={16} />
                      <span>Trang Nhà tuyển dụng</span>
                    </Link>
                  )}

                  {currentUser.role === 'CANDIDATE' && (
                    <>
                      <Link
                        to="/candidate/wallet"
                        className="header-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Coins size={16} />
                        <span>Ví Token ứng viên</span>
                      </Link>
                      <Link
                        to="/viec-lam-da-luu"
                        className="header-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Heart size={16} />
                        <span>Việc làm đã lưu</span>
                      </Link>
                    </>
                  )}

                  <div className="header-dropdown-divider" />
                  <button
                    type="button"
                    className="header-dropdown-item header-logout-item"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/dang-nhap" className="btn btn-outline">Đăng nhập</Link>
              <Link to="/employer" className="btn btn-primary">Nhà tuyển dụng</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
