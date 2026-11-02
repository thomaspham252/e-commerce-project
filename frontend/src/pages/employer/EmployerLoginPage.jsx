import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { getErrorMessage, saveAuthSession } from '../../services/apiClient';
import { FiMail, FiLock, FiArrowRight, FiShield, FiAlertTriangle } from 'react-icons/fi';
import './EmployerLoginPage.css';

/**
 * Trang Đăng nhập dành riêng cho Nhà tuyển dụng JobViet.
 * Tuyến đường: /employer/login
 */
export const EmployerLoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [notice, setNotice] = useState('');
  const [candidateRoleDetected, setCandidateRoleDetected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotice('');
    setCandidateRoleDetected(false);

    try {
      const user = await authService.login({
        email: email.trim(),
        password
      });

      // Kiểm tra phân quyền vai trò
      if (user.role === 'CANDIDATE') {
        // Từ chối đăng nhập cổng Nhà tuyển dụng
        setCandidateRoleDetected(true);
        setNotice('Tài khoản của bạn là tài khoản Ứng viên. Cổng này chỉ dành riêng cho Nhà tuyển dụng tìm kiếm và quản lý nhân sự.');
        return;
      }

      if (user.role === 'ADMIN') {
        saveAuthSession(user, remember);
        navigate('/admin', { replace: true });
        return;
      }

      // Tài khoản vai trò EMPLOYER hợp lệ
      saveAuthSession(user, remember);
      navigate('/employer/dashboard', { replace: true });
    } catch (error) {
      setNotice(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="employer-auth-layout">
      {/* Sidebar thương hiệu */}
      <div className="auth-brand-sidebar">
        <Link to="/employer" className="sidebar-logo">
          JobViet <span>Tuyển dụng</span>
        </Link>

        <div className="sidebar-promo-box">
          <span className="promo-tag">CỔNG NHÀ TUYỂN DỤNG</span>
          <h2>Chào mừng quay trở lại với JobViet Tuyển Dụng</h2>
          <p>
            Đăng nhập để theo dõi các chiến dịch tuyển dụng, cập nhật tình trạng hồ sơ ứng viên
            và kết nối nhanh chóng với các nhân sự tài năng.
          </p>

          <div className="sidebar-perks">
            <div className="perk-row">
              <FiShield className="perk-icon" />
              <span>Hệ thống bảo mật xác thực nhiều lớp</span>
            </div>
            <div className="perk-row">
              <FiShield className="perk-icon" />
              <span>Dữ liệu ứng tuyển thời gian thực</span>
            </div>
          </div>
        </div>

        <div className="sidebar-footer">
          <p>© 2026 JobViet. Dành riêng cho Doanh nghiệp.</p>
        </div>
      </div>

      {/* Container form đăng nhập */}
      <div className="auth-form-container login-form-wrapper">
        <div className="auth-form-header">
          <Link to="/employer" className="btn-back-home">
            ← Quay lại trang giới thiệu
          </Link>
          <div className="header-login-prompt">
            <span>Chưa có tài khoản?</span>
            <Link to="/employer/register" className="link-switch-auth">
              Đăng ký ngay
            </Link>
          </div>
        </div>

        <div className="auth-form-body login-body-max">
          <div className="form-title-group">
            <h1 className="form-main-title">Đăng nhập Nhà tuyển dụng</h1>
            <p className="form-main-desc">
              Nhập email và mật khẩu tài khoản doanh nghiệp để truy cập Dashboard.
            </p>
          </div>

          {notice && (
            <div className={`auth-error-alert ${candidateRoleDetected ? 'role-mismatch-box' : ''}`} role="alert">
              {candidateRoleDetected && <FiAlertTriangle size={20} className="alert-icon-leading" />}
              <div className="alert-text-body">
                <span>{notice}</span>
                {candidateRoleDetected && (
                  <div className="role-redirect-actions">
                    <Link to="/dang-nhap" className="btn-to-candidate-login">
                      Chuyển sang Đăng nhập Ứng viên
                    </Link>
                    <Link to="/employer/register" className="btn-to-employer-register">
                      Đăng ký tài khoản Nhà tuyển dụng
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          <form className="employer-login-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="login-email">Email đăng nhập *</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" />
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="recruiter@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (notice) setNotice('');
                  }}
                />
              </div>
            </div>

            <div className="form-field">
              <div className="field-label-between">
                <label htmlFor="login-password">Mật khẩu *</label>
                <a href="#quen-mat-khau" className="link-forgot-pw" onClick={(e) => { e.preventDefault(); alert('Vui lòng liên hệ hotline hỗ trợ 1900 6868 để đặt lại mật khẩu.'); }}>
                  Quên mật khẩu?
                </a>
              </div>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  id="login-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (notice) setNotice('');
                  }}
                />
              </div>
            </div>

            <div className="form-remember-row">
              <label className="remember-checkbox-label">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Ghi nhớ đăng nhập trên thiết bị này</span>
              </label>
            </div>

            <button
              type="submit"
              className="btn-submit-register"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Đang xác thực...</span>
              ) : (
                <>
                  <span>Đăng nhập vào Cổng Tuyển dụng</span>
                  <FiArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="login-divider-box">
            <span className="divider-line" />
            <span className="divider-label">HOẶC</span>
            <span className="divider-line" />
          </div>

          <div className="candidate-portal-switch">
            <span>Bạn là ứng viên đang tìm kiếm cơ hội việc làm?</span>
            <Link to="/dang-nhap" className="link-candidate-portal">
              Đăng nhập cổng Ứng viên tại đây →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
