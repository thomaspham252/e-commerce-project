import React from 'react';
import './Header.css';
import { Link } from 'react-router-dom';
import { Coins, PlusCircle } from 'lucide-react';
import { useWallet } from '../context/WalletContext.jsx';

/**
 * Thanh điều hướng chính (Header) của JobViet.
 * Tích hợp huy hiệu số dư Token của ứng viên và nút truy cập nhanh vào Ví Token.
 */
export const Header = () => {
  let balance = 0;
  let loading = false;

  try {
    const walletCtx = useWallet();
    balance = walletCtx.balance;
    loading = walletCtx.loading;
  } catch (_e) {
    // Nếu dùng ngoài provider thì fallback an toàn
    balance = 150;
  }

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
              <Link to="/candidate/wallet" className="nav-wallet-link">
                Ví Token
              </Link>
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
