import React from 'react';
import { FiUserPlus, FiShield, FiSend, FiAward } from 'react-icons/fi';
import { Link } from 'react-router-dom';

/**
 * Quy trình 4 bước bắt đầu tuyển dụng cùng JobViet.
 */
export const EmployerLandingSteps = () => {
  const steps = [
    {
      stepNumber: '01',
      icon: <FiUserPlus size={22} />,
      title: 'Đăng ký tài khoản doanh nghiệp',
      desc: 'Điền thông tin liên hệ và hồ sơ công ty cơ bản chỉ trong 1 phút, xác thực email qua mã OTP 6 chữ số an toàn.'
    },
    {
      stepNumber: '02',
      icon: <FiShield size={22} />,
      title: 'Xác minh hồ sơ & Thương hiệu',
      desc: 'Hoàn thiện thông tin pháp lý hoặc cập nhật hồ sơ để Ban quản trị xét duyệt, nâng cao độ uy tín với ứng viên.'
    },
    {
      stepNumber: '03',
      icon: <FiSend size={22} />,
      title: 'Đăng tin tuyển dụng vị trí',
      desc: 'Mô tả vị trí công việc, đãi ngộ và kỹ năng cần thiết. Tin tuyển dụng được tối ưu để tiếp cận ứng viên tiềm năng.'
    },
    {
      stepNumber: '04',
      icon: <FiAward size={22} />,
      title: 'Tiếp nhận hồ sơ & Phỏng vấn',
      desc: 'Xem CV trực quan, chat trực tiếp với ứng viên, sắp xếp lịch hẹn phỏng vấn và hoàn tất tuyển dụng nhanh chóng.'
    }
  ];

  return (
    <section id="quy-trinh" className="employer-steps-section">
      <div className="employer-landing-container">
        <div className="section-header-center">
          <span className="section-tag">QUY TRÌNH TINH GỌN</span>
          <h2 className="section-title">Bắt đầu tuyển dụng với 4 bước đơn giản</h2>
          <p className="section-subtitle">
            Hệ thống được thiết kế tối ưu để doanh nghiệp có thể đăng tin và tiếp nhận những ứng viên đầu tiên trong ngày.
          </p>
        </div>

        <div className="steps-timeline-grid">
          {steps.map((item, index) => (
            <div key={index} className="step-card">
              <div className="step-number-pill">{item.stepNumber}</div>
              <div className="step-icon-circle">{item.icon}</div>
              <h3 className="step-card-title">{item.title}</h3>
              <p className="step-card-desc">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="steps-action-center">
          <Link to="/employer/register" className="btn-steps-cta">
            Bắt đầu tạo tài khoản tuyển dụng ngay
          </Link>
        </div>
      </div>
    </section>
  );
};
