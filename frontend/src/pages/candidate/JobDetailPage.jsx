import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  Award,
  Briefcase,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Copy,
  ExternalLink,
  Eye,
  Flame,
  Globe,
  Heart,
  Image as ImageIcon,
  MapPin,
  Navigation,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
  X,
  MessageSquare
} from 'lucide-react';
import { CompanyLogo } from '../../components/CompanyLogo';
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
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'reviews' | 'jobs' | 'locations'
  const [activeOfficeIdx, setActiveOfficeIdx] = useState(0);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  useEffect(() => {
    let active = true;

    const loadJob = async () => {
      setLoading(true);
      try {
        const [detail, related] = await Promise.all([
          jobService.getJobById(id),
          jobService.getRelatedJobs(id, 4)
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
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const scrollToSection = (sectionId, tabKey) => {
    setActiveTab(tabKey);
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="cd-page jd-page-loading">
        <div className="container">
          <div className="cd-state">
            <div className="cd-state-icon jd-spin">
              <Clock size={32} />
            </div>
            <h3>Đang tải thông tin việc làm...</h3>
            <p>Vui lòng chờ trong giây lát để hệ thống cập nhật dữ liệu mới nhất.</p>
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
              <AlertCircle size={32} />
            </div>
            <h3>Không tìm thấy việc làm</h3>
            <p>Tin này có thể đã hết hạn tuyển dụng hoặc đường dẫn không chính xác.</p>
            <Link to="/viec-lam" className="btn btn-primary jd-back-home-btn">
              Khám phá việc làm khác
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const saved = isJobSaved(job.id);
  const applied = hasApplied(job.id);

  // Dữ liệu mở rộng chuẩn ITviec (có fallback thông minh từ job & job.company)
  const company = job.company || {};
  const companyName = job.companyName || company.name || 'Công ty Công nghệ';
  const companyLogo = job.companyLogo || company.logo || null;
  const companyInitials = job.companyInitials || (companyName.slice(0, 3).toUpperCase());

  const companyModel = company.model || (job.jobType === 'Remote' ? 'Sản phẩm & Remote' : 'Sản phẩm (Product)');
  const companyIndustry = company.industry || 'Sản phẩm phần mềm & Dịch vụ Web';
  const companySize = company.size || '100 - 499 nhân viên';
  const companyCountry = company.country || 'Việt Nam';
  const workingSchedule = company.workingSchedule || job.workingSchedule || 'Thứ 2 - Thứ 6 (08:30 - 17:30)';
  const overtimePolicy = company.overtime || 'Không có OT / Trả lương làm thêm giờ đầy đủ';
  const ratingScore = company.rating || 4.8;
  const reviewCount = company.reviewCount || 28;
  const recommendRate = company.recommendRate || 99;

  const awards = company.awards && company.awards.length > 0 ? company.awards : [
    { year: '2024', title: 'Công ty IT tốt nhất Việt Nam 2024', score: '4.9', recommend: '100%' },
    { year: '2023', title: 'Công ty IT tốt nhất Việt Nam 2023', score: '4.8', recommend: '100%' },
    { year: '2022', title: 'Công ty IT tốt nhất Việt Nam 2022', score: '5.0', recommend: '100%' },
  ];

  const photos = company.photos && company.photos.length > 0 ? company.photos : [
    { id: 1, url: '/images/workplace/team.jpg', caption: 'Teambuilding & Hoạt động văn hóa gắn kết' },
    { id: 2, url: '/images/workplace/office.jpg', caption: 'Không gian làm việc sáng tạo chuẩn quốc tế' },
    { id: 3, url: '/images/workplace/event.jpg', caption: 'Sự kiện Townhall & Chia sẻ công nghệ định kỳ' },
  ];

  const offices = company.offices && company.offices.length > 0 ? company.offices : [
    {
      city: 'TP. Hồ Chí Minh',
      address: company.address || 'Tầng 5, Tòa nhà Innovation, Khu Công nghệ cao, TP. Thủ Đức, TP. HCM',
      isPrimary: true,
      lat: 10.8542,
      lng: 106.7865
    },
    {
      city: 'Hà Nội',
      address: 'Tầng 12, Tòa nhà Keangnam Landmark 72, Phạm Hùng, Nam Từ Liêm, Hà Nội',
      isPrimary: false,
      lat: 21.0173,
      lng: 105.7838
    }
  ];

  const currentOffice = offices[activeOfficeIdx] || offices[0];

  return (
    <div className="itv-detail-wrapper">
      {/* 1. HERO BANNER SANG TRỌNG ĐẬM CHẤT ITVIEC */}
      <section className="itv-hero-banner">
        <div className="container">
          <div className="itv-hero-inner">
            {/* Cột trái: Logo & Thông tin công ty / tin tuyển dụng */}
            <div className="itv-hero-left">
              <div className="itv-hero-logo-box">
                <CompanyLogo
                  companyName={companyName}
                  logoUrl={companyLogo}
                  initials={companyInitials}
                  size={88}
                  className="itv-hero-logo"
                />
              </div>

              <div className="itv-hero-details">
                <div className="itv-hero-badges-row">
                  {job.isHot && (
                    <span className="itv-pill itv-pill-hot">
                      <Flame size={13} /> HOT
                    </span>
                  )}
                  {job.isNew && (
                    <span className="itv-pill itv-pill-new">
                      <Sparkles size={13} /> Mới đăng
                    </span>
                  )}
                  <span className="itv-pill itv-pill-type">{job.jobType}</span>
                </div>

                <h1 className="itv-hero-job-title">{job.title}</h1>

                <div className="itv-hero-company-line">
                  <span className="itv-company-name-text">{companyName}</span>
                  <span className="itv-verified-badge" title="Doanh nghiệp đã xác thực">
                    <ShieldCheck size={15} /> Xác thực
                  </span>
                </div>

                <div className="itv-hero-meta-row">
                  <span className="itv-meta-item">
                    <MapPin size={15} />
                    {job.location}
                  </span>
                  <span className="itv-meta-divider">•</span>
                  <span className="itv-meta-item itv-openings-count">
                    <Briefcase size={15} />
                    {relatedJobs.length + 1} việc làm đang tuyển dụng
                  </span>
                  <span className="itv-meta-divider">•</span>
                  <span className="itv-meta-item">
                    <Clock size={15} />
                    Hạn nộp: <strong>{job.deadline}</strong>
                  </span>
                </div>

                {/* Hàng nút CTA chính trên Header */}
                <div className="itv-hero-action-buttons">
                  {applied ? (
                    <button className="itv-btn itv-btn-applied" type="button" disabled>
                      <CheckCircle2 size={18} />
                      Đã ứng tuyển
                    </button>
                  ) : (
                    <button
                      className="itv-btn itv-btn-primary"
                      type="button"
                      onClick={() => navigate(`/viec-lam/${job.id}/ung-tuyen`)}
                    >
                      <Send size={17} />
                      Ứng tuyển ngay
                    </button>
                  )}

                  <button
                    className={`itv-btn itv-btn-secondary ${saved ? 'is-saved' : ''}`}
                    type="button"
                    onClick={() => toggleSaveJob(job.id)}
                    aria-pressed={saved}
                  >
                    <Heart size={17} fill={saved ? 'currentColor' : 'none'} />
                    {saved ? 'Đã lưu tin' : 'Lưu tin tuyển dụng'}
                  </button>

                  <button
                    className="itv-btn itv-btn-chat-employer"
                    type="button"
                    onClick={() => {
                      const cid = company.id || job.companyId || '';
                      navigate(
                        `/ung-vien/tin-nhan?company=${encodeURIComponent(companyName)}&companyId=${cid}&jobId=${job.id}&jobTitle=${encodeURIComponent(job.title)}`
                      );
                    }}
                    title="Nhắn tin trực tiếp với Nhà tuyển dụng"
                  >
                    <MessageSquare size={17} />
                    <span>Chat với NTD</span>
                  </button>

                  <button
                    className="itv-btn itv-btn-outline"
                    type="button"
                    onClick={handleShare}
                    title="Sao chép liên kết"
                  >
                    <Share2 size={16} />
                    <span>{copied ? 'Đã copy link!' : 'Chia sẻ'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Cột phải: Khối đánh giá & Giải thưởng nổi bật */}
            <div className="itv-hero-right">
              <div className="itv-rating-box">
                <div className="itv-rating-top">
                  <span className="itv-rating-number">{ratingScore.toFixed(1)}</span>
                  <div className="itv-stars-group">
                    <div className="itv-stars-row">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={15} fill="#F59E0B" color="#F59E0B" />
                      ))}
                    </div>
                    <span className="itv-review-count-text">{reviewCount} đánh giá</span>
                  </div>
                </div>

                <div className="itv-recommend-stat">
                  <span className="itv-recommend-percent">{recommendRate}%</span>
                  <span className="itv-recommend-label">Khuyến khích làm việc ở đây</span>
                </div>

                <div className="itv-top-employer-badge">
                  <Trophy size={18} className="itv-trophy-icon" />
                  <div>
                    <strong>TOP EMPLOYER 2024</strong>
                    <span>Vietnam Best Tech Companies</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THANH ĐIỀU HƯỚNG TABS (STICKY SUBNAV) */}
      <nav className="itv-subnav-sticky" aria-label="Điều hướng trang chi tiết">
        <div className="container">
          <div className="itv-subnav-tabs">
            <button
              type="button"
              className={`itv-subnav-tab ${activeTab === 'overview' ? 'is-active' : ''}`}
              onClick={() => scrollToSection('sec-overview', 'overview')}
            >
              Giới thiệu & Mô tả
            </button>
            <button
              type="button"
              className={`itv-subnav-tab ${activeTab === 'reviews' ? 'is-active' : ''}`}
              onClick={() => scrollToSection('sec-reviews', 'reviews')}
            >
              Đánh giá <span className="itv-tab-counter">{reviewCount}</span>
            </button>
            <button
              type="button"
              className={`itv-subnav-tab ${activeTab === 'jobs' ? 'is-active' : ''}`}
              onClick={() => scrollToSection('sec-jobs', 'jobs')}
            >
              Việc làm <span className="itv-tab-counter">{relatedJobs.length + 1}</span>
            </button>
            <button
              type="button"
              className={`itv-subnav-tab ${activeTab === 'locations' ? 'is-active' : ''}`}
              onClick={() => scrollToSection('sec-locations', 'locations')}
            >
              Địa điểm
            </button>
          </div>
        </div>
      </nav>

      {/* 3. BỐ CỤC NỘI DUNG CHÍNH (2 CỘT CÂN ĐỐI) */}
      <div className="container itv-main-content">
        <div className="itv-grid-layout">
          {/* ===== CỘT TRÁI (NỘI DUNG CHI TIẾT) ===== */}
          <main className="itv-col-main" id="sec-overview">
            {/* THẺ 1: THÔNG TIN CHUNG (GRID 6 Ô CHUẨN ITVIEC) */}
            <section className="itv-card itv-general-info-card">
              <h2 className="itv-card-title">
                <Building2 size={20} className="itv-title-icon" />
                Thông tin chung
              </h2>

              <div className="itv-general-info-grid">
                <div className="itv-info-cell">
                  <span className="itv-cell-label">Mô hình công ty</span>
                  <strong className="itv-cell-value">{companyModel}</strong>
                </div>

                <div className="itv-info-cell">
                  <span className="itv-cell-label">Lĩnh vực</span>
                  <strong className="itv-cell-value">{companyIndustry}</strong>
                </div>

                <div className="itv-info-cell">
                  <span className="itv-cell-label">Quy mô công ty</span>
                  <strong className="itv-cell-value">{companySize}</strong>
                </div>

                <div className="itv-info-cell">
                  <span className="itv-cell-label">Mức lương</span>
                  <strong className="itv-cell-value itv-cell-salary">{formatSalary(job.salary)}</strong>
                </div>

                <div className="itv-info-cell">
                  <span className="itv-cell-label">Thời gian làm việc</span>
                  <strong className="itv-cell-value">{workingSchedule}</strong>
                </div>

                <div className="itv-info-cell">
                  <span className="itv-cell-label">Làm việc ngoài giờ</span>
                  <strong className="itv-cell-value">{overtimePolicy}</strong>
                </div>

                <div className="itv-info-cell">
                  <span className="itv-cell-label">Cấp bậc</span>
                  <strong className="itv-cell-value">{job.level}</strong>
                </div>

                <div className="itv-info-cell">
                  <span className="itv-cell-label">Kinh nghiệm</span>
                  <strong className="itv-cell-value">{job.experience}</strong>
                </div>

                <div className="itv-info-cell">
                  <span className="itv-cell-label">Quốc gia</span>
                  <strong className="itv-cell-value">{companyCountry}</strong>
                </div>
              </div>
            </section>

            {/* THẺ 2: GIẢI THƯỞNG (ITVIEC AWARDS SHOWCASE) */}
            <section className="itv-card itv-awards-card">
              <div className="itv-awards-head">
                <h2 className="itv-card-title">
                  <Award size={20} className="itv-title-icon itv-award-gold" />
                  Giải thưởng & Vinh danh
                </h2>
                <span className="itv-badge-sub">Được công nhận uy tín</span>
              </div>

              <div className="itv-awards-list">
                {awards.map((item, idx) => (
                  <div key={idx} className="itv-award-item">
                    <div className="itv-award-badge-icon">
                      <Trophy size={20} />
                    </div>
                    <div className="itv-award-info">
                      <strong>{item.title}</strong>
                      <div className="itv-award-metrics">
                        <span className="itv-award-score">
                          <Star size={13} fill="#F59E0B" color="#F59E0B" /> {item.score}
                        </span>
                        <span className="itv-award-divider">•</span>
                        <span className="itv-award-recommend">
                          <ThumbsUp size={13} /> {item.recommend} khuyến khích
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="itv-awards-disclaimer">
                * Giải thưởng Công ty IT tốt nhất Việt Nam được chứng thực dựa trên khảo sát đánh giá thực tế của cộng đồng kỹ sư và chuyên gia công nghệ.
              </p>
            </section>

            {/* THẺ 3: MÔ TẢ CÔNG VIỆC */}
            <section className="itv-card itv-section-block">
              <h2 className="itv-card-title">
                <Briefcase size={20} className="itv-title-icon" />
                Mô tả công việc
              </h2>
              <ul className="itv-checklist">
                {job.description && job.description.map((line, index) => (
                  <li key={index}>
                    <CheckCircle2 size={18} className="itv-check-icon" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* THẺ 4: YÊU CẦU ỨNG VIÊN */}
            <section className="itv-card itv-section-block">
              <h2 className="itv-card-title">
                <TrendingUp size={20} className="itv-title-icon" />
                Yêu cầu ứng viên
              </h2>
              <ul className="itv-checklist">
                {job.requirements && job.requirements.map((line, index) => (
                  <li key={index}>
                    <CheckCircle2 size={18} className="itv-check-icon" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* THẺ 5: CHUYÊN MÔN CỦA CHÚNG TÔI (TECH STACK & SKILLS) */}
            <section className="itv-card itv-section-block">
              <h2 className="itv-card-title">
                <Code2 size={20} className="itv-title-icon" />
                Chuyên môn của chúng tôi
              </h2>
              <div className="itv-skills-chip-wrap">
                {job.skills && job.skills.map((skill) => (
                  <span key={skill} className="itv-skill-chip">
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            {/* THẺ 6: TẠI SAO BẠN SẼ YÊU THÍCH LÀM VIỆC TẠI ĐÂY? (BENEFITS & GALLERY) */}
            <section className="itv-card itv-section-block">
              <h2 className="itv-card-title">
                <Sparkles size={20} className="itv-title-icon" />
                Tại sao bạn sẽ yêu thích làm việc tại đây?
              </h2>

              <ul className="itv-checklist itv-benefits-list">
                {job.benefits && job.benefits.map((line, index) => (
                  <li key={index}>
                    <CheckCircle2 size={18} className="itv-check-icon itv-check-green" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              {/* 3 Ảnh thực tế văn phòng & văn hóa teambuilding */}
              <div className="itv-gallery-block">
                <h3 className="itv-gallery-heading">
                  <ImageIcon size={17} />
                  Hình ảnh môi trường & văn hóa làm việc
                </h3>
                <div className="itv-photo-grid">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="itv-photo-card"
                      onClick={() => setPreviewPhoto(photo)}
                      role="button"
                      tabIndex={0}
                      title="Xem ảnh phóng to"
                    >
                      <img src={photo.url} alt={photo.caption} loading="lazy" />
                      <div className="itv-photo-overlay">
                        <span>{photo.caption}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* THẺ 7: GIỚI THIỆU CÔNG TY */}
            <section className="itv-card itv-section-block">
              <h2 className="itv-card-title">
                <Building2 size={20} className="itv-title-icon" />
                Giới thiệu {companyName}
              </h2>
              <div className="itv-company-desc-text">
                <p>{company.description || 'Doanh nghiệp uy tín đồng hành phát triển cùng nhân tài công nghệ Việt Nam.'}</p>
              </div>

              <div className="itv-company-external-links">
                {company.website && (
                  <a
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="itv-external-btn"
                  >
                    <Globe size={16} />
                    <span>Website công ty</span>
                    <ExternalLink size={14} />
                  </a>
                )}
                {company.facebook && (
                  <a
                    href={company.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="itv-external-btn"
                  >
                    <Users size={16} />
                    <span>Trang tuyển dụng / Fanpage</span>
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </section>

            {/* THẺ 8: ĐÁNH GIÁ TỪ NHÂN VIÊN */}
            <section className="itv-card itv-section-block" id="sec-reviews">
              <div className="itv-reviews-header">
                <div>
                  <h2 className="itv-card-title">
                    <Star size={20} className="itv-title-icon itv-award-gold" />
                    Đánh giá từ nhân viên ({reviewCount})
                  </h2>
                  <p className="itv-reviews-subtitle">Trải nghiệm thực tế từ các kỹ sư và chuyên gia đang làm việc</p>
                </div>
                <div className="itv-overall-badge">
                  <strong>{ratingScore.toFixed(1)}</strong>
                  <span>/ 5.0</span>
                </div>
              </div>

              <div className="itv-rating-bars-grid">
                <div className="itv-rating-bar-item">
                  <div className="itv-bar-label-row">
                    <span>Lương thưởng & Phúc lợi</span>
                    <strong>4.9</strong>
                  </div>
                  <div className="itv-bar-track">
                    <div className="itv-bar-fill" style={{ width: '98%' }} />
                  </div>
                </div>

                <div className="itv-rating-bar-item">
                  <div className="itv-bar-label-row">
                    <span>Đào tạo & Cơ hội phát triển</span>
                    <strong>4.8</strong>
                  </div>
                  <div className="itv-bar-track">
                    <div className="itv-bar-fill" style={{ width: '96%' }} />
                  </div>
                </div>

                <div className="itv-rating-bar-item">
                  <div className="itv-bar-label-row">
                    <span>Đồng nghiệp & Văn hóa</span>
                    <strong>5.0</strong>
                  </div>
                  <div className="itv-bar-track">
                    <div className="itv-bar-fill" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="itv-rating-bar-item">
                  <div className="itv-bar-label-row">
                    <span>Cân bằng công việc & Đời sống</span>
                    <strong>4.8</strong>
                  </div>
                  <div className="itv-bar-track">
                    <div className="itv-bar-fill" style={{ width: '96%' }} />
                  </div>
                </div>
              </div>

              {/* Trích dẫn nhận xét tiêu biểu */}
              <div className="itv-reviews-quotes">
                <div className="itv-review-card">
                  <div className="itv-review-card-head">
                    <div className="itv-stars-row">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={13} fill="#F59E0B" color="#F59E0B" />
                      ))}
                    </div>
                    <span className="itv-reviewer-role">Senior Software Engineer • Đang làm việc</span>
                  </div>
                  <h4 className="itv-review-headline">"Môi trường công nghệ hiện đại, trao quyền và lộ trình rõ ràng"</h4>
                  <p className="itv-review-content">
                    Được làm việc với stack công nghệ mới, hệ thống chịu tải cao. Đồng nghiệp cực kỳ hỗ trợ, văn hóa không OT vô lý và ban quản lý rất lắng nghe ý kiến đóng góp của kỹ sư.
                  </p>
                </div>
              </div>
            </section>

            {/* THẺ 9: ĐỊA ĐIỂM & BẢN ĐỒ */}
            <section className="itv-card itv-section-block" id="sec-locations">
              <h2 className="itv-card-title">
                <MapPin size={20} className="itv-title-icon" />
                Địa điểm làm việc
              </h2>

              <div className="itv-location-tabs">
                {offices.map((office, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`itv-loc-tab-btn ${activeOfficeIdx === idx ? 'is-active' : ''}`}
                    onClick={() => setActiveOfficeIdx(idx)}
                  >
                    <Building2 size={15} />
                    <span>{office.city}</span>
                    {office.isPrimary && <span className="itv-pill-primary-branch">Trụ sở</span>}
                  </button>
                ))}
              </div>

              <div className="itv-location-box">
                <div className="itv-loc-info-row">
                  <MapPin size={20} className="itv-loc-pin-icon" />
                  <div>
                    <strong>{currentOffice.city}</strong>
                    <p>{currentOffice.address}</p>
                  </div>
                </div>

                {/* Bản đồ định vị mô phỏng phong cách ITviec */}
                <div className="itv-map-container">
                  <div className="itv-map-bg-stylized">
                    <div className="itv-map-grid-pattern" />
                    <div className="itv-map-marker-pin">
                      <div className="itv-pulse-ring" />
                      <div className="itv-pin-core">
                        <MapPin size={20} />
                      </div>
                      <div className="itv-pin-tooltip">{currentOffice.city} Office</div>
                    </div>
                  </div>
                  <div className="itv-map-overlay-bar">
                    <span className="itv-map-address-preview">{currentOffice.address}</span>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(currentOffice.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="itv-map-direct-btn"
                    >
                      <Navigation size={14} />
                      Chỉ đường trên Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </main>

          {/* ===== CỘT PHẢI (SIDEBAR: STICKY APPLY & VIỆC LÀM ĐANG TUYỂN) ===== */}
          <aside className="itv-col-sidebar" id="sec-jobs">
            {/* THẺ WIDGET 1: ỨNG TUYỂN NHANH (STICKY CTA CARD) */}
            <div className="itv-sticky-apply-widget">
              <div className="itv-widget-salary-row">
                <span className="itv-widget-salary-label">Mức lương vị trí</span>
                <span className="itv-widget-salary-value">{formatSalary(job.salary)}</span>
              </div>

              <div className="itv-widget-actions">
                {applied ? (
                  <button className="itv-btn itv-btn-applied itv-w-full" type="button" disabled>
                    <CheckCircle2 size={18} />
                    Đã nộp hồ sơ
                  </button>
                ) : (
                  <button
                    className="itv-btn itv-btn-primary itv-w-full"
                    type="button"
                    onClick={() => navigate(`/viec-lam/${job.id}/ung-tuyen`)}
                  >
                    <Send size={18} />
                    Ứng tuyển ngay
                  </button>
                )}

                <button
                  className={`itv-btn itv-btn-secondary itv-w-full ${saved ? 'is-saved' : ''}`}
                  type="button"
                  onClick={() => toggleSaveJob(job.id)}
                >
                  <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
                  {saved ? 'Bỏ lưu tin này' : 'Lưu tin tuyển dụng'}
                </button>

                <button
                  className="itv-btn itv-btn-chat-widget itv-w-full"
                  type="button"
                  onClick={() =>
                    navigate(
                      `/ung-vien/tin-nhan?company=${encodeURIComponent(companyName)}&jobTitle=${encodeURIComponent(job.title)}`
                    )
                  }
                >
                  <MessageSquare size={17} />
                  <span>Chat với Nhà tuyển dụng</span>
                </button>
              </div>

              <div className="itv-widget-footer">
                <span className="itv-widget-deadline">
                  <CalendarClock size={15} />
                  Hạn nộp hồ sơ: <strong>{job.deadline}</strong>
                </span>
              </div>
            </div>

            {/* THẺ WIDGET 2: DANH SÁCH VIỆC LÀM ĐANG TUYỂN DỤNG (ITVIEC SIDEBAR STYLE) */}
            <div className="itv-sidebar-jobs-card">
              <div className="itv-sidebar-header">
                <h3>
                  {relatedJobs.length > 0 ? `${relatedJobs.length} việc làm đang tuyển dụng` : 'Việc làm khác'}
                </h3>
              </div>

              <div className="itv-sidebar-job-list">
                {relatedJobs.map((item) => (
                  <Link
                    key={item.id}
                    to={`/viec-lam/${item.id}`}
                    className="itv-sidebar-job-item"
                  >
                    <div className="itv-sb-job-top">
                      <div className="itv-sb-logo-wrap">
                        <CompanyLogo
                          companyName={item.companyName}
                          logoUrl={item.companyLogo || item.logoUrl}
                          initials={item.companyInitials}
                          size={40}
                        />
                      </div>
                      <div className="itv-sb-job-head">
                        <span className="itv-sb-posted-time">{item.timeAgo || 'Mới đăng'}</span>
                        <h4 className="itv-sb-job-title">{item.title}</h4>
                        <span className="itv-sb-company-name">{item.companyName}</span>
                      </div>
                    </div>

                    <div className="itv-sb-job-mid">
                      <span className="itv-sb-location">
                        <MapPin size={13} />
                        {item.location}
                      </span>
                      <span className="itv-sb-salary">
                        <Wallet size={13} />
                        {formatSalary(item.salary)}
                      </span>
                    </div>

                    <div className="itv-sb-job-skills">
                      {item.skills && item.skills.slice(0, 3).map((sk) => (
                        <span key={sk} className="itv-sb-skill-pill">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>

              <div className="itv-sidebar-footer-link">
                <Link to="/viec-lam" className="itv-view-all-jobs-btn">
                  <span>Xem tất cả cơ hội việc làm</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>

            {/* THẺ WIDGET 3: CAM KẾT XÁC THỰC */}
            <div className="itv-trust-badge-card">
              <ShieldCheck size={28} className="itv-trust-icon" />
              <div>
                <strong>Tin tuyển dụng chính thức</strong>
                <p>Đã được xác thực thông tin pháp nhân và phản hồi nhanh chóng.</p>
              </div>
            </div>
          </aside>
        </div>

        {/* 4. THANH BREADCRUMB VÀ LƯỢT XEM Ở CHÂN TRANG */}
        <div className="itv-bottom-bar">
          <nav className="itv-bottom-breadcrumb" aria-label="Đường dẫn trang">
            <Link to="/">Trang chủ</Link>
            <ChevronRight size={14} />
            <Link to="/viec-lam">Nhà tuyển dụng</Link>
            <ChevronRight size={14} />
            <span className="itv-breadcrumb-active">{companyName}</span>
          </nav>
          <div className="itv-page-view-counter">
            <Eye size={15} />
            <span>Số lượt xem tin: <strong>{(job.views || 1240).toLocaleString('vi-VN')}</strong></span>
          </div>
        </div>
      </div>

      {/* 5. MODAL PHÓNG TO HÌNH ẢNH MÔI TRƯỜNG LÀM VIỆC */}
      {previewPhoto && (
        <div
          className="itv-modal-backdrop"
          onClick={() => setPreviewPhoto(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="itv-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="itv-modal-close-btn"
              type="button"
              onClick={() => setPreviewPhoto(null)}
              aria-label="Đóng ảnh"
            >
              <X size={24} />
            </button>
            <img src={previewPhoto.url} alt={previewPhoto.caption} className="itv-modal-img" />
            <p className="itv-modal-caption">{previewPhoto.caption}</p>
          </div>
        </div>
      )}
    </div>
  );
};
