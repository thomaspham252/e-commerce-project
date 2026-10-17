import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Inbox,
  MapPin,
  Search,
  Trash2
} from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useApplications } from '../../context/ApplicationsContext';
import { APPLICATION_STATUS } from '../../services/candidateData';
import './CandidateShared.css';
import './ApplicationHistoryPage.css';

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: APPLICATION_STATUS.SUBMITTED, label: APPLICATION_STATUS.SUBMITTED },
  { key: APPLICATION_STATUS.REVIEWING, label: APPLICATION_STATUS.REVIEWING },
  { key: APPLICATION_STATUS.INTERVIEW, label: APPLICATION_STATUS.INTERVIEW },
  { key: APPLICATION_STATUS.HIRED, label: APPLICATION_STATUS.HIRED },
  { key: APPLICATION_STATUS.REJECTED, label: APPLICATION_STATUS.REJECTED }
];

export const ApplicationHistoryPage = () => {
  const { applications, loading, withdrawApplication } = useApplications();
  const [activeFilter, setActiveFilter] = useState('all');
  const [keyword, setKeyword] = useState('');

  const counts = useMemo(() => {
    const result = { all: applications.length };
    FILTERS.slice(1).forEach(filter => {
      result[filter.key] = applications.filter(item => item.status === filter.key).length;
    });
    return result;
  }, [applications]);

  const visibleApplications = useMemo(() => {
    const term = keyword.trim().toLowerCase();

    return applications.filter(item => {
      const matchStatus = activeFilter === 'all' || item.status === activeFilter;
      const matchKeyword =
        !term ||
        item.jobTitle.toLowerCase().includes(term) ||
        item.companyName.toLowerCase().includes(term);
      return matchStatus && matchKeyword;
    });
  }, [applications, activeFilter, keyword]);

  const columns = [
    {
      header: 'Vị trí ứng tuyển',
      width: '32%',
      render: row => (
        <div className="ah-job-cell">
          <div className="ah-job-logo">
            <img
              src={row.companyLogo}
              alt={row.companyName}
              onError={event => {
                // Gỡ handler trước khi đổi src để tránh lặp vô hạn nếu ảnh dự phòng cũng lỗi
                event.currentTarget.onerror = null;
                event.currentTarget.src = '/images/companies/default.svg';
              }}
            />
          </div>
          <div className="ah-job-text">
            <Link to={`/viec-lam/${row.jobId}`} className="ah-job-title">
              {row.jobTitle}
            </Link>
            <span className="ah-job-company">{row.companyName}</span>
            <span className="ah-job-location">
              <MapPin size={12} />
              {row.location}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'CV đã gửi',
      width: '20%',
      render: row => (
        <div className="ah-cv-cell">
          <FileText size={16} />
          <span>{row.cvName}</span>
        </div>
      )
    },
    {
      header: 'Ngày ứng tuyển',
      width: '13%',
      render: row => (
        <div className="ah-date-cell">
          <CalendarClock size={14} />
          {row.appliedAt}
        </div>
      )
    },
    {
      header: 'Trạng thái',
      width: '20%',
      render: row => (
        <div className="ah-status-cell">
          <StatusBadge status={row.status} />
          {row.note && <span className="ah-note">{row.note}</span>}
        </div>
      )
    },
    {
      header: 'Thao tác',
      width: '15%',
      render: row => (
        <div className="ah-action-cell">
          <Link to={`/viec-lam/${row.jobId}`} className="ah-action-btn" title="Xem lại tin tuyển dụng">
            <Eye size={16} />
            Xem tin
          </Link>
          {row.status !== APPLICATION_STATUS.HIRED && (
            <button
              className="ah-action-btn ah-action-danger"
              type="button"
              title="Rút hồ sơ ứng tuyển"
              onClick={() => withdrawApplication(row.id)}
            >
              <Trash2 size={16} />
              Rút hồ sơ
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="cd-page application-history-page">
      <div className="container">
        <nav className="cd-breadcrumb" aria-label="Đường dẫn">
          <Link to="/">Trang chủ</Link>
          <ChevronRight size={14} />
          <span className="cd-breadcrumb-current">Lịch sử ứng tuyển</span>
        </nav>

        <div className="cd-page-head">
          <h1>Lịch sử ứng tuyển</h1>
          <p>Theo dõi trạng thái từng hồ sơ bạn đã gửi tới nhà tuyển dụng.</p>
        </div>

        {/* Thống kê nhanh theo trạng thái */}
        <div className="ah-stats">
          <div className="ah-stat">
            <span className="ah-stat-icon ah-icon-neutral">
              <Inbox size={20} />
            </span>
            <div>
              <strong>{counts.all}</strong>
              <span>Tổng hồ sơ</span>
            </div>
          </div>
          <div className="ah-stat">
            <span className="ah-stat-icon ah-icon-warning">
              <Clock size={20} />
            </span>
            <div>
              <strong>{counts[APPLICATION_STATUS.REVIEWING] || 0}</strong>
              <span>Đang xem xét</span>
            </div>
          </div>
          <div className="ah-stat">
            <span className="ah-stat-icon ah-icon-info">
              <CalendarClock size={20} />
            </span>
            <div>
              <strong>{counts[APPLICATION_STATUS.INTERVIEW] || 0}</strong>
              <span>Lời mời phỏng vấn</span>
            </div>
          </div>
          <div className="ah-stat">
            <span className="ah-stat-icon ah-icon-success">
              <CheckCircle2 size={20} />
            </span>
            <div>
              <strong>{counts[APPLICATION_STATUS.HIRED] || 0}</strong>
              <span>Được tuyển</span>
            </div>
          </div>
        </div>

        {/* Bộ lọc theo trạng thái + ô tìm kiếm */}
        <div className="ah-toolbar">
          <div className="ah-filters" role="tablist" aria-label="Lọc theo trạng thái">
            {FILTERS.map(filter => (
              <button
                key={filter.key}
                className={`ah-filter ${activeFilter === filter.key ? 'is-active' : ''}`}
                type="button"
                role="tab"
                aria-selected={activeFilter === filter.key}
                onClick={() => setActiveFilter(filter.key)}
              >
                {filter.label}
                <span className="ah-filter-count">{counts[filter.key] || 0}</span>
              </button>
            ))}
          </div>

          <div className="ah-search">
            <Search size={18} />
            <input
              type="text"
              value={keyword}
              onChange={event => setKeyword(event.target.value)}
              placeholder="Tìm theo vị trí hoặc công ty..."
              aria-label="Tìm trong lịch sử ứng tuyển"
            />
          </div>
        </div>

        {loading && (
          <div className="cd-state">
            <div className="cd-state-icon">
              <Clock size={30} />
            </div>
            <h3>Đang tải lịch sử ứng tuyển...</h3>
            <p>Vui lòng chờ trong giây lát.</p>
          </div>
        )}

        {/* Chưa từng ứng tuyển */}
        {!loading && applications.length === 0 && (
          <div className="cd-state">
            <div className="cd-state-icon">
              <Inbox size={30} />
            </div>
            <h3>Bạn chưa ứng tuyển vị trí nào</h3>
            <p>
              Khi bạn gửi hồ sơ cho một tin tuyển dụng, hồ sơ đó sẽ xuất hiện tại đây cùng trạng
              thái xử lý của nhà tuyển dụng.
            </p>
            <Link to="/" className="btn btn-primary">
              Tìm việc làm ngay
            </Link>
          </div>
        )}

        {!loading && applications.length > 0 && (
          <DataTable columns={columns} data={visibleApplications} searchable={false} />
        )}
      </div>
    </div>
  );
};
