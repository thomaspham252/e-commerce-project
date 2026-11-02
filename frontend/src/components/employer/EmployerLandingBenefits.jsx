import React from 'react';
import { FiDollarSign, FiTarget, FiLock, FiHeadphones } from 'react-icons/fi';

/**
 * Khối Lợi ích dành cho doanh nghiệp khi lựa chọn nền tảng JobViet.
 */
export const EmployerLandingBenefits = () => {
  const benefits = [
    {
      icon: <FiDollarSign size={24} />,
      title: 'Tối ưu ngân sách & Minh bạch chi phí',
      desc: 'Bảng giá dịch vụ rõ ràng, mô hình gói đăng tin linh hoạt phù hợp cho cả doanh nghiệp khởi nghiệp lẫn tập đoàn lớn.'
    },
    {
      icon: <FiTarget size={24} />,
      title: 'Tiếp cận ứng viên chuẩn xác',
      desc: 'Hệ thống gợi ý ứng viên dựa trên kỹ năng, địa điểm và kinh nghiệm thực tế, giúp tỷ lệ phỏng vấn thành công tăng vượt trội.'
    },
    {
      icon: <FiLock size={24} />,
      title: 'An toàn dữ liệu & Chống tin ảo',
      desc: 'Mọi doanh nghiệp và ứng viên đều qua quy trình xác minh chặt chẽ, tạo dựng môi trường tuyển dụng minh bạch, chuyên nghiệp.'
    },
    {
      icon: <FiHeadphones size={24} />,
      title: 'Đồng hành & Hỗ trợ chuyên nghiệp',
      desc: 'Đội ngũ chuyên viên tuyển dụng JobViet luôn sẵn sàng hỗ trợ doanh nghiệp đăng tin, tối ưu nội dung và giải đáp vướng mắc.'
    }
  ];

  return (
    <section id="loi-ich" className="employer-benefits-section">
      <div className="employer-landing-container">
        <div className="benefits-layout-wrapper">
          <div className="benefits-left-banner">
            <span className="benefits-tag">VÌ SAO CHỌN JOBVIET</span>
            <h2 className="benefits-main-title">
              Giải pháp tuyển dụng đáng tin cậy cho mọi quy mô doanh nghiệp
            </h2>
            <p className="benefits-main-desc">
              Chúng tôi không chỉ là một trang đăng tin việc làm, mà là đối tác đồng hành giúp doanh nghiệp
              xây dựng đội ngũ nhân sự vững mạnh, sẵn sàng cho những mục tiêu bứt phá.
            </p>
            <div className="benefits-quote-card">
              <p className="quote-text">
                "Quy trình tuyển dụng tại JobViet trực quan, giúp chúng tôi tìm được 4 kỹ sư lập trình phù hợp chỉ sau chưa đầy 2 tuần."
              </p>
              <div className="quote-author">
                <strong>Tech Lead Doanh nghiệp Đối tác</strong>
                <span>Khối Công nghệ & Sản phẩm</span>
              </div>
            </div>
          </div>

          <div className="benefits-right-grid">
            {benefits.map((item, index) => (
              <div key={index} className="benefit-card">
                <div className="benefit-icon-box">{item.icon}</div>
                <h3 className="benefit-card-title">{item.title}</h3>
                <p className="benefit-card-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

