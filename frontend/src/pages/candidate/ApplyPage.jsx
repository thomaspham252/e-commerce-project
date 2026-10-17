import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  MapPin,
  PartyPopper,
  PenLine,
  Send,
  ShieldCheck,
  Upload,
  Wallet
} from 'lucide-react';
import { useApplications } from '../../context/ApplicationsContext';
import { jobService } from '../../services/jobService';
import { formatSalary } from '../../utils/formatSalary';
import './CandidateShared.css';
import './ApplyPage.css';

const COVER_LETTER_MAX = 1500;

export const ApplyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addApplication, hasApplied } = useApplications();

  const [job, setJob] = useState(null);
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCvId, setSelectedCvId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const [detail, cvList] = await Promise.all([
          jobService.getJobById(id),
          jobService.getCvs()
        ]);
        if (!active) return;
        setJob(detail);
        setCvs(cvList);
        const defaultCv = cvList.find(cv => cv.isDefault) || cvList[0];
        if (defaultCv) setSelectedCvId(defaultCv.id);
      } catch (err) {
        console.error('Không tải được dữ liệu ứng tuyển', err);
        if (active) setJob(null);
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

  const validate = () => {
    const nextErrors = {};

    if (!selectedCvId) {
      nextErrors.cv = 'Vui lòng chọn một CV để gửi cho nhà tuyển dụng.';
    }
    if (coverLetter.trim().length > 0 && coverLetter.trim().length < 50) {
      nextErrors.coverLetter = 'Thư giới thiệu nên dài tối thiểu 50 ký tự để thể hiện rõ mong muốn của bạn.';
    }
    if (!confirmed) {
      nextErrors.confirmed = 'Bạn cần xác nhận thông tin trước khi gửi hồ sơ.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    // Mô phỏng thời gian gọi API gửi hồ sơ
    await new Promise(resolve => setTimeout(resolve, 700));

    const selectedCv = cvs.find(cv => cv.id === selectedCvId);
    addApplication({
      job,
      cvName: selectedCv.name,
      coverLetter: coverLetter.trim()
    });

    setSubmitting(false);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="cd-page">
        <div className="container">
          <div className="cd-state">
            <div className="cd-state-icon">
              <Clock size={30} />
            </div>
            <h3>Đang tải form ứng tuyển...</h3>
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
            <p>Tin này có thể đã được gỡ nên bạn không thể ứng tuyển.</p>
            <Link to="/" className="btn btn-primary">
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* Đã gửi hồ sơ thành công */
  if (submitted) {
    return (
      <div className="cd-page">
        <div className="container">
          <div className="ap-success">
            <div className="ap-success-icon">
              <PartyPopper size={36} />
            </div>
            <h1>Gửi hồ sơ thành công!</h1>
            <p>
              Hồ sơ của bạn cho vị trí <strong>{job.title}</strong> tại{' '}
              <strong>{job.companyName}</strong> đã được gửi đi. Nhà tuyển dụng sẽ phản hồi qua
              email trong vòng 3 - 5 ngày làm việc.
            </p>
            <div className="ap-success-actions">
              <Link to="/lich-su-ung-tuyen" className="btn btn-primary">
                Xem lịch sử ứng tuyển
              </Link>
              <Link to="/" className="cd-btn-ghost">
                Tiếp tục tìm việc
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* Đã ứng tuyển trước đó */
  if (hasApplied(job.id)) {
    return (
      <div className="cd-page">
        <div className="container">
          <div className="cd-state">
            <div className="cd-state-icon">
              <CheckCircle2 size={30} />
            </div>
            <h3>Bạn đã ứng tuyển vị trí này</h3>
            <p>
              Mỗi tin tuyển dụng chỉ nhận một hồ sơ từ bạn. Hãy theo dõi trạng thái trong lịch sử
              ứng tuyển.
            </p>
            <Link to="/lich-su-ung-tuyen" className="btn btn-primary">
              Xem lịch sử ứng tuyển
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cd-page apply-page">
      <div className="container">
        <nav className="cd-breadcrumb" aria-label="Đường dẫn">
          <Link to="/">Trang chủ</Link>
          <ChevronRight size={14} />
          <Link to={`/viec-lam/${job.id}`}>{job.title}</Link>
          <ChevronRight size={14} />
          <span className="cd-breadcrumb-current">Ứng tuyển</span>
        </nav>

        <button className="ap-back" type="button" onClick={() => navigate(`/viec-lam/${job.id}`)}>
          <ArrowLeft size={16} />
          Quay lại chi tiết tin
        </button>

        <div className="cd-page-head">
          <h1>Ứng tuyển vị trí</h1>
          <p>Kiểm tra lại thông tin bên dưới rồi gửi hồ sơ tới nhà tuyển dụng.</p>
        </div>

        <div className="ap-layout">
          <form className="ap-form" onSubmit={handleSubmit} noValidate>
            {/* Bước 1: chọn CV */}
            <section className="cd-card">
              <div className="ap-step-head">
                <span className="ap-step-number">1</span>
                <div>
                  <h2 className="ap-step-title">Chọn CV ứng tuyển</h2>
                  <p className="ap-step-desc">Nhà tuyển dụng sẽ nhận được bản CV bạn chọn dưới đây.</p>
                </div>
              </div>

              <div className="ap-cv-list" role="radiogroup" aria-label="Chọn CV ứng tuyển">
                {cvs.map(cv => (
                  <label
                    key={cv.id}
                    className={`ap-cv-item ${selectedCvId === cv.id ? 'is-selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="cv"
                      value={cv.id}
                      checked={selectedCvId === cv.id}
                      onChange={() => {
                        setSelectedCvId(cv.id);
                        setErrors(prev => ({ ...prev, cv: undefined }));
                      }}
                    />
                    <span className="ap-cv-radio" aria-hidden="true" />
                    <span className="ap-cv-icon">
                      <FileText size={20} />
                    </span>
                    <span className="ap-cv-info">
                      <span className="ap-cv-name">
                        {cv.name}
                        {cv.isDefault && <span className="ap-cv-default">Mặc định</span>}
                      </span>
                      <span className="ap-cv-meta">
                        Cập nhật {cv.updatedAt} · {cv.size}
                      </span>
                    </span>
                  </label>
                ))}
              </div>

              <button className="ap-upload" type="button">
                <Upload size={17} />
                Tải lên CV mới từ máy tính
              </button>

              {errors.cv && (
                <p className="ap-error" role="alert">
                  <AlertCircle size={15} />
                  {errors.cv}
                </p>
              )}
            </section>

            {/* Bước 2: thư giới thiệu */}
            <section className="cd-card">
              <div className="ap-step-head">
                <span className="ap-step-number">2</span>
                <div>
                  <h2 className="ap-step-title">
                    Thư giới thiệu <span className="ap-optional">(không bắt buộc)</span>
                  </h2>
                  <p className="ap-step-desc">
                    Một lá thư ngắn nêu rõ điểm mạnh và lý do bạn phù hợp sẽ tăng đáng kể cơ hội được
                    chú ý.
                  </p>
                </div>
              </div>

              <div className="ap-field">
                <label htmlFor="coverLetter" className="ap-label">
                  <PenLine size={16} />
                  Nội dung thư
                </label>
                <textarea
                  id="coverLetter"
                  className={`ap-textarea ${errors.coverLetter ? 'has-error' : ''}`}
                  rows={9}
                  maxLength={COVER_LETTER_MAX}
                  value={coverLetter}
                  onChange={event => {
                    setCoverLetter(event.target.value);
                    setErrors(prev => ({ ...prev, coverLetter: undefined }));
                  }}
                  placeholder={`Kính gửi bộ phận tuyển dụng ${job.companyName},\n\nTôi rất quan tâm tới vị trí ${job.title}. Với kinh nghiệm...`}
                />
                <div className="ap-textarea-footer">
                  {errors.coverLetter ? (
                    <span className="ap-error" role="alert">
                      <AlertCircle size={15} />
                      {errors.coverLetter}
                    </span>
                  ) : (
                    <span className="ap-hint">Gợi ý: nêu 2 - 3 thành tích nổi bật liên quan tới vị trí.</span>
                  )}
                  <span className="ap-counter">
                    {coverLetter.length}/{COVER_LETTER_MAX}
                  </span>
                </div>
              </div>
            </section>

            {/* Bước 3: xác nhận và gửi */}
            <section className="cd-card">
              <div className="ap-step-head">
                <span className="ap-step-number">3</span>
                <div>
                  <h2 className="ap-step-title">Xác nhận và gửi hồ sơ</h2>
                  <p className="ap-step-desc">Hãy kiểm tra lại lần cuối trước khi gửi.</p>
                </div>
              </div>

              <div className="ap-review">
                <div className="ap-review-row">
                  <span>Vị trí ứng tuyển</span>
                  <strong>{job.title}</strong>
                </div>
                <div className="ap-review-row">
                  <span>Công ty</span>
                  <strong>{job.companyName}</strong>
                </div>
                <div className="ap-review-row">
                  <span>CV đã chọn</span>
                  <strong>{cvs.find(cv => cv.id === selectedCvId)?.name || 'Chưa chọn'}</strong>
                </div>
                <div className="ap-review-row">
                  <span>Thư giới thiệu</span>
                  <strong>
                    {coverLetter.trim() ? `${coverLetter.trim().length} ký tự` : 'Không gửi kèm'}
                  </strong>
                </div>
              </div>

              <label className={`ap-confirm ${errors.confirmed ? 'has-error' : ''}`}>
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={event => {
                    setConfirmed(event.target.checked);
                    setErrors(prev => ({ ...prev, confirmed: undefined }));
                  }}
                />
                <span>
                  Tôi xác nhận các thông tin trong hồ sơ là chính xác và đồng ý cho JobViet chia sẻ
                  CV này với <strong>{job.companyName}</strong>.
                </span>
              </label>

              {errors.confirmed && (
                <p className="ap-error" role="alert">
                  <AlertCircle size={15} />
                  {errors.confirmed}
                </p>
              )}

              <div className="ap-submit-row">
                <button className="btn btn-primary ap-submit" type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Clock size={18} />
                      Đang gửi hồ sơ...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Gửi hồ sơ ứng tuyển
                    </>
                  )}
                </button>
                <Link to={`/viec-lam/${job.id}`} className="cd-btn-ghost">
                  Huỷ
                </Link>
              </div>

              <p className="ap-privacy">
                <ShieldCheck size={15} />
                Thông tin của bạn được bảo mật và chỉ hiển thị với nhà tuyển dụng của tin này.
              </p>
            </section>
          </form>

          {/* Tóm tắt tin đang ứng tuyển */}
          <aside className="ap-sidebar">
            <section className="cd-card ap-job-card">
              <span className="ap-job-label">Bạn đang ứng tuyển</span>
              <h2 className="ap-job-title">{job.title}</h2>
              <Link to={`/viec-lam/${job.id}`} className="ap-job-company">
                <Building2 size={15} />
                {job.companyName}
              </Link>

              <ul className="ap-job-facts">
                <li>
                  <Wallet size={16} />
                  <span className="ap-job-salary">{formatSalary(job.salary)}</span>
                </li>
                <li>
                  <MapPin size={16} />
                  <span>{job.location}</span>
                </li>
                <li>
                  <Clock size={16} />
                  <span>Hạn nộp: {job.deadline}</span>
                </li>
              </ul>

              <div className="ap-job-skills">
                <span className="cd-meta-label">Kỹ năng yêu cầu</span>
                <div className="cd-chip-row">
                  {job.skills.slice(0, 4).map(skill => (
                    <span key={skill} className="cd-chip">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="cd-card ap-tips">
              <h3>Mẹo tăng cơ hội được gọi</h3>
              <ul className="cd-list">
                <li>
                  <CheckCircle2 size={16} />
                  <span>Chọn CV có kinh nghiệm sát nhất với vị trí này.</span>
                </li>
                <li>
                  <CheckCircle2 size={16} />
                  <span>Viết thư giới thiệu riêng cho từng công ty, tránh dùng mẫu chung.</span>
                </li>
                <li>
                  <CheckCircle2 size={16} />
                  <span>Nêu con số cụ thể khi mô tả thành tích của bạn.</span>
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};
