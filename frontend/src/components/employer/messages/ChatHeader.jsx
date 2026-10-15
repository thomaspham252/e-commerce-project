import React from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { StatusBadge } from '../../common/StatusBadge';

/**
 * Component Header ngữ cảnh của khung chat
 * Hiển thị tên, vị trí, trạng thái hồ sơ, chấm online, nút Xem hồ sơ và nút Back trên di động
 */
export const ChatHeader = ({ conversation, onBack, onViewProfile }) => {
  if (!conversation) return null;

  const {
    candidateName,
    candidateAvatar,
    avatarFallback,
    jobTitle,
    applicationStatus,
    isOnline
  } = conversation;

  return (
    <div className="chat-header">
      <div className="chat-header-left">
        {/* Nút quay lại trên màn hình di động */}
        <button
          type="button"
          className="mobile-back-btn"
          onClick={onBack}
          title="Quay lại danh sách hội thoại"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Avatar & Online status */}
        <div className="chat-avatar-wrapper">
          {candidateAvatar ? (
            <img
              src={candidateAvatar}
              alt={candidateName}
              className="chat-avatar-img"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className="chat-avatar-fallback"
            style={{ display: candidateAvatar ? 'none' : 'flex' }}
          >
            {avatarFallback || candidateName.slice(0, 2).toUpperCase()}
          </div>
          <span
            className={`online-indicator ${isOnline ? 'online' : 'offline'}`}
            title={isOnline ? 'Đang trực tuyến' : 'Ngoại tuyến'}
          />
        </div>

        {/* Thông tin ngữ cảnh ứng viên */}
        <div className="chat-header-info">
          <div className="candidate-title-line">
            <h3 className="candidate-full-name">{candidateName}</h3>
            {isOnline ? (
              <span className="online-text">Đang hoạt động</span>
            ) : (
              <span className="offline-text">Ngoại tuyến</span>
            )}
          </div>

          <div className="chat-meta-row">
            <span className="job-meta-pill" title="Vị trí ứng tuyển">
              {jobTitle}
            </span>
            {applicationStatus && (
              <span className="status-badge-wrap">
                <StatusBadge status={applicationStatus} />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Nút hành động xem hồ sơ CV */}
      <div className="chat-header-right">
        <button
          type="button"
          className="btn-view-profile"
          onClick={onViewProfile}
          title="Xem chi tiết hồ sơ ứng viên"
        >
          <span>Xem hồ sơ</span>
          <ExternalLink size={15} />
        </button>
      </div>
    </div>
  );
};
