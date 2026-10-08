import { useState } from 'react';
import { Link } from 'react-router-dom';
import './AuthPage.css';

export const AuthPage = () => {
  const [mode, setMode] = useState('login');
  const [notice, setNotice] = useState('');
  const isLogin = mode === 'login';

  const handleSubmit = (event) => {
    event.preventDefault();
    setNotice('Tính năng tài khoản chưa được kết nối. Vui lòng quay lại sau.');
  };

  const handleGoogleLogin = () => {
    setNotice('Đăng nhập với Google chưa được kết nối. Vui lòng quay lại sau.');
  };

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setNotice('');
  };

  return (
    <main className="auth-page">
      <section className="auth-intro" aria-label="Giới thiệu JobViet">
        <Link to="/" className="auth-logo">JobViet</Link>
        <div className="auth-intro-copy">
          <span className="auth-eyebrow">BƯỚC TIẾP THEO TRONG SỰ NGHIỆP</span>
          <h1>Cơ hội tốt bắt đầu từ một kết nối.</h1>
          <p>Tạo tài khoản để khám phá công việc phù hợp và đến gần hơn với mục tiêu của bạn.</p>
        </div>
        <div className="auth-intro-note">
          <span className="auth-note-mark" aria-hidden="true">“</span>
          <p>Mỗi hành trình nghề nghiệp đều bắt đầu bằng một cơ hội.</p>
        </div>
      </section>

      <section className="auth-panel">
        <Link to="/" className="auth-back-link">← Quay lại trang chủ</Link>

        <div className="auth-card">
          <div className="auth-heading">
            <span className="auth-eyebrow">CHÀO MỪNG ĐẾN VỚI JOBVIET</span>
            <h2>{isLogin ? 'Chào mừng bạn trở lại' : 'Tạo tài khoản mới'}</h2>
            <p>
              {isLogin
                ? 'Đăng nhập để tiếp tục hành trình tìm việc của bạn.'
                : 'Đăng ký miễn phí để không bỏ lỡ cơ hội phù hợp.'}
            </p>
          </div>

          <div className="auth-tabs" role="tablist" aria-label="Chọn hình thức tài khoản">
            <button
              className={isLogin ? 'auth-tab active' : 'auth-tab'}
              type="button"
              role="tab"
              aria-selected={isLogin}
              onClick={() => changeMode('login')}
            >
              Đăng nhập
            </button>
            <button
              className={!isLogin ? 'auth-tab active' : 'auth-tab'}
              type="button"
              role="tab"
              aria-selected={!isLogin}
              onClick={() => changeMode('register')}
            >
              Đăng ký
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <label className="auth-field">
                <span>Họ và tên</span>
                <input autoComplete="name" name="name" placeholder="Nguyễn Văn An" required />
              </label>
            )}
            <label className="auth-field">
              <span>Email</span>
              <input
                autoComplete="email"
                name="email"
                type="email"
                placeholder="ban@email.com"
                required
              />
            </label>
            <label className="auth-field">
              <span>Mật khẩu</span>
              <input
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                name="password"
                type="password"
                placeholder="Ít nhất 8 ký tự"
                minLength={8}
                required
              />
            </label>

            {isLogin ? (
              <label className="auth-remember">
                <input type="checkbox" name="remember" />
                <span>Ghi nhớ đăng nhập</span>
              </label>
            ) : (
              <label className="auth-remember">
                <input type="checkbox" name="terms" required />
                <span>Tôi đồng ý với điều khoản sử dụng của JobViet.</span>
              </label>
            )}

            <button className="auth-submit" type="submit">
              {isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
              <span aria-hidden="true">→</span>
            </button>
            {notice && <p className="auth-notice" role="status">{notice}</p>}
          </form>

          {isLogin && (
            <div className="auth-google-section">
              <div className="auth-divider"><span>hoặc tiếp tục với</span></div>
              <button className="auth-google" type="button" onClick={handleGoogleLogin}>
                <svg aria-hidden="true" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.42 5.76c4.33-4 7.35-9.9 7.35-17.41Z" />
                  <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.75-4.59l-7.98-6.19A23.87 23.87 0 0 0 0 24c0 3.87.93 7.55 2.56 10.78l7.97-6.19Z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.79l-7.42-5.76c-2.06 1.38-4.7 2.2-8.48 2.2-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
                </svg>
                Đăng nhập với Google
              </button>
            </div>
          )}

          <p className="auth-switch">
            {isLogin ? 'Bạn chưa có tài khoản?' : 'Bạn đã có tài khoản?'}{' '}
            <button
              type="button"
              onClick={() => changeMode(isLogin ? 'register' : 'login')}
            >
              {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </p>
        </div>
        <p className="auth-footer">© JobViet — Kết nối đúng người, chọn đúng việc.</p>
      </section>
    </main>
  );
};
