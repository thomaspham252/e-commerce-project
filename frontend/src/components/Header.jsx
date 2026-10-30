import React, { useState, useEffect, useRef } from 'react';
import './Header.css';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Heart,
  Coins,
  PlusCircle,
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Briefcase,
  LayoutGrid,
  FileText,
  Inbox,
  Mail,
  Bell,
  Settings,
  MessageSquare,
  Star
} from 'lucide-react';
import { useSavedJobs } from '../context/SavedJobsContext';
import { useWallet } from '../context/WalletContext.jsx';
import { getAuthSession, clearAuthSession, apiClient } from '../services/apiClient';

/**
 * Thanh điều hướng chính (Header) của JobViet.
 * Tích hợp menu dropdown phong cách ITviec khi di chuột vào avatar.
 */
export const Header = () => {
  const navigate = useNavigate();
  const { savedJobIds } = useSavedJobs();
  const { balance = 0, loading = false } = useWallet();
  const [currentUser, setCurrentUser] = useState(() => getAuthSession());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await apiClient.get('/v1/chat/unread-count');
        setChatUnreadCount(res.data?.totalUnread ?? 0);
      } catch {
        // ignore
      }
    };

    fetchUnread();
    const interval = setInterval(() => {
      if (!document.hidden) fetchUnread();
    }, 10000);

    return () => clearInterval(interval);
  }, [currentUser]);

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
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 220);
  };

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

  const getDisplayName = (user) => {
    if (!user) return 'Người dùng';
    if (user.fullName) return user.fullName;
    if (user.name) return user.name;
    const email = user.email || '';
    if (email === '22130143@st.hcmuaf.edu.vn' || email.includes('linh') || email === 'flack25.2@gmail.com') {
      return 'Linh Phạm Văn';
    }
    const prefix = email.split('@')[0];
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  };

  const getAvatarLetter = (user) => {
    if (!user) return 'U';
    const name = getDisplayName(user);
    return name.trim().charAt(0).toUpperCase();
  };

  const displayName = currentUser ? getDisplayName(currentUser) : '';
  const avatarLetter = currentUser ? getAvatarLetter(currentUser) : 'U';

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
              <li><NavLink to="/cong-ty" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>Công ty</NavLink></li>
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

          {/* Nút Chat nhanh với Nhà tuyển dụng */}
          <Link
            to="/ung-vien/tin-nhan"
            className="header-chat-action-btn"
            title="Tin nhắn với Nhà tuyển dụng"
            id="header-chat-messages-btn"
          >
            <MessageSquare size={17} strokeWidth={1.8} />
            {chatUnreadCount > 0 && (
              <span className="header-chat-unread-dot" title={`${chatUnreadCount} tin nhắn mới`}>
                {chatUnreadCount > 99 ? '99+' : chatUnreadCount}
              </span>
            )}
          </Link>

          {currentUser ? (
            <div
              className="header-user-menu"
              ref={dropdownRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className={`header-user-btn ${dropdownOpen ? 'is-active' : ''}`}
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className="header-user-avatar">
                  <span>{avatarLetter}</span>
                </div>
                <div className="header-user-summary">
                  <span className="header-user-name" title={displayName}>
                    {displayName}
                  </span>
                  <span className={`header-role-badge ${getRoleBadge(currentUser.role).className}`}>
                    {getRoleBadge(currentUser.role).label}
                  </span>
                </div>
                <ChevronDown size={14} className={`header-chevron ${dropdownOpen ? 'open' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="header-dropdown-menu">
                  {/* Phần thông tin người dùng trên đầu dropdown theo chuẩn ITviec */}
                  <div className="header-dropdown-user-header">
                    <div className="dropdown-avatar-circle">
                      <span>{avatarLetter}</span>
                    </div>
                    <div className="dropdown-user-info-text">
                      <h4 className="dropdown-user-name">{displayName}</h4>
                      <p className="dropdown-user-email" title={currentUser.email}>
                        {currentUser.email}
                      </p>
                    </div>
                  </div>

                  <div className="header-dropdown-divider" />

                  {/* Danh sách mục menu theo đúng ảnh mẫu ITviec */}
                  <div className="header-dropdown-list">
                    <Link
                      to="/ung-vien"
                      className="header-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutGrid size={18} className="dropdown-item-icon" />
                      <span>Tổng quan</span>
                    </Link>

                    <Link
                      to="/ung-vien/ho-so"
                      className="header-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User size={18} className="dropdown-item-icon" />
                      <span>Hồ sơ của tôi</span>
                    </Link>

                    <Link
                      to="/ung-vien/tao-cv"
                      className="header-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FileText size={18} className="dropdown-item-icon" />
                      <span>Tạo CV</span>
                    </Link>

                    <Link
                      to="/ung-vien/viec-lam"
                      className="header-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Briefcase size={18} className="dropdown-item-icon" />
                      <span>Việc làm của tôi</span>
                    </Link>

                    <Link
                      to="/ung-vien/tin-nhan"
                      className="header-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <MessageSquare size={18} className="dropdown-item-icon" />
                      <div className="header-dropdown-badge-row">
                        <span>Tin nhắn với NTD</span>
                        {chatUnreadCount > 0 && (
                          <span className="itv-pill-count">{chatUnreadCount}</span>
                        )}
                      </div>
                    </Link>

                    <Link
                      to="/ung-vien/loi-moi"
                      className="header-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Inbox size={18} className="dropdown-item-icon" />
                      <span>Lời mời công việc</span>
                    </Link>

                    <Link
                      to="/candidate/wallet"
                      className="header-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Coins size={18} className="dropdown-item-icon" />
                      <span>Ví Token ứng viên</span>
                    </Link>

                    <Link
                      to="/viec-lam-da-luu"
                      className="header-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Heart size={18} className="dropdown-item-icon" />
                      <span>Việc làm đã lưu</span>
                    </Link>

                    <Link
                      to="/ung-vien/dang-ky-email"
                      className="header-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Mail size={18} className="dropdown-item-icon" />
                      <span>Đăng ký nhận email</span>
                    </Link>

                    <Link
                      to="/ung-vien/thong-bao"
                      className="header-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Bell size={18} className="dropdown-item-icon" />
                      <span>Thông báo</span>
                    </Link>

                    <Link
                      to="/ung-vien/cai-dat"
                      className="header-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Settings size={18} className="dropdown-item-icon" />
                      <span>Cài đặt</span>
                    </Link>

                    {currentUser.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        className="header-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <ShieldCheck size={18} className="dropdown-item-icon" />
                        <span>Trang Quản trị (Admin)</span>
                      </Link>
                    )}

                    {currentUser.role === 'EMPLOYER' && (
                      <>
                        <Link
                          to="/employer"
                          className="header-dropdown-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Briefcase size={18} className="dropdown-item-icon" />
                          <span>K�nh Tuy?n d?ng</span>
                        </Link>
                        <Link
                          to="/employer/reviews"
                          className="header-dropdown-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Star size={18} className="dropdown-item-icon" style={{ color: "#F59E0B" }} />
                          <span>Qu?n l� ��nh gi�</span>
                        </Link>
                      </>
                    )}
                  </div>

                  <div className="header-dropdown-divider" />

                  <button
                    type="button"
                    className="header-dropdown-item header-logout-item"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} className="dropdown-item-icon" />
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
