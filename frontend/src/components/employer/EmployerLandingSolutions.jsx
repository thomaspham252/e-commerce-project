import React from 'react';
import { FiFileText, FiFilter, FiMessageSquare, FiBarChart2, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

/**
 * Phân khu 4 giải pháp tuyển dụng cốt lõi của JobViet.
 */
export const EmployerLandingSolutions = () => {
  const solutions = [
    {
      icon: <FiFileText size={24} />,
      title: 'Đăng tin tuyển dụng đa kênh',
      desc: 'Tạo và quản lý tin tuyển dụng với giao diện trực quan, tự động tối ưu hiển thị trên các công cụ tìm kiếm và danh mục việc làm.',
      badge: 'Phổ biến nhất'
    },
    {
      icon: <FiFilter size={24} />,
      title: 'Quản lý & Sàng lọc hồ sơ (ATS)',
      desc: 'Quy trình tiếp nhận hồ sơ tập trung theo trạng thái rõ ràng: Đã ứng tuyển, Đã xem, Phỏng vấn, Trúng tuyển. Tránh thất lạc hồ sơ.',
      badge: 'Hiệu quả cao'
    },
    {
      icon: <FiMessageSquare size={24} />,
      title: 'Trò chuyện & Phỏng vấn trực tiếp',
      desc: 'Tính năng gửi tin nhắn tức thời giữa nhà tuyển dụng và ứng viên, đặt lịch phỏng vấn và gửi phản hồi không cần qua trung gian.',
      badge: 'Nhanh chóng'
    },
    {
      icon: <FiBarChart2 size={24} />,
      title: 'Báo cáo & Đo lường hiệu quả',
      desc: 'Giám sát chi tiết số lượt xem tin, lượt nộp hồ sơ, tốc độ phản hồi và tỷ lệ chuyển đổi qua các biểu đồ trực quan.',
      badge: 'Dữ liệu thời gian thực'
    }
  ];

  return (
    <section id="giai-phap" className="employer-solutions-section">
      <div className="employer-landing-container">
        <div className="section-header-center">
          <span className="section-tag">GIẢI PHÁP TOÀN DIỆN</span>
          <h2 className="section-title">Hệ sinh thái tuyển dụng chuyên biệt cho doanh nghiệp</h2>
          <p className="section-subtitle">
            Cung cấp đầy đủ công cụ từ khâu đăng tin, sàng lọc ứng viên đến quản trị tiến độ tuyển dụng trong một nền tảng duy nhất.
          </p>
        </div>

        <div className="solutions-grid">
          {solutions.map((item, index) => (
            <div key={index} className="solution-card">
              <div className="solution-badge">{item.badge}</div>
              <div className="solution-icon-box">{item.icon}</div>
              <h3 className="solution-card-title">{item.title}</h3>
              <p className="solution-card-desc">{item.desc}</p>
              <div className="solution-card-footer">
                <Link to="/employer/register" className="solution-learn-more">
                  <span>Trải nghiệm ngay</span>
                  <FiArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

