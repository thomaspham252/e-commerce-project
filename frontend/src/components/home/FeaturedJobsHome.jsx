import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Banknote,
  MapPin,
  Clock,
  Heart,
  ArrowRight,
  Flame,
  Sparkles,
  Briefcase
} from 'lucide-react';
import { CompanyLogo } from '../common/CompanyLogo';
import { useSavedJobs } from '../../context/SavedJobsContext';
import { LOCATION_FILTERS, FEATURED_JOBS } from '../../data/homeCandidateMockData';
import './FeaturedJobsHome.css';

export const FeaturedJobsHome = () => {
  const [activeTab, setActiveTab] = useState('latest'); // 'latest' | 'for_you'
  const [selectedLocation, setSelectedLocation] = useState('all');
  const { toggleSaveJob, isJobSaved } = useSavedJobs();

  // Lọc danh sách việc làm theo Tab và Vị trí địa lý
  const filteredJobs = useMemo(() => {
    return FEATURED_JOBS.filter((job) => {
      // Điều kiện Tab: nếu là 'for_you' thì ưu tiên tabCategory 'for_you', 'latest' thì hiển thị tất cả hoặc latest
      const matchesTab = activeTab === 'latest' ? true : job.tabCategory === 'for_you';
      const matchesLocation =
        selectedLocation === 'all' || job.locationKey === selectedLocation;
      return matchesTab && matchesLocation;
    });
  }, [activeTab, selectedLocation]);

  return (
    <section className="featured-jobs-section" id="featured-jobs-section">
      <div className="container">
        {/* Tiêu đề & Điều hướng Tab */}
        <div className="section-head-row">
          <div>
            <div className="section-pill-tag">
              <Briefcase size={14} strokeWidth={1.75} />
              <span>Cơ hội tuyển dụng</span>
            </div>
            <h2 className="section-main-title">Việc làm nổi bật</h2>
          </div>

          <div className="section-tab-group" role="tablist" aria-label="Bộ lọc việc làm">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'latest'}
              className={`section-tab-btn ${activeTab === 'latest' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('latest')}
            >
              Mới nhất
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'for_you'}
              className={`section-tab-btn ${activeTab === 'for_you' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('for_you')}
            >
              Phù hợp với bạn
            </button>
          </div>
        </div>

        {/* Thanh lọc nhanh theo địa điểm */}
        <div className="location-filter-bar">
          <span className="location-filter-label">Địa điểm:</span>
          <div className="location-chips-wrapper">
            {LOCATION_FILTERS.map((loc) => (
              <button
                key={loc.id}
                type="button"
                className={`location-chip-btn ${selectedLocation === loc.id ? 'is-selected' : ''}`}
                onClick={() => setSelectedLocation(loc.id)}
              >
                {loc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lưới thẻ việc làm (2 - 3 cột) */}
        {filteredJobs.length === 0 ? (
          <div className="empty-jobs-notice">
            <p>Không có việc làm nào phù hợp với bộ lọc đã chọn.</p>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setActiveTab('latest');
                setSelectedLocation('all');
              }}
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div className="jobs-cards-grid">
            {filteredJobs.map((job) => {
              const saved = isJobSaved(job.id);
              return (
                <article key={job.id} className="home-job-card">
                  {/* Header thẻ: Logo + Chức danh + Nút lưu */}
                  <div className="job-card-top">
                    <CompanyLogo
                      companyName={job.companyName}
                      initials={job.initials}
                      logoUrl={job.logoUrl}
                      size={48}
                      className="job-card-logo"
                    />

                    <div className="job-card-title-box">
                      <Link to={`/viec-lam/${job.id}`} className="job-card-title-link">
                        <h3 className="job-card-title" title={job.title}>
                          {job.title}
                        </h3>
                      </Link>
                      <p className="job-card-company">{job.companyName}</p>
                    </div>

                    <button
                      type="button"
                      className={`job-card-save-btn ${saved ? 'is-saved' : ''}`}
                      onClick={() => toggleSaveJob(job.id)}
                      title={saved ? 'Bỏ lưu việc làm' : 'Lưu việc làm'}
                      aria-label={saved ? 'Bỏ lưu việc làm' : 'Lưu việc làm'}
                    >
                      <Heart
                        size={18}
                        strokeWidth={1.75}
                        className={saved ? 'heart-fill' : ''}
                      />
                    </button>
                  </div>

                  {/* Badges / Thẻ phụ */}
                  <div className="job-card-meta-tags">
                    {job.badgeType === 'hot' && (
                      <span className="card-badge badge-danger">
                        <Flame size={12} strokeWidth={1.75} />
                        <span>{job.badgeText || 'Hot'}</span>
                      </span>
                    )}
                    {job.badgeType === 'new' && (
                      <span className="card-badge badge-warning">
                        <Sparkles size={12} strokeWidth={1.75} />
                        <span>{job.badgeText || 'Mới'}</span>
                      </span>
                    )}
                    <span className="card-badge badge-neutral">Toàn thời gian</span>
                  </div>

                  {/* Lương + Địa điểm */}
                  <div className="job-card-attributes">
                    <div className="attribute-item salary-attribute">
                      <Banknote size={15} strokeWidth={1.75} className="attribute-icon" />
                      <span className="attribute-text">{job.salary}</span>
                    </div>

                    <div className="attribute-item location-attribute">
                      <MapPin size={15} strokeWidth={1.75} className="attribute-icon" />
                      <span className="attribute-text">{job.location}</span>
                    </div>
                  </div>

                  {/* Footer thẻ: Thời gian đăng + Nút ứng tuyển */}
                  <div className="job-card-footer">
                    <div className="job-post-time">
                      <Clock size={14} strokeWidth={1.75} />
                      <span>{job.timeAgo}</span>
                    </div>

                    <Link
                      to={`/viec-lam/${job.id}/ung-tuyen`}
                      className="job-apply-link-btn"
                    >
                      <span>Ứng tuyển</span>
                      <ArrowRight size={14} strokeWidth={1.75} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
