import React, { useState, useEffect, useCallback } from 'react';
import {
  FiSearch,
  FiMapPin,
  FiEye,
  FiUser,
  FiMail,
  FiPhone,
  FiFileText,
  FiCheckCircle,
  FiX,
  FiLock,
  FiUnlock,
  FiAlertCircle,
} from 'react-icons/fi';
import { useEmployerPackage } from '../../context/EmployerPackageContext.jsx';
import { employerService } from '../../services/employerService.js';
import { getErrorMessage } from '../../services/apiClient.js';
import { PackageLimitModal } from '../../components/employer/PackageLimitModal.jsx';
import './EmployerCandidateSearchPage.css';

/**
 * Trang Tìm Kiếm Hồ Sơ Ứng Viên (/employer/candidates).
 * Cho phép Nhà tuyển dụng tìm kiếm nhân tài trong kho ứng viên,
 * mở xem thông tin liên hệ và CV trong phạm vi hạn mức cv_view_limit của gói.
 */
export const EmployerCandidateSearchPage = () => {
  const { subscription, refreshSubscription } = useEmployerPackage();

  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Phân trang
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Chi tiết ứng viên & Modal
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [limitReason, setLimitReason] = useState('CV_LIMIT_REACHED');

  const fetchCandidates = useCallback(async (p = 0) => {
    try {
      setLoading(true);
      setError(null);
      const res = await employerService.getCandidates({
        keyword: keyword.trim() || undefined,
        location: location.trim() || undefined,
        page: p,
        size: 9,
      });
      setCandidates(res.content || []);
      setPage(res.page || 0);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      const msg = getErrorMessage(err);
      if (msg.includes('FEATURE_NOT_PERMITTED') || msg.includes('PACKAGE_REQUIRED')) {
        setError('Gói dịch vụ hiện tại của bạn chưa kích hoạt tính năng tìm kiếm trong kho ứng viên. Vui lòng nâng cấp lên Gói Pro hoặc Enterprise.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [keyword, location]);

  useEffect(() => {
    fetchCandidates(0);
  }, [fetchCandidates]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCandidates(0);
  };

  const handleOpenProfile = async (candidateId) => {
    try {
      setLoadingDetail(true);
      const detail = await employerService.getCandidateDetail(candidateId);
      setSelectedCandidate(detail);
      // Tải lại gói để cập nhật số lượt xem CV đã dùng
      refreshSubscription();
    } catch (err) {
      const msg = getErrorMessage(err);
      if (msg.includes('QUOTA_EXCEEDED')) {
        setLimitReason('CV_LIMIT_REACHED');
        setLimitModalOpen(true);
      } else if (msg.includes('PACKAGE_EXPIRED')) {
        setLimitReason('PACKAGE_EXPIRED');
        setLimitModalOpen(true);
      } else if (msg.includes('FEATURE_NOT_PERMITTED') || msg.includes('PACKAGE_REQUIRED')) {
        setLimitReason('NO_PERMISSION');
        setLimitModalOpen(true);
      } else {
        alert(msg);
      }
    } finally {
      setLoadingDetail(false);
    }
  };

  const isUnlimitedViews = subscription?.cvViewLimit == null;
  const usedViews = subscription?.usedCvViews || 0;
  const maxViews = subscription?.cvViewLimit;

  return (
    <div className="candidate-search-page">
      {/* Header */}
      <div className="candidate-search-header">
        <div>
          <h2 className="page-title">Kho Hồ Sơ Ứng Viên</h2>
          <p className="page-subtitle">
            Chủ động tìm kiếm và tiếp cận các ứng viên tiềm năng phù hợp với yêu cầu của doanh nghiệp.
          </p>
        </div>

        {subscription && (
          <div className="cv-quota-badge-box">
            <span className="cv-quota-label">
              <FiEye style={{ color: '#2563eb', marginRight: '6px' }} />
              Hạn mức xem hồ sơ kho:
            </span>
            <span className="cv-quota-count">
              <strong>{usedViews}</strong> / {isUnlimitedViews ? '∞' : maxViews} lượt
            </span>
          </div>
        )}
      </div>

      {/* Thanh tìm kiếm & bộ lọc */}
      <form className="candidate-filter-bar" onSubmit={handleSearchSubmit}>
        <div className="filter-input-wrapper">
          <FiSearch className="filter-icon" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, kỹ năng, kinh nghiệm..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div className="filter-input-wrapper filter-input-wrapper--location">
          <FiMapPin className="filter-icon" />
          <input
            type="text"
            placeholder="Địa điểm (Hà Nội, TP.HCM...)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary filter-submit-btn" disabled={loading}>
          {loading ? 'Đang tìm...' : 'Tìm kiếm'}
        </button>
      </form>

      {/* Thông báo lỗi phân quyền */}
      {error && (
        <div className="candidate-permission-alert">
          <FiAlertCircle className="alert-icon" />
          <div className="alert-content">
            <h4>Quyền lợi kho ứng viên bị giới hạn</h4>
            <p>{error}</p>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setLimitReason('NO_PERMISSION');
              setLimitModalOpen(true);
            }}
          >
            Xem bảng giá nâng gói
          </button>
        </div>
      )}

      {/* Danh sách ứng viên */}
      {!error && (
        <>
          {loading ? (
            <div className="candidates-loading-box">
              <div className="spinner" />
              <span>Đang tải danh sách hồ sơ ứng viên...</span>
            </div>
          ) : candidates.length === 0 ? (
            <div className="candidates-empty-box">
              <FiUser className="empty-icon" />
              <h3>Không tìm thấy ứng viên phù hợp</h3>
              <p>Hãy thử thay đổi từ khóa tìm kiếm hoặc mở rộng khu vực địa lý.</p>
            </div>
          ) : (
            <div className="candidates-grid">
              {candidates.map((cand) => (
                <div key={cand.userId} className="candidate-card">
                  <div className="cand-card-top">
                    <div className="cand-avatar-wrap">
                      {cand.avatar ? (
                        <img src={cand.avatar} alt={cand.fullName} className="cand-avatar-img" />
                      ) : (
                        <div className="cand-avatar-placeholder">
                          {cand.fullName ? cand.fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>

                    <div className="cand-header-meta">
                      <h3 className="cand-name">{cand.fullName}</h3>
                      {cand.address && (
                        <span className="cand-location">
                          <FiMapPin /> {cand.address}
                        </span>
                      )}
                      <span className="cand-level-badge">{cand.experienceLevel || 'Ứng viên'}</span>
                    </div>
                  </div>

                  <p className="cand-summary">
                    {cand.summary || 'Chưa cập nhật phần giới thiệu bản thân.'}
                  </p>

                  <div className="cand-card-footer">
                    <span className={`cand-status-pill ${cand.isUnlocked ? 'is-unlocked' : ''}`}>
                      {cand.isUnlocked ? (
                        <>
                          <FiUnlock /> Đã mở khóa
                        </>
                      ) : (
                        <>
                          <FiLock /> Chưa mở khóa
                        </>
                      )}
                    </span>

                    <button
                      type="button"
                      className="btn btn-outline cand-view-btn"
                      onClick={() => handleOpenProfile(cand.userId)}
                      disabled={loadingDetail}
                    >
                      <FiEye /> {cand.isUnlocked ? 'Xem chi tiết' : 'Mở khóa xem'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="candidates-pagination">
              <button
                type="button"
                className="btn btn-outline"
                disabled={page <= 0 || loading}
                onClick={() => fetchCandidates(page - 1)}
              >
                Trang trước
              </button>
              <span className="page-indicator">
                Trang {page + 1} / {totalPages} (Tổng cộng {totalElements} hồ sơ)
              </span>
              <button
                type="button"
                className="btn btn-outline"
                disabled={page >= totalPages - 1 || loading}
                onClick={() => fetchCandidates(page + 1)}
              >
                Trang sau
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal chi tiết ứng viên */}
      {selectedCandidate && (
        <div className="candidate-detail-modal-overlay" onClick={() => setSelectedCandidate(null)}>
          <div className="candidate-detail-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-button"
              onClick={() => setSelectedCandidate(null)}
            >
              <FiX />
            </button>

            <div className="modal-cand-header">
              <div className="cand-avatar-wrap cand-avatar-wrap--lg">
                {selectedCandidate.avatar ? (
                  <img
                    src={selectedCandidate.avatar}
                    alt={selectedCandidate.fullName}
                    className="cand-avatar-img"
                  />
                ) : (
                  <div className="cand-avatar-placeholder">
                    {selectedCandidate.fullName?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h3 className="modal-cand-name">{selectedCandidate.fullName}</h3>
                {selectedCandidate.hasAppliedToCompany && (
                  <span className="modal-applied-tag">
                    <FiCheckCircle /> Ứng viên đã nộp đơn vào tin tuyển dụng của công ty bạn
                  </span>
                )}
              </div>
            </div>

            <div className="modal-cand-body">
              <h4 className="modal-section-title">Thông tin liên hệ trực tiếp</h4>
              <div className="modal-contact-row">
                <div className="contact-item">
                  <FiMail className="contact-icon" />
                  <span>
                    Email: <strong>{selectedCandidate.email || 'Chưa cung cấp'}</strong>
                  </span>
                </div>
                <div className="contact-item">
                  <FiPhone className="contact-icon" />
                  <span>
                    SĐT: <strong>{selectedCandidate.phone || 'Chưa cung cấp'}</strong>
                  </span>
                </div>
                {selectedCandidate.address && (
                  <div className="contact-item">
                    <FiMapPin className="contact-icon" />
                    <span>Địa chỉ: {selectedCandidate.address}</span>
                  </div>
                )}
              </div>

              <h4 className="modal-section-title" style={{ marginTop: '20px' }}>
                Giới thiệu bản thân
              </h4>
              <p className="modal-summary-text">
                {selectedCandidate.summary || 'Chưa có thông tin tóm tắt.'}
              </p>

              <h4 className="modal-section-title" style={{ marginTop: '20px' }}>
                Danh sách CV đính kèm
              </h4>
              {selectedCandidate.cvs && selectedCandidate.cvs.length > 0 ? (
                <div className="modal-cvs-list">
                  {selectedCandidate.cvs.map((cv) => (
                    <div key={cv.id} className="cv-item-card">
                      <div className="cv-item-info">
                        <FiFileText className="cv-icon" />
                        <div>
                          <strong>{cv.fileName || 'CV Ứng viên'}</strong>
                          {cv.isDefault && <span className="cv-default-tag">Mặc định</span>}
                        </div>
                      </div>
                      <a
                        href={cv.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary btn-sm"
                      >
                        Tải / Xem CV
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted" style={{ fontSize: '13px' }}>
                  Ứng viên chưa tải lên CV dạng tập tin.
                </p>
              )}
            </div>

            <div className="modal-cand-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelectedCandidate(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal giới hạn gói khi hết hạn mức xem CV */}
      <PackageLimitModal
        isOpen={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        reason={limitReason}
        currentSubscription={subscription}
      />
    </div>
  );
};

