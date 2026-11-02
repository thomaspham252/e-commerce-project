import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../services/apiClient';
import { authService } from '../services/authService';
import './AuthPage.css';
import './EmailVerificationPage.css';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState('');

  const requestCode = async () => {
    setIsSubmitting(true);
    setNotice('');
    try {
      const result = await authService.forgotPassword(email);
      setCodeSent(true);
      setNotice(result.message);
    } catch (error) {
      setNotice(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestCode = async (event) => {
    event.preventDefault();
    await requestCode();
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setNotice('');
    if (newPassword !== confirmPassword) {
      setNotice('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authService.resetPassword({ email, code, newPassword });
      setIsComplete(true);
      setNotice(result.message);
    } catch (error) {
      setNotice(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
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
        <Link to="/dang-nhap" className="auth-back-link">← Quay lại đăng nhập</Link>

        <div className="auth-card verification-card">
          <div className="auth-heading">
            <span className="auth-eyebrow">KHÔI PHỤC TÀI KHOẢN</span>
            <h2>{isComplete ? 'Đã đổi mật khẩu' : 'Quên mật khẩu?'}</h2>
            <p>
              {isComplete
                ? 'Mật khẩu mới đã được lưu. Hãy đăng nhập bằng mật khẩu mới của bạn.'
                : codeSent
                  ? `Nhập mã 6 chữ số đã gửi đến ${email} và tạo mật khẩu mới. Mã có hiệu lực trong 10 phút.`
                  : 'Nhập email đã đăng ký. Chúng tôi sẽ gửi mã xác minh để bạn đặt lại mật khẩu.'}
            </p>
          </div>

          {isComplete ? (
            <Link className="auth-submit verification-back-button" to="/dang-nhap" state={{ email }}>
              Đến trang đăng nhập
              <span aria-hidden="true">→</span>
            </Link>
          ) : !codeSent ? (
            <form className="auth-form" onSubmit={handleRequestCode}>
              <label className="auth-field" htmlFor="reset-email">
                <span>Email</span>
                <input
                  autoComplete="email"
                  autoFocus
                  id="reset-email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="ban@email.com"
                  required
                  type="email"
                  value={email}
                />
              </label>
              <button className="auth-submit" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Đang gửi...' : 'Gửi mã xác minh'}
                <span aria-hidden="true">→</span>
              </button>
              {notice && <p className="auth-notice" role="status">{notice}</p>}
            </form>
          ) : (
            <>
              <form className="auth-form" onSubmit={handleResetPassword}>
                <label className="auth-field" htmlFor="reset-code">
                  <span>Mã xác minh</span>
                  <input
                    autoComplete="one-time-code"
                    autoFocus
                    className="verification-code"
                    id="reset-code"
                    inputMode="numeric"
                    maxLength={6}
                    onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    pattern="[0-9]{6}"
                    placeholder="Nhập mã gồm 6 chữ số"
                    required
                    value={code}
                  />
                </label>
                <label className="auth-field" htmlFor="new-password">
                  <span>Mật khẩu mới</span>
                  <input
                    autoComplete="new-password"
                    id="new-password"
                    minLength={8}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Ít nhất 8 ký tự"
                    required
                    type="password"
                    value={newPassword}
                  />
                </label>
                <label className="auth-field" htmlFor="confirm-new-password">
                  <span>Xác nhận mật khẩu mới</span>
                  <input
                    autoComplete="new-password"
                    id="confirm-new-password"
                    minLength={8}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    type="password"
                    value={confirmPassword}
                  />
                </label>
                <button className="auth-submit" disabled={isSubmitting} type="submit">
                  {isSubmitting ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
                  <span aria-hidden="true">→</span>
                </button>
                {notice && <p className="auth-notice" role="status">{notice}</p>}
              </form>

              <p className="verification-resend">
                Chưa nhận được mã?{' '}
                <button disabled={isSubmitting} onClick={requestCode} type="button">
                  Gửi lại mã
                </button>
              </p>
            </>
          )}

          <p className="auth-switch">
            Nhớ mật khẩu rồi? <Link to="/dang-nhap">Quay lại đăng nhập</Link>
          </p>
        </div>
        <p className="auth-footer">© JobViet — Kết nối đúng người, chọn đúng việc.</p>
      </section>
    </main>
  );
};
