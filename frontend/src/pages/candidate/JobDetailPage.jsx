import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  Briefcase,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  Gift,
  Globe,
  Heart,
  MapPin,
  Send,
  Share2,
  TrendingUp,
  Users,
  Wallet
} from 'lucide-react';
import { JobCard } from '../../components/JobCard';
import { useSavedJobs } from '../../context/SavedJobsContext';
import { useApplications } from '../../context/ApplicationsContext';
import { jobService } from '../../services/jobService';
import { formatSalary } from '../../utils/formatSalary';
import './CandidateShared.css';
import './JobDetailPage.css';

export const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleSaveJob, isJobSaved } = useSavedJobs();
  const { hasApplied } = useApplications();

  const [job, setJob] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;

    const loadJob = async () => {
      setLoading(true);
      setLogoError(false);
      try {
        const [detail, related] = await Promise.all([
          jobService.getJobById(id),
          jobService.getRelatedJobs(id)
        ]);
        if (!active) return;
        setJob(detail);
        setRelatedJobs(related);
      } catch (err) {
        console.error('Không tải được chi tiết tin tuyển dụng', err);
        if (active) setJob(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadJob();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      active = false;
    };
  }, [id]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (loading) {
    return (
      <div className="cd-page">
        <div className="container">
          <div className="cd-state">
            <div className="cd-state-icon">
              <Clock size={30} />
            </div>
            <h3>Đang tải tin tuyển dụng...</h3>
            <p>Vui lòng chờ trong giây lát.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="cd-page">
        <div className="container">
          <div className="cd-state cd-state-error">
            <div className="cd-state-icon">
              <AlertCircle size={30} />
            </div>
            <h3>Không tìm thấy tin tuyển dụng</h3>
            <p>Tin này có thể đã được gỡ hoặc đường dẫn không chính xác.</p>
            <Link to="/" className="btn btn-primary">
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const saved = isJobSaved(job.id);
  const applied = hasApplied(job.id);
  const fallbackLogo = '/images/companies/default.svg';

  return (
    <div className="cd-page job-detail-page">
      <div className="container">
        <nav className="cd-breadcrumb" aria-label="Đường dẫn">
          <Link to="/">Trang chủ</Link>
          <ChevronRight size={14} />
          <Link to="/">Việc làm</Link>
          <ChevronRight size={14} />
          <span className="cd-breadcrumb-current">{job.title}</span>
        </nav>

        {/* Thẻ tiêu đề: tên vị trí, công ty, lương, địa điểm và hai nút hành động */}
        <section className="jd-hero">
          <div className="jd-hero-main">
            <div className="jd-logo">
              <img
                src={logoError ? fallbackLogo : job.companyLogo}
                alt={job.companyName}
                onError={() => setLogoError(true)}
              />
            </div>
            <div className="jd-hero-info">
              <div className="jd-badges">
                {job.isHot && <span className="badge badge-hot">🔥 Tin hot</span>}
                {job.isNew && <span className="badge badge-orange">✨ Mới</span>}
                <span className="badge badge-green">{job.jobType}</span>
              </div>
              <h1 className="jd-title">{job.title}</h1>
              <Link to="/" className="jd-company-name">
                <Building2 size={16} />
                {job.companyName}
              </Link>

              <div className="jd-highlights">
                <div className="jd-highlight">
                  <Wallet size={18} />
                  <div>
                    <span className="cd-meta-label">Mức lương</span>
                    <strong className="jd-highlight-salary">{formatSalary(job.salary)}</strong>
                  </div>
                </div>
                <div className="jd-highlight">
                  <MapPin size={18} />
                  <div>
                    <span className="cd-meta-label">Địa điểm</span>
                    <strong>{job.location}</strong>
                  </div>
                </div>
                <div className="jd-highlight">
                  <Briefcase size={18} />
                  <div>
                    <span className="cd-meta-label">Kinh nghiệm</span>
                    <strong>{job.experience}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="jd-hero-actions">
            {applied ? (
              <button className="btn jd-applied-btn" type="button" disabled>
                <CheckCircle2 size={18} />
                Đã ứng tuyển
              </button>
            ) : (
              <button
                className="btn btn-primary jd-apply-btn"
                type="button"
                onClick={() => navigate(`/viec-lam/${job.id}/ung-tuyen`)}
              >
                <Send size={18} />
                Ứng tuyển ngay
              </button>
            )}

            <button
              className={`btn jd-save-btn ${saved ? 'is-saved' : ''}`}
              type="button"
              onClick={() => toggleSaveJob(job.id)}
              aria-pressed={saved}
            >
              <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
              {saved ? 'Đã lưu tin' : 'Lưu tin'}
            </button>

            <button className="jd-share-btn" type="button" onClick={handleShare}>
              <Share2 size={15} />
              {copied ? 'Đã copy liên kết' : 'Chia sẻ tin này'}
            </button>

            <p className="jd-deadline">
              <CalendarClock size={14} />
              Hạn nộp hồ sơ: <strong>{job.deadline}</strong>
            </p>
          </div>
        </section>

        <div className="jd-layout">
          {/* Cột trái: nội dung tin */}
          <div className="jd-content">
            <section className="cd-card">
              <h2 className="cd-section-title">
                <Briefcase size={20} />
                Mô tả công việc
              </h2>
              <ul className="cd-list">
                {job.description.map((line, index) => (
                  <li key={index}>
                    <CheckCircle2 size={17} />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="cd-card">
              <h2 className="cd-section-title">
                <TrendingUp size={20} />
                Yêu cầu ứng viên
              </h2>
              <ul className="cd-list">
                {job.requirements.map((line, index) => (
                  <li key={index}>
                    <CheckCircle2 size={17} />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <div className="jd-skills">
                <span className="cd-meta-label">Kỹ năng yêu cầu</span>
                <div className="cd-chip-row">
                  {job.skills.map(skill => (
                    <span key={skill} className="cd-chip">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="cd-card">
              <h2 className="cd-section-title">
                <Gift size={20} />
                Quyền lợi được hưởng
              </h2>
              <ul className="cd-list">
                {job.benefits.map((line, index) => (
                  <li key={index}>
                    <CheckCircle2 size={17} />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="cd-card">
              <h2 className="cd-section-title">
                <CalendarClock size={20} />
                Thông tin chung
              </h2>
              <div className="cd-meta-grid">
                <div className="cd-meta-item">
                  <div className="cd-meta-icon">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <span className="cd-meta-label">Cấp bậc</span>
                    <span className="cd-meta-value">{job.level}</span>
                  </div>
                </div>
                <div className="cd-meta-item">
                  <div className="cd-meta-icon">
                    <Users size={18} />
                  </div>
                  <div>
                    <span className="cd-meta-label">Số lượng tuyển</span>
                    <span className="cd-meta-value">{job.quantity} người</span>
                  </div>
                </div>
                <div className="cd-meta-item">
                  <div className="cd-meta-icon">
                    <Clock size={18} />
                  </div>
                  <div>
                    <span className="cd-meta-label">Hình thức</span>
                    <span className="cd-meta-value">{job.jobType}</span>
                  </div>
                </div>
                <div className="cd-meta-item">
                  <div className="cd-meta-icon">
                    <CalendarClock size={18} />
                  </div>
                  <div>
                    <span className="cd-meta-label">Ngày đăng</span>
                    <span className="cd-meta-value">{job.postedDate}</span>
                  </div>
                </div>
                <div className="cd-meta-item">
                  <div className="cd-meta-icon">
                    <Eye size={18} />
                  </div>
                  <div>
                    <span className="cd-meta-label">Lượt xem</span>
                    <span className="cd-meta-value">{job.views.toLocaleString('vi-VN')}</span>
                  </div>
                </div>
                <div className="cd-meta-item">
                  <div className="cd-meta-icon">
                    <Send size={18} />
                  </div>
                  <div>
                    <span className="cd-meta-label">Đã ứng tuyển</span>
                    <span className="cd-meta-value">{job.applicants} hồ sơ</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Cột phải: thông tin công ty */}
          <aside className="jd-sidebar">
            <section className="cd-card jd-company-card">
              <div className="jd-company-head">
                <div className="jd-company-logo">
                  <img
                    src={logoError ? fallbackLogo : job.company.logo}
                    alt={job.company.name}
                    onError={() => setLogoError(true)}
                  />
                </div>
                <h2>{job.company.name}</h2>
                <span className="jd-company-industry">{job.company.industry}</span>
              </div>

              <p className="jd-company-desc">{job.company.description}</p>

              <ul className="jd-company-facts">
                <li>
                  <Users size={16} />
                  <div>
                    <span className="cd-meta-label">Quy mô</span>
                    <span className="cd-meta-value">{job.company.size}</span>
                  </div>
                </li>
                <li>
                  <CalendarClock size={16} />
                  <div>
                    <span className="cd-meta-label">Thành lập</span>
                    <span className="cd-meta-value">{job.company.founded}</span>
                  </div>
                </li>
                <li>
                  <Globe size={16} />
                  <div>
                    <span className="cd-meta-label">Website</span>
                    <span className="cd-meta-value">{job.company.website}</span>
                  </div>
                </li>
                <li>
                  <MapPin size={16} />
                  <div>
                    <span className="cd-meta-label">Địa chỉ</span>
                    <span className="cd-meta-value">{job.company.address}</span>
                  </div>
                </li>
              </ul>

              <Link to="/" className="cd-btn-ghost jd-company-link">
                <Building2 size={16} />
                Xem trang công ty
              </Link>
            </section>

            <section className="cd-card jd-cta-card">
              <h3>Quan tâm tới vị trí này?</h3>
              <p>Nộp hồ sơ sớm giúp bạn nổi bật hơn trước nhà tuyển dụng.</p>
              {applied ? (
                <Link to="/lich-su-ung-tuyen" className="btn btn-primary jd-cta-btn">
                  Xem lịch sử ứng tuyển
                </Link>
              ) : (
                <Link to={`/viec-lam/${job.id}/ung-tuyen`} className="btn btn-primary jd-cta-btn">
                  <Send size={17} />
                  Ứng tuyển ngay
                </Link>
              )}
              <button
                className={`cd-btn-ghost jd-cta-save ${saved ? 'is-saved' : ''}`}
                type="button"
                onClick={() => toggleSaveJob(job.id)}
              >
                <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
                {saved ? 'Bỏ lưu tin' : 'Lưu để xem sau'}
              </button>
            </section>
          </aside>
        </div>

        {/* Tin liên quan */}
        {relatedJobs.length > 0 && (
          <section className="jd-related">
            <div className="section-header">
              <h2 className="section-title">Việc làm tương tự</h2>
              <Link to="/" className="view-all">
                Xem tất cả &rarr;
              </Link>
            </div>
            <div className="job-list-grid">
              {relatedJobs.map(item => (
                <JobCard key={item.id} job={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
