import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getErrorMessage, saveAuthSession } from '../services/apiClient';
import { authService } from '../services/authService';
import './EmailVerificationPage.css';

export const EmailVerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const [code, setCode] = useState('');
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setNotice('');
    try {
      const user = await authService.verifyEmail({ email, code });
      saveAuthSession(user, false);
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

  const handleResend = async () => {
    setIsResending(true);
    setNotice('');
    try {
      const result = await authService.resendVerification(email);
      setNotice(result.message);
    } catch (error) {
      setNotice(getErrorMessage(error));
    } finally {
      setIsResending(false);
    }
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

        <div className="auth-card verification-card">
          <div className="auth-heading">
            <span className="auth-eyebrow">XÁC MINH TÀI KHOẢN</span>
            <h2 id="verification-title">Kiểm tra email của bạn</h2>
            <p>
              {email
                ? `Mã gồm 6 chữ số đã được gửi đến ${email} để hoàn tất tạo tài khoản. Mã có hiệu lực trong 10 phút.`
                : 'Để tiếp tục, hãy quay lại trang đăng ký và nhập địa chỉ email của bạn.'}
            </p>
          </div>

          {email ? (
            <>
              <form className="auth-form" onSubmit={handleSubmit}>
                <label className="auth-field" htmlFor="verification-code">
                  <span>Mã xác minh</span>
                  <input
                    autoComplete="one-time-code"
                    autoFocus
                    className="verification-code"
                    id="verification-code"
                    inputMode="numeric"
                    maxLength={6}
                    name="code"
                    onChange={(event) => {
                      setCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                      setNotice('');
                    }}
                    pattern="[0-9]{6}"
                    placeholder="Nhập mã gồm 6 chữ số"
                    required
                    type="text"
                    value={code}
                  />
                </label>
                <button className="auth-submit" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang xác minh...' : 'Xác minh email'}
                  <span aria-hidden="true">→</span>
                </button>
                {notice && <p className="auth-notice" role="status">{notice}</p>}
              </form>

              <p className="verification-resend">
                Chưa nhận được mã?{' '}
                <button type="button" disabled={isResending || isSubmitting} onClick={handleResend}>
                  {isResending ? 'Đang gửi...' : 'Gửi lại mã'}
                </button>
              </p>
            </>
          ) : (
            <Link
              className="auth-submit verification-back-button"
              state={{ mode: 'register' }}
              to="/dang-nhap"
            >
              Quay lại đăng ký
              <span aria-hidden="true">→</span>
            </Link>
          )}

          <p className="auth-switch">
            Bạn muốn dùng tài khoản khác?{' '}
            <Link to="/dang-nhap">Quay lại đăng nhập</Link>
          </p>
        </div>
        <p className="auth-footer">© JobViet — Kết nối đúng người, chọn đúng việc.</p>
      </section>
    </main>
  );
};
