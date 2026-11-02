import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Briefcase, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { CompanyLogo } from '../common/CompanyLogo';
import { companyService } from '../../services/companyService';
import { COMPANY_SECTORS } from '../../data/homeConstants';
import './FeaturedCompaniesHome.css';

export const FeaturedCompaniesHome = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState('all');

  useEffect(() => {
    let active = true;
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const res = await companyService.getCompaniesPaged({ page: 0, size: 8 });
        if (active) {
          setCompanies(res.content || []);
        }
      } catch (err) {
        console.warn('Lỗi khi tải doanh nghiệp:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchCompanies();
    return () => {
      active = false;
    };
  }, []);

  const filteredCompanies = useMemo(() => {
    if (selectedSector === 'all') return companies;
    return companies.filter((comp) => {
      const ind = (comp.industry || '').toLowerCase();
      if (selectedSector === 'it') return ind.includes('công nghệ') || ind.includes('it') || ind.includes('phần mềm');
      if (selectedSector === 'finance') return ind.includes('tài chính') || ind.includes('ngân hàng');
      if (selectedSector === 'retail') return ind.includes('thương mại') || ind.includes('bán lẻ') || ind.includes('tiêu dùng');
      if (selectedSector === 'logistics') return ind.includes('vận tải') || ind.includes('logistics');
      return true;
    });
  }, [selectedSector, companies]);

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

        {/* Loading state */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0', color: 'var(--color-text-muted, #6B7280)' }}>
            <Loader2 size={28} className="jobs-spinner" />
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted, #6B7280)' }}>
            <p>Hiện chưa có doanh nghiệp nào phù hợp với bộ lọc.</p>
            <Link to="/cong-ty" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '12px' }}>
              Khám phá tất cả doanh nghiệp
            </Link>
          </div>
        ) : (
          /* Grid thẻ công ty (4 cột desktop, 2 tablet, 1 mobile) */
          <div className="companies-grid">
            {filteredCompanies.map((company) => (
              <Link key={company.id} to={`/cong-ty/${company.id}`} className="company-feature-card" style={{ textDecoration: 'none', color: 'inherit' }}>
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
                  <span className="company-feature-sector">{company.industry}</span>
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
        )}
      </div>
    </section>
  );
};
