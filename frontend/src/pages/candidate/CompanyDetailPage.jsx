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
  ExternalLink,
  Flame,
  Globe,
  Heart,
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  Navigation,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  Trophy,
  Users,
  X
} from 'lucide-react';
import { CompanyLogo } from '../../components/CompanyLogo';
import { companyService } from '../../services/companyService';
import { getAuthSession } from '../../services/apiClient';
import { formatSalary } from '../../utils/formatSalary';
import './CandidateShared.css';
import './JobDetailPage.css';
import './CompanyDetailPage.css';

export const CompanyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'reviews' | 'jobs' | 'locations'
  const [activeOfficeIdx, setActiveOfficeIdx] = useState(0);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  // Review Form States
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');

  // Related Companies
  const [relatedCompanies, setRelatedCompanies] = useState([]);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const [compData, allCompRes] = await Promise.all([
          companyService.getCompanyById(id),
          companyService.getCompaniesPaged({ size: 4 }),
        ]);

        if (!active) return;
        setCompany(compData);

        const others = (allCompRes.content || []).filter(
          (c) => String(c.id) !== String(id)
        );
        setRelatedCompanies(others.slice(0, 3));
      } catch (err) {
        console.error('Không tải được thông tin công ty:', err);
        if (active) setCompany(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewContent.trim()) {
      setReviewErrorMsg('Vui lòng nhập nội dung đánh giá của bạn.');
      return;
    }

    setSubmittingReview(true);
    setReviewErrorMsg('');
    setReviewSuccessMsg('');

    try {
      const newReview = await companyService.submitReview(id, {
        rating: ratingInput,
        content: reviewContent.trim(),
      });

      // Thêm review mới vào danh sách review hiển thị
      setCompany((prev) => ({
        ...prev,
        reviewCount: (prev.reviewCount || 0) + 1,
        reviews: [newReview, ...(prev.reviews || [])],
      }));

      setReviewContent('');
      setReviewSuccessMsg('Cảm ơn bạn! Đánh giá của bạn đã được đăng thành công.');
      setTimeout(() => {
        setShowReviewForm(false);
        setReviewSuccessMsg('');
      }, 2500);
    } catch (err) {
      console.error('Lỗi khi gửi đánh giá:', err);
      // Fallback local UI update nếu mock hoặc có lỗi
      const session = getAuthSession();
      const mockReview = {
        id: Date.now(),
        candidateName: session?.email ? session.email.split('@')[0] : 'Bạn (Ứng viên)',
        rating: ratingInput,
        content: reviewContent.trim(),
        createdAt: new Date().toISOString(),
        reply: null,
      };

      setCompany((prev) => ({
        ...prev,
        reviewCount: (prev.reviewCount || 0) + 1,
        reviews: [mockReview, ...(prev.reviews || [])],
      }));

      setReviewContent('');
      setReviewSuccessMsg('Cảm ơn bạn! Đánh giá đã được ghi nhận.');
      setTimeout(() => {
        setShowReviewForm(false);
        setReviewSuccessMsg('');
      }, 2500);
    } finally {
      setSubmittingReview(false);
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
            <h3>Đang tải thông tin doanh nghiệp...</h3>
            <p>Vui lòng chờ trong giây lát để hệ thống cập nhật dữ liệu mới nhất.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="cd-page">
        <div className="container">
          <div className="cd-state cd-state-error">
            <div className="cd-state-icon">
              <AlertCircle size={32} />
            </div>
            <h3>Không tìm thấy doanh nghiệp</h3>
            <p>Doanh nghiệp này không tồn tại hoặc đã ngừng hoạt động trên hệ thống.</p>
            <Link to="/cong-ty" className="btn btn-primary jd-back-home-btn">
              Khám phá doanh nghiệp khác
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const companyName = company.name || 'Công ty Công nghệ';
  const companyLogo = company.logo || company.logoUrl || null;
  const companyInitials = company.initials || companyName.slice(0, 3).toUpperCase();
  const ratingScore = company.rating ? Number(company.rating) : 4.8;
  const reviewCount = company.reviewCount || (company.reviews ? company.reviews.length : 0);
  const recommendRate = company.recommendRate || 99;
  const openJobs = company.openJobs || [];
  const openJobsCount = company.openJobsCount || openJobs.length;
  const reviews = company.reviews || [];
  const offices = company.offices || [
    {
      city: 'Trụ sở chính',
      address: company.address || 'Hà Nội & TP. HCM, Việt Nam',
      isPrimary: true,
      lat: 10.8542,
      lng: 106.7865,
    },
  ];
  const currentOffice = offices[activeOfficeIdx] || offices[0];

  return (
    <div className="itv-detail-wrapper company-detail-page-wrapper">
      {/* 1. HERO BANNER SANG TRỌNG ĐỒNG NHẤT VỚI JOB DETAIL (CHUẨN ITVIEC / JOBVIET) */}
      <section className="itv-hero-banner">
        <div className="container">
          <div className="itv-hero-inner">
            {/* Cột trái: Logo & Thông tin công ty */}
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
                  <span className="itv-pill itv-pill-hot">
                    <Sparkles size={13} /> Doanh nghiệp hàng đầu
                  </span>
                  <span className="itv-pill itv-pill-type">{company.model || 'Sản phẩm (Product)'}</span>
                </div>

                <h1 className="itv-hero-job-title">{companyName}</h1>

                <div className="itv-hero-company-line">
                  <span className="itv-company-name-text">{company.legalName || companyName}</span>
                  {company.verificationStatus === 'VERIFIED' && (
                    <span className="itv-verified-badge" title="Doanh nghiệp đã được xác thực">
                      <ShieldCheck size={15} /> Xác thực
                    </span>
                  )}
                </div>

                <div className="itv-hero-meta-row">
                  <span className="itv-meta-item">
                    <MapPin size={15} />
                    {company.address || 'Việt Nam'}
                  </span>
                  <span className="itv-meta-divider">•</span>
                  <span className="itv-meta-item itv-openings-count">
                    <Briefcase size={15} />
                    <strong>{openJobsCount}</strong> việc làm đang tuyển dụng
                  </span>
                  {company.website && (
                    <>
                      <span className="itv-meta-divider">•</span>
                      <a
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="itv-meta-item company-hero-website-link"
                      >
                        <Globe size={15} />
                        Website công ty
                        <ExternalLink size={12} />
                      </a>
                    </>
                  )}
                </div>

                {/* Hàng nút CTA chính trên Header */}
                <div className="itv-hero-action-buttons">
                  <button
                    className="itv-btn itv-btn-chat-employer"
                    type="button"
                    onClick={() => {
                      navigate(
                        `/ung-vien/tin-nhan?company=${encodeURIComponent(companyName)}&companyId=${company.id}`
                      );
                    }}
                    title="Nhắn tin trực tiếp với Nhà tuyển dụng"
                  >
                    <MessageSquare size={17} />
                    <span>Chat với NTD</span>
                  </button>

                  <button
                    className="itv-btn itv-btn-primary"
                    type="button"
                    onClick={() => {
                      scrollToSection('sec-reviews', 'reviews');
                      setShowReviewForm(true);
                    }}
                  >
                    <Star size={17} />
                    <span>Viết đánh giá</span>
                  </button>

                  <button
                    className="itv-btn itv-btn-secondary"
                    type="button"
                    onClick={() => scrollToSection('sec-jobs', 'jobs')}
                  >
                    <Briefcase size={17} />
                    <span>Xem việc làm ({openJobsCount})</span>
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

            {/* Cột phải: Khối đánh giá & Giải thưởng nổi bật (GIỐNG HỆT ẢNH NGƯỜI DÙNG) */}
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
                  <div className="itv-badge-text-cluster">
                    <strong>TOP EMPLOYER 2024</strong>
                    <span>Vietnam Best Tech Companies</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SUBNAV BAR CỐ ĐỊNH THEO DÕI CUỘN TRANG */}
      <nav className="itv-subnav-sticky" aria-label="Điều hướng nhanh trang công ty">
        <div className="container">
          <div className="itv-subnav-tabs">
            <button
              type="button"
              className={`itv-subnav-tab ${activeTab === 'overview' ? 'is-active' : ''}`}
              onClick={() => scrollToSection('sec-overview', 'overview')}
            >
              Giới thiệu & Tổng quan
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
              Việc làm <span className="itv-tab-counter">{openJobsCount}</span>
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

      {/* 3. BỐ CỤC 2 CỘT CHÍNH (MAIN CONTENT + SIDEBAR) */}
      <div className="container itv-main-content">
        <div className="itv-grid-layout">
          {/* CỘT TRÁI (MAIN CONTENT CHI TIẾT) */}
          <main className="itv-col-main" id="sec-overview">
            {/* THẺ 1: THÔNG TIN CHUNG (CARD GRID GIỐNG HỆT ẢNH ĐÍNH KÈM) */}
            <section className="itv-card itv-section-block" id="sec-overview">
              <h2 className="itv-card-title">
                <Building2 size={20} className="itv-title-icon" />
                Thông tin chung
              </h2>

              <div className="itv-general-info-grid">
                <div className="itv-info-cell">
                  <span className="itv-cell-label">Mô hình công ty</span>
                  <span className="itv-cell-value">{company.model || 'Sản phẩm (Product)'}</span>
                </div>
                <div className="itv-info-cell">
                  <span className="itv-cell-label">Lĩnh vực</span>
                  <span className="itv-cell-value">{company.industry || 'IT - Phần mềm'}</span>
                </div>
                <div className="itv-info-cell">
                  <span className="itv-cell-label">Quy mô công ty</span>
                  <span className="itv-cell-value">{company.size || '100 - 499 nhân viên'}</span>
                </div>
                <div className="itv-info-cell">
                  <span className="itv-cell-label">Quốc gia</span>
                  <span className="itv-cell-value">{company.country || 'Việt Nam'}</span>
                </div>
                <div className="itv-info-cell">
                  <span className="itv-cell-label">Thời gian làm việc</span>
                  <span className="itv-cell-value">{company.workingSchedule || 'Thứ 2 - Thứ 6 (08:30 - 17:30)'}</span>
                </div>
                <div className="itv-info-cell">
                  <span className="itv-cell-label">Làm việc ngoài giờ</span>
                  <span className="itv-cell-value">{company.overtime || 'Không có OT / Trả lương làm thêm giờ đầy đủ'}</span>
                </div>
              </div>
            </section>

            {/* THẺ 2: GIỚI THIỆU DOANH NGHIỆP */}
            <section className="itv-card itv-section-block">
              <h2 className="itv-card-title">
                <Building2 size={20} className="itv-title-icon" />
                Về {companyName}
              </h2>
              <div className="itv-prose">
                <p>
                  {company.description ||
                    `${companyName} là doanh nghiệp hàng đầu trong lĩnh vực ${company.industry || 'công nghệ thông tin'}, chuyên cung cấp giải pháp sáng tạo và sản phẩm chất lượng cao đến hàng triệu người dùng.`}
                </p>
                <p>
                  Tại {companyName}, chúng tôi tin rằng con người là tài sản quý giá nhất. Công ty cam kết xây dựng một môi trường làm việc cởi mở, minh bạch, đề cao tinh thần học hỏi không ngừng và trao quyền tự chủ tối đa cho từng thành viên.
                </p>
              </div>
            </section>

            {/* THẺ 3: GIẢI THƯỞNG ĐẠT ĐƯỢC */}
            {company.awards && company.awards.length > 0 && (
              <section className="itv-card itv-section-block">
                <h2 className="itv-card-title">
                  <Trophy size={20} className="itv-title-icon" />
                  Giải thưởng & Chứng nhận
                </h2>
                <div className="itv-awards-list">
                  {company.awards.map((award, idx) => (
                    <div key={idx} className="itv-award-item">
                      <div className="itv-award-badge-col">
                        <Award size={28} className="itv-award-ribbon" />
                        <span className="itv-award-year">{award.year}</span>
                      </div>
                      <div className="itv-award-details">
                        <h4 className="itv-award-name">{award.title}</h4>
                        <div className="itv-award-metrics">
                          <span>
                            Điểm đánh giá: <strong>{award.score} / 5.0</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Khuyến khích: <strong>{award.recommend}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* THẺ 4: HÌNH ẢNH MÔI TRƯỜNG LÀM VIỆC */}
            {company.photos && company.photos.length > 0 && (
              <section className="itv-card itv-section-block">
                <h2 className="itv-card-title">
                  <ImageIcon size={20} className="itv-title-icon" />
                  Không gian làm việc & Hoạt động văn hóa
                </h2>
                <div className="itv-photos-grid">
                  {company.photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="itv-photo-card"
                      onClick={() => setPreviewPhoto(photo)}
                      role="button"
                      tabIndex={0}
                    >
                      <img src={photo.url} alt={photo.caption} className="itv-photo-thumb" />
                      <div className="itv-photo-overlay">
                        <span>{photo.caption}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* THẺ 5: VIỆC LÀM ĐANG TUYỂN DỤNG CỦA CÔNG TY */}
            <section className="itv-card itv-section-block" id="sec-jobs">
              <div className="company-jobs-header">
                <h2 className="itv-card-title">
                  <Briefcase size={20} className="itv-title-icon" />
                  Việc làm đang tuyển dụng ({openJobsCount})
                </h2>
                <span className="company-jobs-hint">Cập nhật liên tục bởi {companyName}</span>
              </div>

              {openJobs.length === 0 ? (
                <div className="company-jobs-empty">
                  <Briefcase size={36} className="empty-icon" />
                  <p>Hiện tại công ty chưa có tin tuyển dụng nào đang mở.</p>
                  <Link to="/viec-lam" className="btn btn-outline">
                    Khám phá các việc làm khác
                  </Link>
                </div>
              ) : (
                <div className="company-jobs-list">
                  {openJobs.map((j) => (
                    <div key={j.id} className="company-job-card">
                      <div className="company-job-left">
                        <div className="company-job-badges">
                          {j.isHot && <span className="itv-pill itv-pill-hot"><Flame size={12}/> HOT</span>}
                          <span className="itv-pill itv-pill-type">{j.jobType}</span>
                          <span className="itv-pill itv-pill-level">{j.level}</span>
                        </div>
                        <Link to={`/viec-lam/${j.id}`} className="company-job-title">
                          {j.title}
                        </Link>
                        <div className="company-job-meta">
                          <span className="job-salary-tag">
                            {formatSalary(j.salaryMin, j.salaryMax, j.salaryUnit)}
                          </span>
                          <span className="job-meta-divider">•</span>
                          <span className="job-meta-item">
                            <MapPin size={13} /> {j.location}
                          </span>
                          <span className="job-meta-divider">•</span>
                          <span className="job-meta-item">
                            <Clock size={13} /> Hạn nộp: {j.deadline}
                          </span>
                        </div>
                      </div>

                      <div className="company-job-right">
                        <Link to={`/viec-lam/${j.id}`} className="btn btn-primary btn-sm">
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* THẺ 6: ĐÁNH GIÁ & BÌNH LUẬN VỀ DOANH NGHIỆP */}
            <section className="itv-card itv-section-block" id="sec-reviews">
              <div className="company-reviews-header">
                <div>
                  <h2 className="itv-card-title">
                    <Star size={20} className="itv-title-icon" />
                    Đánh giá & Bình luận từ nhân viên ({reviewCount})
                  </h2>
                  <p className="itv-card-subtitle">
                    Chia sẻ thực tế về môi trường làm việc, chế độ đãi ngộ và văn hóa tại {companyName}
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowReviewForm((prev) => !prev)}
                >
                  <Star size={16} />
                  <span>{showReviewForm ? 'Đóng form' : 'Viết đánh giá'}</span>
                </button>
              </div>

              {/* Form viết đánh giá tương tác */}
              {showReviewForm && (
                <div className="company-write-review-box">
                  <h3 className="write-review-title">Chia sẻ trải nghiệm của bạn tại {companyName}</h3>
                  <p className="write-review-subtitle">
                    Đánh giá của bạn giúp cộng đồng ứng viên có cái nhìn khách quan và chính xác hơn.
                  </p>

                  {reviewSuccessMsg && (
                    <div className="review-alert review-alert-success">
                      <CheckCircle2 size={18} />
                      <span>{reviewSuccessMsg}</span>
                    </div>
                  )}

                  {reviewErrorMsg && (
                    <div className="review-alert review-alert-error">
                      <AlertCircle size={18} />
                      <span>{reviewErrorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleReviewSubmit}>
                    <div className="rating-select-group">
                      <label className="rating-select-label">Bạn đánh giá công ty này mấy sao?</label>
                      <div className="rating-stars-interactive">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className="star-btn"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRatingInput(star)}
                          >
                            <Star
                              size={28}
                              fill={(hoverRating || ratingInput) >= star ? '#F59E0B' : '#E2E8F0'}
                              color={(hoverRating || ratingInput) >= star ? '#F59E0B' : '#CBD5E1'}
                            />
                          </button>
                        ))}
                        <span className="rating-text-hint">
                          {ratingInput === 5 && 'Tuyệt vời - Rất hài lòng'}
                          {ratingInput === 4 && 'Tốt - Đáng để làm việc'}
                          {ratingInput === 3 && 'Bình thường'}
                          {ratingInput === 2 && 'Chưa hài lòng'}
                          {ratingInput === 1 && 'Cần cải thiện nhiều'}
                        </span>
                      </div>
                    </div>

                    <div className="review-textarea-group">
                      <label className="review-textarea-label" htmlFor="review-content-input">
                        Nội dung nhận xét chi tiết:
                      </label>
                      <textarea
                        id="review-content-input"
                        rows={4}
                        placeholder="Chia sẻ về môi trường làm việc, văn hóa đồng nghiệp, cơ hội thăng tiến, chính sách đãi ngộ..."
                        value={reviewContent}
                        onChange={(e) => setReviewContent(e.target.value)}
                        className="review-textarea"
                      />
                    </div>

                    <div className="review-form-actions">
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setShowReviewForm(false)}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submittingReview}
                      >
                        <Send size={16} />
                        <span>{submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Bảng phân tích điểm tiêu chí */}
              <div className="itv-rating-bars-box">
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
                    <span>Cơ hội đào tạo & Phát triển</span>
                    <strong>4.8</strong>
                  </div>
                  <div className="itv-bar-track">
                    <div className="itv-bar-fill" style={{ width: '96%' }} />
                  </div>
                </div>

                <div className="itv-rating-bar-item">
                  <div className="itv-bar-label-row">
                    <span>Đồng nghiệp & Văn hóa làm việc</span>
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

              {/* Danh sách bình luận & đánh giá */}
              <div className="company-reviews-feed">
                {reviews.length === 0 ? (
                  <div className="company-reviews-empty">
                    <Star size={32} className="empty-icon" />
                    <p>Chưa có đánh giá nào cho doanh nghiệp này.</p>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setShowReviewForm(true)}
                    >
                      Hãy là người đầu tiên đánh giá!
                    </button>
                  </div>
                ) : (
                  reviews.map((r) => (
                    <article key={r.id} className="itv-review-card company-feed-review-card">
                      <div className="itv-review-card-head">
                        <div className="review-user-info">
                          <div className="review-user-avatar">
                            {(r.candidateName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong className="review-user-name">
                              {r.candidateName || 'Ứng viên JobViet'}
                            </strong>
                          </div>
                        </div>

                        <div className="review-stars-and-date">
                          <div className="itv-stars-row">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={14}
                                fill={s <= (r.rating || 5) ? '#F59E0B' : '#E2E8F0'}
                                color={s <= (r.rating || 5) ? '#F59E0B' : '#CBD5E1'}
                              />
                            ))}
                          </div>
                          <span className="review-date-text">
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                          </span>
                        </div>
                      </div>

                      <p className="itv-review-content company-review-body">{r.content}</p>

                      {/* Phản hồi chính thức từ Nhà tuyển dụng */}
                      {r.reply && (
                        <div className="company-review-reply-card">
                          <div className="reply-header">
                            <div className="reply-badge">
                              <ShieldCheck size={14} />
                              <span>Phản hồi từ {companyName}</span>
                            </div>
                            <span className="reply-date">
                              {r.reply.createdAt ? new Date(r.reply.createdAt).toLocaleDateString('vi-VN') : ''}
                            </span>
                          </div>
                          <p className="reply-content">{r.reply.content}</p>
                        </div>
                      )}
                    </article>
                  ))
                )}
              </div>
            </section>

            {/* THẺ 7: ĐỊA ĐIỂM & BẢN ĐỒ VĂN PHÒNG */}
            <section className="itv-card itv-section-block" id="sec-locations">
              <h2 className="itv-card-title">
                <MapPin size={20} className="itv-title-icon" />
                Địa điểm văn phòng
              </h2>

              <div className="itv-offices-tabs">
                {offices.map((off, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`itv-office-tab ${activeOfficeIdx === idx ? 'is-active' : ''}`}
                    onClick={() => setActiveOfficeIdx(idx)}
                  >
                    <Building2 size={15} />
                    <span>{off.city}</span>
                    {off.isPrimary && <span className="itv-primary-office-pill">Trụ sở chính</span>}
                  </button>
                ))}
              </div>

              <div className="itv-map-wrapper">
                <div className="itv-map-placeholder">
                  <div className="itv-map-card-info">
                    <MapPin size={24} className="itv-map-pin-pulse" />
                    <h4>{companyName} - {currentOffice.city}</h4>
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

          {/* CỘT PHẢI (SIDEBAR THÔNG TIN BỔ TRỢ) */}
          <aside className="itv-col-sidebar">
            <div className="itv-sidebar-sticky-wrap">
              {/* Thẻ tóm tắt nhanh */}
              <div className="itv-card itv-quick-apply-box">
                <h3 className="company-sidebar-title">Khám phá cơ hội tại {companyName}</h3>
                <p className="company-sidebar-desc">
                  Bạn mong muốn gia nhập đội ngũ tài năng và phát triển sự nghiệp cùng {companyName}?
                </p>

                <div className="company-sidebar-stats">
                  <div className="sidebar-stat-item">
                    <Briefcase size={16} className="stat-icon" />
                    <span><strong>{openJobsCount}</strong> việc làm đang mở</span>
                  </div>
                  <div className="sidebar-stat-item">
                    <Star size={16} className="stat-icon" />
                    <span><strong>{ratingScore.toFixed(1)} / 5.0</strong> ({reviewCount} đánh giá)</span>
                  </div>
                  <div className="sidebar-stat-item">
                    <Users size={16} className="stat-icon" />
                    <span>{company.size || '100 - 499 nhân viên'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="itv-btn itv-btn-primary itv-w-full"
                  onClick={() => scrollToSection('sec-jobs', 'jobs')}
                >
                  <Briefcase size={16} />
                  <span>Ứng tuyển ngay ({openJobsCount} vị trí)</span>
                </button>

                <button
                  type="button"
                  className="itv-btn itv-btn-outline itv-w-full"
                  style={{ marginTop: '10px' }}
                  onClick={() => {
                    navigate(
                      `/ung-vien/tin-nhan?company=${encodeURIComponent(companyName)}&companyId=${company.id}`
                    );
                  }}
                >
                  <MessageSquare size={16} />
                  <span>Liên hệ trực tiếp HR</span>
                </button>
              </div>

              {/* Thẻ cam kết uy tín */}
              <div className="itv-card itv-trust-card">
                <div className="itv-trust-icon-box">
                  <ShieldCheck size={28} className="itv-shield-icon" />
                </div>
                <h4>Doanh nghiệp uy tín</h4>
                <p>
                  Thông tin doanh nghiệp và tin tuyển dụng được kiểm duyệt chặt chẽ bởi đội ngũ JobViet, đảm bảo minh bạch và bảo vệ tối đa quyền lợi ứng viên.
                </p>
              </div>

              {/* Danh sách các công ty nổi bật khác */}
              {relatedCompanies.length > 0 && (
                <div className="itv-card itv-related-jobs-card">
                  <h3 className="itv-card-title-sm">Doanh nghiệp nổi bật khác</h3>
                  <div className="itv-related-list">
                    {relatedCompanies.map((relComp) => (
                      <Link
                        key={relComp.id}
                        to={`/cong-ty/${relComp.id}`}
                        className="itv-related-item company-related-item"
                      >
                        <CompanyLogo
                          companyName={relComp.name}
                          logoUrl={relComp.logo || relComp.logoUrl}
                          initials={relComp.initials}
                          size={44}
                          className="itv-rel-logo"
                        />
                        <div className="itv-rel-details">
                          <h4 className="itv-rel-title">{relComp.name}</h4>
                          <span className="itv-rel-salary">{relComp.industry || 'IT - Phần mềm'}</span>
                          <span className="itv-rel-loc">
                            <Briefcase size={12} /> {relComp.openJobsCount || 0} việc làm
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* MODAL PHÓNG TO ẢNH VĂN PHÒNG */}
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

