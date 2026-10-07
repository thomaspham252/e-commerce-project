import './CompanyCard.css';
import { useState } from 'react';

export const CompanyCard = ({ company }) => {
  const [imageError, setImageError] = useState(false);

  const fallbackLogo = "/images/companies/default.svg";

  return (
    <div className="company-card">
      <img 
        src={imageError ? fallbackLogo : company.logoUrl} 
        alt="Company Logo" 
        className="company-card-logo" 
        onError={() => setImageError(true)}
      />
    </div>
  );
};
