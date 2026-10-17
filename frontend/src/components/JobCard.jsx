import React from 'react';
import './JobCard.css';
import { formatSalary } from '../utils/formatSalary';
import { useSavedJobs } from '../context/SavedJobsContext';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';
import { CompanyLogo } from './CompanyLogo';

export const JobCard = ({ job }) => {
  const { toggleSaveJob, isJobSaved } = useSavedJobs();
  const saved = isJobSaved(job.id);

  return (
    <div className="job-card">
      <div className="job-card-header">
        <CompanyLogo
          companyName={job.companyName}
          logoUrl={job.companyLogo}
          initials={job.companyInitials || job.initials}
          size={48}
        />
        <div className="job-info">
          <Link to={`/viec-lam/${job.id}`} className="job-title-link">
            <h3 className="job-title">{job.title}</h3>
          </Link>
          <p className="company-name">{job.companyName}</p>
        </div>
        <button 
          className={`save-btn ${saved ? 'saved' : ''}`}
          aria-label={saved ? "Bỏ lưu việc làm" : "Lưu việc làm"}
          onClick={() => toggleSaveJob(job.id)}
          title={saved ? "Đã lưu việc làm" : "Lưu việc làm"}
        >
          <Icon
            name="heart"
            size="job"
            className={`heart-icon ${saved ? 'is-saved' : ''}`}
          />
        </button>
      </div>

      <div className="job-tags">
        {job.isHot && (
          <span className="badge badge-hot">
            <Icon name="flame" size="badge" />
            <span>Hot</span>
          </span>
        )}
        {job.isNew && (
          <span className="badge badge-orange">
            <Icon name="sparkles" size="badge" />
            <span>Mới</span>
          </span>
        )}
        <span className="badge badge-green">
          <Icon name="briefcase" size="badge" />
          <span>Toàn thời gian</span>
        </span>
      </div>

      <div className="job-card-body">
        <span className="salary">
          <Icon name="banknote" size="meta" />
          <span>{formatSalary(job.salary)}</span>
        </span>
        <span className="location">
          <Icon name="map-pin" size="meta" />
          <span>{job.location}</span>
        </span>
      </div>

      <div className="job-card-footer">
        <span className="job-time">
          <Icon name="clock" size="meta" style={{ marginRight: '4px' }} />
          {job.timeAgo}
        </span>
        <Link to={`/viec-lam/${job.id}/ung-tuyen`} className="btn btn-primary btn-apply">
          Ứng tuyển
        </Link>
      </div>
    </div>
  );
};
