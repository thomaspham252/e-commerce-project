import React from 'react';
import { HeroHomeSection } from '../components/home/HeroHomeSection';
import { FeaturedJobsHome } from '../components/home/FeaturedJobsHome';
import { FeaturedCompaniesHome } from '../components/home/FeaturedCompaniesHome';
import { HighlightCategoriesHome } from '../components/home/HighlightCategoriesHome';
import { CandidateToolsHome } from '../components/home/CandidateToolsHome';
import { EmployerCtaHome } from '../components/home/EmployerCtaHome';
import './HomePage.css';

/**
 * Trang chủ Ứng viên JobViet (Redesigned)
 * Tái cấu trúc chuẩn mực theo luồng thông tin cổng tuyển dụng hiện đại:
 * 1. Header (được bao bọc bởi MainLayout)
 * 2. Hero: Nền emerald đậm, search lớn trắng, số liệu tích hợp, cụm 2 cột nổi đè mép dưới
 * 3. Việc làm nổi bật: 2 tabs (Mới nhất / Phù hợp), lọc nhanh địa điểm, lưới 2-3 cột
 * 4. Công ty tiêu biểu: Tabs theo ngành, thẻ avatar công ty
 * 5. Ngành nghề nổi bật: Lưới 8 mục với icon Lucide
 * 6. Công cụ cho ứng viên: 3 thẻ giải pháp (Tạo CV, Gợi ý việc làm, Mức lương)
 * 7. CTA cho nhà tuyển dụng: Đăng tin và kết nối ứng viên
 * 8. Footer nhiều cột (được bao bọc bởi MainLayout)
 */
export const HomePage = () => {
  const handleHeroSearch = (_keyword, _location) => {
    // Cuộn mượt xuống khối việc làm nổi bật khi tìm kiếm
    const target = document.getElementById('featured-jobs-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-candidate-page">
      {/* Khối 2: Hero (kèm cụm nổi Danh mục + Banner Career Boost) */}
      <HeroHomeSection onSearch={handleHeroSearch} />

      {/* Khối 3: Việc làm nổi bật */}
      <FeaturedJobsHome />

      {/* Khối 4: Doanh nghiệp tiêu biểu */}
      <FeaturedCompaniesHome />

      {/* Khối 5: Ngành nghề nổi bật */}
      <HighlightCategoriesHome />

      {/* Khối 6: Công cụ cho ứng viên */}
      <CandidateToolsHome />

      {/* Khối 7: CTA Nhà tuyển dụng */}
      <EmployerCtaHome />
    </div>
  );
};
