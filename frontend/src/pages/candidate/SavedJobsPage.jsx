import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Clock, Heart, Search, Trash2 } from 'lucide-react';
import { JobCard } from '../../components/JobCard';
import { useSavedJobs } from '../../context/SavedJobsContext';
import { jobService } from '../../services/jobService';
import './CandidateShared.css';
import './SavedJobsPage.css';

export const SavedJobsPage = () => {
  const { savedJobIds, toggleSaveJob } = useSavedJobs();
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  // Tải một lần toàn bộ tin, sau đó lọc theo danh sách đã lưu ở client.
  // Nhờ vậy bỏ lưu một tin không khiến cả trang phải tải lại.
  useEffect(() => {
    let active = true;

    const loadJobs = async () => {
      try {
        const data = await jobService.getJobs();
        if (active) setAllJobs(data);
      } catch (err) {
        console.error('Không tải được danh sách việc làm đã lưu', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadJobs();
    return () => {
      active = false;
    };
  }, []);

  const savedJobs = useMemo(() => {
    return allJobs.filter(job => savedJobIds.has(job.id));
  }, [allJobs, savedJobIds]);

  const visibleJobs = useMemo(() => {
    const term = keyword.trim().toLowerCase();
    if (!term) return savedJobs;
    return savedJobs.filter(
      job =>
        job.title.toLowerCase().includes(term) ||
        job.companyName.toLowerCase().includes(term) ||
        job.location.toLowerCase().includes(term)
    );
  }, [savedJobs, keyword]);

  const handleClearAll = () => {
    savedJobs.forEach(job => toggleSaveJob(job.id));
    setKeyword('');
  };

  return (
    <div className="cd-page saved-jobs-page">
      <div className="container">
        <nav className="cd-breadcrumb" aria-label="Đường dẫn">
          <Link to="/">Trang chủ</Link>
          <ChevronRight size={14} />
          <span className="cd-breadcrumb-current">Việc làm đã lưu</span>
        </nav>

        <div className="sj-head">
          <div className="cd-page-head">
            <h1>Việc làm đã lưu</h1>
            <p>
              {savedJobs.length > 0
                ? `Bạn đang lưu ${savedJobs.length} tin tuyển dụng. Ứng tuyển sớm để không bỏ lỡ cơ hội.`
                : 'Lưu lại những tin tuyển dụng bạn quan tâm để xem lại sau.'}
            </p>
          </div>

          {savedJobs.length > 0 && (
            <div className="sj-tools">
              <div className="sj-search">
                <Search size={18} />
                <input
                  type="text"
                  value={keyword}
                  onChange={event => setKeyword(event.target.value)}
                  placeholder="Tìm trong tin đã lưu..."
                  aria-label="Tìm trong tin đã lưu"
                />
              </div>
              <button className="cd-btn-ghost cd-btn-danger" type="button" onClick={handleClearAll}>
                <Trash2 size={16} />
                Bỏ lưu tất cả
              </button>
            </div>
          )}
        </div>

        {loading && (
          <div className="cd-state">
            <div className="cd-state-icon">
              <Clock size={30} />
            </div>
            <h3>Đang tải danh sách...</h3>
            <p>Vui lòng chờ trong giây lát.</p>
          </div>
        )}

        {/* Chưa lưu tin nào */}
        {!loading && savedJobs.length === 0 && (
          <div className="cd-state">
            <div className="cd-state-icon">
              <Heart size={30} />
            </div>
            <h3>Bạn chưa lưu tin tuyển dụng nào</h3>
            <p>
              Nhấn vào biểu tượng trái tim trên mỗi tin tuyển dụng để lưu lại. Những tin đã lưu sẽ
              xuất hiện ở đây.
            </p>
            <Link to="/" className="btn btn-primary">
              Khám phá việc làm
            </Link>
          </div>
        )}

        {/* Đã lưu nhưng từ khoá tìm kiếm không khớp */}
        {!loading && savedJobs.length > 0 && visibleJobs.length === 0 && (
          <div className="cd-state">
            <div className="cd-state-icon">
              <Search size={30} />
            </div>
            <h3>Không có tin nào khớp với "{keyword}"</h3>
            <p>Thử từ khoá khác hoặc xoá ô tìm kiếm để xem lại toàn bộ tin đã lưu.</p>
            <button className="btn btn-primary" type="button" onClick={() => setKeyword('')}>
              Xem tất cả tin đã lưu
            </button>
          </div>
        )}

        {!loading && visibleJobs.length > 0 && (
          <div className="sj-grid">
            {visibleJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
