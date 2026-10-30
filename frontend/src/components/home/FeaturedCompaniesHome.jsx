import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Briefcase, MapPin, ArrowRight } from 'lucide-react';
import { CompanyLogo } from '../common/CompanyLogo';
import { COMPANY_SECTORS, FEATURED_COMPANIES } from '../../data/homeCandidateMockData';
import './FeaturedCompaniesHome.css';

export const FeaturedCompaniesHome = () => {
  const [selectedSector, setSelectedSector] = useState('all');

  const filteredCompanies = useMemo(() => {
    if (selectedSector === 'all') return FEATURED_COMPANIES;
    return FEATURED_COMPANIES.filter((comp) => comp.sectorKey === selectedSector);
  }, [selectedSector]);

  return (
    <section className="featured-companies-section" id="companies-section">
      <div className="container">
        {/* Section Header */}
        <div className="companies-header-row">
          <div>
            <div className="companies-pill-tag">
              <Building2 size={14} strokeWidth={1.75} />
              <span>Đối tác tuyển dụng</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <h2 className="companies-main-title">Doanh nghiệp tiêu biểu</h2>
              <Link to="/cong-ty" style={{ color: 'var(--color-primary, #10B981)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Xem tất cả công ty</span>
                <ArrowRight size={15} />
              </Link>
            </div>
            <p className="companies-sub-title">
              Khám phá các tổ chức hàng đầu đang tích cực tìm kiếm nhân tài trên JobViet
            </p>
          </div>
        </div>

        {/* Tab Lọc theo ngành */}
        <div className="company-sectors-nav" role="tablist" aria-label="Lọc công ty theo ngành">
          {COMPANY_SECTORS.map((sector) => (
            <button
              key={sector.id}
              type="button"
              role="tab"
              aria-selected={selectedSector === sector.id}
              className={`company-sector-tab ${selectedSector === sector.id ? 'is-active' : ''}`}
              onClick={() => setSelectedSector(sector.id)}
            >
              {sector.label}
            </button>
          ))}
        </div>

        {/* Grid thẻ công ty (4 cột desktop, 2 tablet, 1 mobile) */}
        <div className="companies-grid">
          {filteredCompanies.map((company) => (
            <Link key={company.id} to={/cong-ty/} className="company-feature-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="company-card-top-cluster">
                <CompanyLogo
                  companyName={company.name}
                  initials={company.initials}
                  logoUrl={company.logoUrl}
                  size={54}
                  className="company-feature-logo"
                />
                <div className="company-open-badge">
                  <Briefcase size={12} strokeWidth={1.75} />
                  <span>{company.openJobsCount} việc</span>
                </div>
              </div>

              <div className="company-card-main-info">
                <h3 className="company-feature-name" title={company.name}>
                  {company.name}
                </h3>
                <span className="company-feature-sector">{company.sectorName}</span>
              </div>

              <div className="company-card-foot-cluster">
                <div className="company-feature-loc">
                  <MapPin size={13} strokeWidth={1.75} />
                  <span>{company.location}</span>
                </div>
                <div className="company-feature-view-link">
                  <span>Xem việc</span>
                  <ArrowRight size={13} strokeWidth={1.75} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
