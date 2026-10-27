import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getErrorMessage, saveAuthSession } from '../services/apiClient';
import { authService } from '../services/authService';
import { loadGoogleIdentity } from '../services/googleIdentity';
import './AuthPage.css';

export const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState(location.state?.mode === 'register' ? 'register' : 'login');
  const [notice, setNotice] = useState('');
  const [googleLoadError, setGoogleLoadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleButtonRef = useRef(null);
  const rememberGoogleLogin = useRef(false);
  const isLogin = mode === 'login';

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setNotice('');

    try {
      const user = isLogin
        ? await authService.login({
            email: formData.get('email'),
            password: formData.get('password'),
          })
        : await authService.register({
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
          });
      saveAuthSession(user, formData.get('remember') === 'on');
      const destination = {
        ADMIN: '/admin',
        EMPLOYER: '/employer',
        CANDIDATE: '/',
      }[user.role] || '/';
      navigate(destination, { replace: true });
    } catch (error) {
      setNotice(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleCredential = useCallback(async (credential) => {
    setIsSubmitting(true);
    setNotice('');

    try {
      const user = await authService.loginWithGoogle(credential);
      saveAuthSession(user, rememberGoogleLogin.current);
      const destination = {
        ADMIN: '/admin',
        EMPLOYER: '/employer',
        CANDIDATE: '/',
      }[user.role] || '/';
      navigate(destination, { replace: true });
    } catch (error) {
      setNotice(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }, [navigate]);

  useEffect(() => {
    const googleButton = googleButtonRef.current;
    if (!isLogin || !googleButton) return undefined;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return undefined;

    let isActive = true;
    loadGoogleIdentity()
      .then((google) => {
        if (!isActive) return;

        google.accounts.id.initialize({
          client_id: clientId,
          callback: ({ credential }) => {
            if (credential) {
              void handleGoogleCredential(credential);
            } else {
              setNotice('Google không trả về thông tin đăng nhập. Vui lòng thử lại.');
            }
          },
        });
        google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rect',
          width: Math.floor(googleButton.getBoundingClientRect().width),
          locale: 'vi',
        });
      }).catch(() => {
        if (isActive) setGoogleLoadError('Không thể tải dịch vụ đăng nhập Google. Vui lòng thử lại.');
      });

    return () => {
      isActive = false;
      googleButton.replaceChildren();
    };
  }, [handleGoogleCredential, isLogin]);

  const googleNotice = import.meta.env.VITE_GOOGLE_CLIENT_ID
    ? googleLoadError
    : 'Chưa cấu hình VITE_GOOGLE_CLIENT_ID cho đăng nhập Google.';

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
                defaultValue={location.state?.email || ''}
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
                placeholder={isLogin ? 'Nhập mật khẩu của bạn' : 'Ít nhất 8 ký tự'}
                minLength={isLogin ? undefined : 8}
                required
              />
            </label>

            {isLogin ? (
              <label className="auth-remember">
                <input
                  type="checkbox"
                  name="remember"
                  onChange={(event) => {
                    rememberGoogleLogin.current = event.target.checked;
                  }}
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
            ) : (
              <label className="auth-remember">
                <input type="checkbox" name="terms" required />
                <span>Tôi đồng ý với điều khoản sử dụng của JobViet.</span>
              </label>
            )}

            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
              <span aria-hidden="true">→</span>
            </button>
            {notice && <p className="auth-notice" role="status">{notice}</p>}
          </form>

          {isLogin && (
            <div className="auth-google-section">
              <div className="auth-divider"><span>hoặc tiếp tục với</span></div>
              <div className="auth-google-button" ref={googleButtonRef} />
              {googleNotice && <p className="auth-notice" role="status">{googleNotice}</p>}
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
