import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiSend } from 'react-icons/fi';

/**
 * Khối Kêu gọi hành động (Call To Action) và Form liên hệ tư vấn nhanh dành cho doanh nghiệp.
 */
export const EmployerLandingCta = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    need: 'Đăng tin tuyển dụng nhanh'
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="lien-he" className="employer-cta-section">
      <div className="employer-landing-container cta-container-grid">
        {/* Cột trái: Kêu gọi hành động trực tiếp */}
        <div className="cta-content-left">
          <span className="cta-eyebrow-tag">BẮT ĐẦU NGAY HÔM NAY</span>
          <h2 className="cta-headline">
            Sẵn sàng kết nối với những nhân tài xuất sắc nhất?
          </h2>
          <p className="cta-subheadline">
            Đăng ký tài khoản miễn phí chỉ trong vài phút. Bắt đầu đăng tin và tiếp cận hàng nghìn ứng viên phù hợp với tiêu chí tuyển dụng của bạn.
          </p>

          <div className="cta-btn-wrapper">
            <Link to="/employer/register" className="btn-cta-signup">
              <span>Đăng ký tài khoản Nhà tuyển dụng</span>
              <FiArrowRight size={18} />
            </Link>
          </div>

          <div className="cta-perks-list">
            <div className="perk-item">
              <FiCheckCircle className="perk-icon" />
              <span>Không phí duy trì tài khoản</span>
            </div>
            <div className="perk-item">
              <FiCheckCircle className="perk-icon" />
              <span>Tặng gói trải nghiệm tuyển dụng ban đầu</span>
            </div>
            <div className="perk-item">
              <FiCheckCircle className="perk-icon" />
              <span>Chuyên viên hỗ trợ 1:1 tận tâm</span>
            </div>
          </div>
        </div>

        {/* Cột phải: Form tư vấn nhanh */}
        <div className="cta-form-right">
          <div className="cta-form-card">
            <h3 className="form-card-title">Đăng ký nhận tư vấn giải pháp</h3>
            <p className="form-card-subtitle">
              Chuyên viên tuyển dụng JobViet sẽ liên hệ lại trong vòng 24 giờ làm việc.
            </p>

            {submitted ? (
              <div className="consult-success-box">
                <FiCheckCircle size={40} className="success-icon" />
                <h4>Gửi thông tin thành công!</h4>
                <p>Cảm ơn bạn đã quan tâm. Chúng tôi sẽ sớm liên hệ qua số điện thoại và email đã cung cấp.</p>
                <button
                  type="button"
                  className="btn-reset-consult"
                  onClick={() => setSubmitted(false)}
                >
                  Gửi yêu cầu khác
                </button>
              </div>
            ) : (
              <form className="consult-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="consult-name">Họ và tên *</label>
                  <input
                    id="consult-name"
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="consult-email">Email doanh nghiệp *</label>
                  <input
                    id="consult-email"
                    type="email"
                    required
                    placeholder="recruiter@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label htmlFor="consult-phone">Số điện thoại *</label>
                    <input
                      id="consult-phone"
                      type="tel"
                      required
                      placeholder="0912345678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="consult-company">Tên công ty *</label>
                    <input
                      id="consult-company"
                      type="text"
                      required
                      placeholder="Tên doanh nghiệp"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="consult-need">Nhu cầu tư vấn</label>
                  <select
                    id="consult-need"
                    value={formData.need}
                    onChange={(e) => setFormData({ ...formData, need: e.target.value })}
                  >
                    <option value="Đăng tin tuyển dụng nhanh">Đăng tin tuyển dụng nhanh</option>
                    <option value="Tìm kiếm ứng viên IT / Kỹ thuật">Tìm kiếm ứng viên IT / Kỹ thuật</option>
                    <option value="Tuyển dụng số lượng lớn (Mass Hiring)">Tuyển dụng số lượng lớn (Mass Hiring)</option>
                    <option value="Tư vấn gói tài khoản Doanh nghiệp">Tư vấn gói tài khoản Doanh nghiệp</option>
                  </select>
                </div>

                <button type="submit" className="btn-submit-consult">
                  <FiSend size={16} />
                  <span>Gửi thông tin tư vấn</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

