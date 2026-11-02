import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { getErrorMessage } from '../../services/apiClient';
import { FiCheckCircle, FiShield, FiArrowRight, FiLock, FiMail, FiPhone, FiUser, FiBriefcase, FiMapPin, FiGlobe } from 'react-icons/fi';
import './EmployerRegisterPage.css';

/**
 * Trang Đăng ký tài khoản Nhà tuyển dụng & Hồ sơ Doanh nghiệp JobViet.
 * Tuyến đường: /employer/register
 */
export const EmployerRegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    industry: 'Công nghệ thông tin / Phần mềm',
    size: '25-99 nhân viên',
    address: '',
    website: ''
  });

  const [agreeTerms, setAgreeTerms] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 8) {
      setErrorMessage('Mật khẩu phải có độ dài tối thiểu 8 ký tự.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Xác nhận mật khẩu không khớp. Vui lòng kiểm tra lại.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Vui lòng đồng ý với Điều khoản dịch vụ của JobViet.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await authService.registerEmployer({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        companyName: formData.companyName.trim(),
        industry: formData.industry,
        size: formData.size,
        address: formData.address.trim(),
        website: formData.website.trim() || undefined
      });

      // Điều hướng sang trang xác minh OTP qua email
      navigate('/xac-thuc-email', {
        replace: true,
        state: { email: formData.email.trim() }
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="employer-auth-layout">
      {/* Cột trái: Giới thiệu quyền lợi và thương hiệu */}
      <div className="auth-brand-sidebar">
        <Link to="/employer" className="sidebar-logo">
          JobViet <span>Tuyển dụng</span>
        </Link>

        <div className="sidebar-promo-box">
          <span className="promo-tag">DÀNH CHO DOANH NGHIỆP</span>
          <h2>Xây dựng đội ngũ nhân sự vững mạnh cùng JobViet</h2>
          <p>
            Mở rộng quy mô tuyển dụng với chi phí tối ưu. Tiếp cận mạng lưới ứng viên chất lượng
            cao và quản lý toàn bộ quy trình trên một nền tảng thông minh.
          </p>

          <div className="sidebar-perks">
            <div className="perk-row">
              <FiCheckCircle className="perk-icon" />
              <span>Tiếp cận 100.000+ ứng viên tiềm năng</span>
            </div>
            <div className="perk-row">
              <FiCheckCircle className="perk-icon" />
              <span>Đăng tin tuyển dụng và quản lý hồ sơ tập trung</span>
            </div>
            <div className="perk-row">
              <FiCheckCircle className="perk-icon" />
              <span>Nhắn tin và phỏng vấn trực tiếp tức thời</span>
            </div>
            <div className="perk-row">
              <FiShield className="perk-icon" />
              <span>Bảo mật dữ liệu và hỗ trợ doanh nghiệp 24/7</span>
            </div>
          </div>
        </div>

        <div className="sidebar-footer">
          <p>© 2026 JobViet. Nền tảng tuyển dụng thông minh.</p>
        </div>
      </div>

      {/* Cột phải: Form đăng ký */}
      <div className="auth-form-container">
        <div className="auth-form-header">
          <Link to="/employer" className="btn-back-home">
            ← Quay lại trang giới thiệu
          </Link>
          <div className="header-login-prompt">
            <span>Đã có tài khoản Nhà tuyển dụng?</span>
            <Link to="/employer/login" className="link-switch-auth">
              Đăng nhập ngay
            </Link>
          </div>
        </div>

        <div className="auth-form-body">
          <div className="form-title-group">
            <h1 className="form-main-title">Đăng ký tài khoản Nhà tuyển dụng</h1>
            <p className="form-main-desc">
              Hoàn tất thông tin dưới đây để bắt đầu đăng tin và tiếp cận nhân tài.
            </p>
          </div>

          {errorMessage && (
            <div className="auth-error-alert" role="alert">
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="employer-reg-form" onSubmit={handleSubmit}>
            {/* Nhóm 1: Thông tin người đại diện */}
            <div className="form-section-block">
              <h3 className="section-block-title">
                <FiUser className="section-title-icon" />
                <span>1. Thông tin người đại diện tuyển dụng</span>
              </h3>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="reg-name">Họ và tên *</label>
                  <div className="input-with-icon">
                    <FiUser className="input-icon" />
                    <input
                      id="reg-name"
                      name="name"
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn An"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="reg-phone">Số điện thoại liên hệ *</label>
                  <div className="input-with-icon">
                    <FiPhone className="input-icon" />
                    <input
                      id="reg-phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="0912345678"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="reg-email">Email doanh nghiệp / làm việc *</label>
                <div className="input-with-icon">
                  <FiMail className="input-icon" />
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    required
                    placeholder="recruiter@company.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <span className="field-hint">Mã OTP xác thực sẽ được gửi tới địa chỉ email này.</span>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="reg-password">Mật khẩu * (Tối thiểu 8 ký tự)</label>
                  <div className="input-with-icon">
                    <FiLock className="input-icon" />
                    <input
                      id="reg-password"
                      name="password"
                      type="password"
                      required
                      minLength={8}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="reg-confirmPassword">Xác nhận mật khẩu *</label>
                  <div className="input-with-icon">
                    <FiLock className="input-icon" />
                    <input
                      id="reg-confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      minLength={8}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Nhóm 2: Thông tin Doanh nghiệp */}
            <div className="form-section-block">
              <h3 className="section-block-title">
                <FiBriefcase className="section-title-icon" />
                <span>2. Thông tin doanh nghiệp</span>
              </h3>

              <div className="form-field">
                <label htmlFor="reg-companyName">Tên doanh nghiệp / Công ty *</label>
                <div className="input-with-icon">
                  <FiBriefcase className="input-icon" />
                  <input
                    id="reg-companyName"
                    name="companyName"
                    type="text"
                    required
                    placeholder="Ví dụ: Công ty Cổ phần Công nghệ TechViet"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="reg-industry">Lĩnh vực hoạt động *</label>
                  <select
                    id="reg-industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                  >
                    <option value="Công nghệ thông tin / Phần mềm">Công nghệ thông tin / Phần mềm</option>
                    <option value="Thương mại điện tử / Bán lẻ">Thương mại điện tử / Bán lẻ</option>
                    <option value="Tài chính / Ngân hàng / Bảo hiểm">Tài chính / Ngân hàng / Bảo hiểm</option>
                    <option value="Marketing / Truyền thông / Quảng cáo">Marketing / Truyền thông / Quảng cáo</option>
                    <option value="Sản xuất / Xuất nhập khẩu">Sản xuất / Xuất nhập khẩu</option>
                    <option value="Giáo dục / Đào tạo">Giáo dục / Đào tạo</option>
                    <option value="Bất động sản / Xây dựng">Bất động sản / Xây dựng</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="reg-size">Quy mô nhân sự *</label>
                  <select
                    id="reg-size"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                  >
                    <option value="1-9 nhân viên">1-9 nhân viên</option>
                    <option value="10-24 nhân viên">10-24 nhân viên</option>
                    <option value="25-99 nhân viên">25-99 nhân viên</option>
                    <option value="100-499 nhân viên">100-499 nhân viên</option>
                    <option value="500+ nhân viên">500+ nhân viên</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="reg-address">Địa chỉ văn phòng / Trụ sở *</label>
                <div className="input-with-icon">
                  <FiMapPin className="input-icon" />
                  <input
                    id="reg-address"
                    name="address"
                    type="text"
                    required
                    placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="reg-website">Website doanh nghiệp (Tùy chọn)</label>
                <div className="input-with-icon">
                  <FiGlobe className="input-icon" />
                  <input
                    id="reg-website"
                    name="website"
                    type="url"
                    placeholder="https://company.example.com"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Điều khoản & Cam kết */}
            <div className="form-terms-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <span>
                  Tôi cam kết thông tin cung cấp là chính xác và đồng ý với{' '}
                  <a href="#dieu-khoan" target="_blank" rel="noreferrer">Điều khoản dịch vụ</a> và{' '}
                  <a href="#chinh-sach" target="_blank" rel="noreferrer">Chính sách bảo mật</a> của JobViet.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="btn-submit-register"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Đang xử lý đăng ký...</span>
              ) : (
                <>
                  <span>Hoàn tất đăng ký & Nhận mã OTP</span>
                  <FiArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
