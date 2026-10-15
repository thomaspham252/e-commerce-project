import React from 'react';
import './CompanyCard.css';
import { CompanyLogo } from './CompanyLogo';

/**
 * Thẻ Doanh nghiệp / Nhà tuyển dụng hàng đầu
 * Sử dụng CompanyLogo với avatar chữ viết tắt trên nền trung tính
 * Sẵn sàng nhận ảnh logo thật qua prop logoUrl
 */
export const CompanyCard = ({ company }) => {
  return (
    <div className="company-card" title={company.name || 'Nhà tuyển dụng uy tín'}>
      <CompanyLogo
        companyName={company.name}
        initials={company.initials}
        logoUrl={company.logoUrl}
        size={52}
        className="company-card-logo-box"
      />
      {company.name && (
        <span className="company-card-name">{company.name}</span>
      )}
    </div>
  );
};
