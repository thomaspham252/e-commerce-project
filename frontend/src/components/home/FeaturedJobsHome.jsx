import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Banknote,
  MapPin,
  Clock,
  Heart,
  ArrowRight,
  Flame,
  Sparkles,
  Briefcase,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { CompanyLogo } from '../common/CompanyLogo';
import { useSavedJobs } from '../../context/SavedJobsContext';
import { jobService } from '../../services/jobService';
import './FeaturedJobsHome.css';

/**
 * Khối Việc làm mới nhất trên Trang chủ:
 * Chỉ hiển thị 6 công việc mới vừa tạo, tạo ấn tượng ban đầu cho người dùng,
 * kèm nút điều hướng đến trang "Tất cả việc làm" (/viec-lam).
 */
export const FeaturedJobsHome = () => {
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toggleSaveJob, isJobSaved } = useSavedJobs();

  useEffect(() => {
    let active = true;

    const loadLatestJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const paged = await jobService.getJobsPaged({ sort: 'latest', page: 0, size: 6 });
        if (!active) return;
        setJobs(paged.content);
        setTotalJobs(paged.totalElements);
      } catch (err) {
        console.error('Lỗi khi tải việc làm mới nhất:', err);
        if (active) setError('Không thể tải việc làm mới nhất.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadLatestJobs();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="featured-jobs-section" id="featured-jobs-section">
      <div className="container">
        {/* Tiêu đề & Nút dẫn sang trang Việc làm */}
        <div className="section-head-row">
          <div>
            <div className="section-pill-tag">
              <Sparkles size={14} strokeWidth={1.75} />
              <span>Cập nhật liên tục</span>
            </div>
            <h2 className="section-main-title">Việc làm mới đăng hôm nay</h2>
            <p className="section-sub-title">
              Khám phá các vị trí tuyển dụng vừa được các doanh nghiệp đăng tuyển gần đây
            </p>
          </div>

          <Link to="/viec-lam" className="home-view-all-link">
            <span>Xem tất cả {totalJobs > 0 ? `${totalJobs} ` : ''}việc làm</span>
            <ArrowRight size={16} strokeWidth={2} />
          </Link>
        </div>

        {/* Trạng thái Loading */}
        {loading ? (
          <div className="jobs-loading-state">
            <Loader2 size={32} className="jobs-spinner" />
            <p>Đang cập nhật việc làm mới nhất từ máy chủ...</p>
          </div>
        ) : error ? (
          <div className="empty-jobs-notice">
            <AlertCircle size={32} color="#EF4444" />
            <p>{error}</p>
            <Link to="/viec-lam" className="btn btn-primary">
              Xem trang việc làm
            </Link>
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty-jobs-notice">
            <p>Hiện chưa có công việc mới nào được tạo.</p>
            <Link to="/viec-lam" className="btn btn-primary">
              Khám phá tất cả việc làm
            </Link>
          </div>
        ) : (
          <>
            <div className="jobs-cards-grid">
              {jobs.map((job) => {
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
                      {job.isHot ? (
                        <span className="card-badge badge-danger">
                          <Flame size={12} strokeWidth={1.75} />
                          <span>Hot</span>
                        </span>
                      ) : (
                        <span className="card-badge badge-warning">
                          <Sparkles size={12} strokeWidth={1.75} />
                          <span>Mới</span>
                        </span>
                      )}
                      <span className="card-badge badge-neutral">{job.jobType || 'Toàn thời gian'}</span>
                      {job.level && <span className="card-badge badge-neutral">{job.level}</span>}
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

                    {/* Footer thẻ: Thời gian đăng + Nút xem chi tiết */}
                    <div className="job-card-footer">
                      <div className="job-post-time">
                        <Clock size={14} strokeWidth={1.75} />
                        <span>{job.timeAgo}</span>
                      </div>

                      <Link
                        to={`/viec-lam/${job.id}`}
                        className="job-apply-link-btn"
                      >
                        <span>Chi tiết</span>
                        <ArrowRight size={14} strokeWidth={1.75} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Banner kêu gọi xem tất cả việc làm ở chân khối */}
            <div className="home-jobs-cta-box">
              <div className="cta-box-text">
                <h4>Vẫn chưa tìm thấy vị trí phù hợp với bạn?</h4>
                <p>Khám phá toàn bộ danh sách việc làm với đầy đủ bộ lọc ngành nghề, mức lương và địa điểm.</p>
              </div>
              <Link to="/viec-lam" className="cta-box-button">
                <span>Xem tất cả việc làm</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
