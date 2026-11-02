import React, { useEffect } from 'react';
import { EmployerLandingHeader } from '../../components/employer/EmployerLandingHeader';
import { EmployerLandingHero } from '../../components/employer/EmployerLandingHero';
import { EmployerLandingStats } from '../../components/employer/EmployerLandingStats';
import { EmployerLandingSolutions } from '../../components/employer/EmployerLandingSolutions';
import { EmployerLandingSteps } from '../../components/employer/EmployerLandingSteps';
import { EmployerLandingBenefits } from '../../components/employer/EmployerLandingBenefits';
import { EmployerLandingCta } from '../../components/employer/EmployerLandingCta';
import { EmployerLandingFooter } from '../../components/employer/EmployerLandingFooter';
import './EmployerLandingPage.css';

/**
 * Trang giới thiệu dịch vụ và giải pháp tuyển dụng dành cho Doanh nghiệp (Employer Landing Page).
 * Tuyến đường: /employer
 */
export const EmployerLandingPage = () => {
  useEffect(() => {
    document.title = 'Giải pháp Tuyển dụng Doanh nghiệp | JobViet';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="employer-landing-wrapper">
      <EmployerLandingHeader />
      <main className="employer-landing-main">
        <EmployerLandingHero />
        <EmployerLandingStats />
        <EmployerLandingSolutions />
        <EmployerLandingSteps />
        <EmployerLandingBenefits />
        <EmployerLandingCta />
      </main>
      <EmployerLandingFooter />
    </div>
  );
};
