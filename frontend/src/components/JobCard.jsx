import './JobCard.css';
import { formatSalary } from '../utils/formatSalary';
import { useSavedJobs } from '../context/SavedJobsContext';
import { useState } from 'react';

export const JobCard = ({ job }) => {
  const { toggleSaveJob, isJobSaved } = useSavedJobs();
  const saved = isJobSaved(job.id);
  const [imageError, setImageError] = useState(false);

  const fallbackLogo = "/images/companies/default.svg";

  return (
    <div className="job-card">
      <div className="job-card-header">
        <div className="company-logo-wrapper">
          <img 
            src={imageError ? fallbackLogo : job.companyLogo} 
            alt={job.companyName} 
            className="company-logo"
            onError={() => setImageError(true)}
          />
        </div>
        <div className="job-info">
          <h3 className="job-title">{job.title}</h3>
          <p className="company-name">{job.companyName}</p>
        </div>
        <button 
          className={`save-btn ${saved ? 'saved' : ''}`}
          aria-label={saved ? "Unsave Job" : "Save Job"}
          onClick={() => toggleSaveJob(job.id)}
        >
          {saved ? '❤️' : '🤍'}
        </button>
      </div>
      <div className="job-tags">
        {job.isHot && <span className="badge badge-hot">🔥 Hot</span>}
        {job.isNew && <span className="badge badge-orange">✨ Mới</span>}
        <span className="badge badge-green">Toàn thời gian</span>
      </div>
      <div className="job-card-body">
        <span className="salary">💰 {formatSalary(job.salary)}</span>
        <span className="location">📍 {job.location}</span>
      </div>
      <div className="job-card-footer">
        <span className="job-time">{job.timeAgo}</span>
        <button className="btn btn-primary btn-apply">Ứng tuyển</button>
      </div>
    </div>
  );
};
