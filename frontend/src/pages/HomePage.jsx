import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroHomeSection } from '../components/home/HeroHomeSection';
import { FeaturedJobsHome } from '../components/home/FeaturedJobsHome';
import { FeaturedCompaniesHome } from '../components/home/FeaturedCompaniesHome';
import { HighlightCategoriesHome } from '../components/home/HighlightCategoriesHome';
import { CandidateToolsHome } from '../components/home/CandidateToolsHome';
import { EmployerCtaHome } from '../components/home/EmployerCtaHome';
import './HomePage.css';

/**
 * Trang chủ Ứng viên JobViet (Redesigned)
 * 1. Hero: Tìm kiếm lớn, điều hướng trực tiếp sang trang /viec-lam
 * 2. Việc làm mới đăng hôm nay: Giới hạn 6 tin mới nhất, kèm nút dẫn sang /viec-lam
 * 3. Doanh nghiệp tiêu biểu
 * 4. Ngành nghề nổi bật
 * 5. Công cụ cho ứng viên
 * 6. CTA Nhà tuyển dụng
 */
export const HomePage = () => {
  const navigate = useNavigate();

  const handleHeroSearch = (keyword, location) => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (location) params.set('location', location);
    navigate(`/viec-lam${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className="home-candidate-page">
      {/* Khối Hero: Tìm kiếm chuyển hướng sang trang việc làm */}
      <HeroHomeSection onSearch={handleHeroSearch} />

      {/* Khối Việc làm mới đăng hôm nay (chỉ hiển thị 6 việc làm vừa tạo) */}
      <FeaturedJobsHome />

      {/* Khối Doanh nghiệp tiêu biểu */}
      <FeaturedCompaniesHome />

      {/* Khối Ngành nghề nổi bật */}
      <HighlightCategoriesHome />

      {/* Khối Công cụ cho ứng viên */}
      <CandidateToolsHome />

      {/* Khối CTA Nhà tuyển dụng */}
      <EmployerCtaHome />
    </div>
  );
};
