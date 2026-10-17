import React from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import './EmployerCtaHome.css';

export const EmployerCtaHome = () => {
  return (
    <section className="employer-cta-section" id="employer-cta-section">
      <div className="container">
        <div className="employer-cta-card">
          {/* Họa tiết hình học nền */}
          <div className="cta-bg-geometry">
            <div className="geo-radial-blob blob-left" />
            <div className="geo-radial-blob blob-right" />
          </div>

          <div className="employer-cta-content">
            <div className="employer-cta-badge">
              <UserCheck size={14} strokeWidth={1.75} />
              <span>Dành cho Nhà tuyển dụng</span>
            </div>

            <h2 className="employer-cta-title">
              Doanh nghiệp của bạn đang tìm kiếm nhân tài phù hợp?
            </h2>

            <p className="employer-cta-desc">
              Tiếp cận mạng lưới hơn 350.000+ ứng viên tiềm năng trên toàn quốc. Đăng tin tức thì, quản lý hồ sơ tập trung và tối ưu hóa chi phí tuyển dụng cùng JobViet for Work.
            </p>

            <div className="employer-cta-benefits">
              <div className="benefit-badge-item">
                <Zap size={15} strokeWidth={1.75} className="benefit-icon" />
                <span>Tiết kiệm 50% thời gian sàng lọc hồ sơ</span>
              </div>
              <div className="benefit-badge-item">
                <ShieldCheck size={15} strokeWidth={1.75} className="benefit-icon" />
                <span>Hồ sơ ứng viên xác thực và cập nhật mới</span>
              </div>
            </div>

            <div className="employer-cta-actions">
              <Link to="/employer/jobs/create" className="btn-cta-primary">
                <span>Đăng tin tuyển dụng ngay</span>
                <ArrowRight size={16} strokeWidth={1.75} />
              </Link>
              <Link to="/employer" className="btn-cta-secondary">
                Khám phá giải pháp cho NTD
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
