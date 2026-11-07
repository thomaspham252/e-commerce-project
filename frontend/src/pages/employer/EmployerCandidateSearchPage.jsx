import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FiMessageSquare,
  FiBriefcase,
  FiDownload,
  FiCopy,
  FiCheck,
} from 'react-icons/fi';
import { useEmployerPackage } from '../../context/EmployerPackageContext.jsx';
import { employerService } from '../../services/employerService.js';
import { getOrCreateConversationForCandidate } from '../../services/employerMessagesService.js';
import { getErrorMessage } from '../../services/apiClient.js';
import { PackageLimitModal } from '../../components/employer/PackageLimitModal.jsx';
import './EmployerCandidateSearchPage.css';

/**
 * Trang Tìm Kiếm Hồ Sơ Ứng Viên (/employer/candidates).
 * Cho phép Nhà tuyển dụng tìm kiếm ứng viên trong kho tài năng,
 * mở xem thông tin liên hệ và CV trong phạm vi hạn mức cv_view_limit của gói.
 * Hỗ trợ Chat trực tiếp với ứng viên ngay từ màn hình chi tiết hoặc thẻ đã mở khóa.
 */
export const EmployerCandidateSearchPage = () => {
  const navigate = useNavigate();
  const { subscription, refreshSubscription } = useEmployerPackage();

  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Phân trang: 9 ứng viên/trang (3 dòng x 3 cột)
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Chi tiết ứng viên & Modal
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
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
      refreshSubscription();
      // Cập nhật trạng thái isUnlocked cục bộ cho ứng viên trong danh sách kèm email và phone thực tế
      setCandidates((prev) =>
        prev.map((c) => (c.userId === candidateId ? { ...c, isUnlocked: true, email: detail.email, phone: detail.phone } : c))
      );
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

  const handleStartChat = async (cand) => {
    if (!cand) return;
    const canChat = Boolean(subscription?.allowRealtimeChat) || cand.hasAppliedToCompany;
    if (!canChat) {
      setLimitReason('NO_PERMISSION');
      setLimitModalOpen(true);
      return;
    }

    try {
      setStartingChat(true);
      await getOrCreateConversationForCandidate({
        candidateId: cand.userId,
        candidateName: cand.fullName,
      });
      setSelectedCandidate(null);
      navigate(`/employer/messages?candidateId=${cand.userId}`);
    } catch (err) {
      console.error('Lỗi khi mở cuộc trò chuyện với ứng viên:', err);
      setSelectedCandidate(null);
      navigate(`/employer/messages?candidateId=${cand.userId}`);
    } finally {
      setStartingChat(false);
    }
  };

  const handleCopy = (text, field) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isUnlimitedViews = subscription?.cvViewLimit == null;
  const usedViews = subscription?.usedCvViews || 0;
  const maxViews = subscription?.cvViewLimit;

  return (
    <div className="candidate-search-page">
      {/* Header & Hạn mức */}
      <div className="candidate-search-header">
        <div className="header-text-block">
          <h2 className="page-title">Kho Hồ Sơ Ứng Viên</h2>
          <p className="page-subtitle">
            Chủ động tìm kiếm và tiếp cận các ứng viên tiềm năng phù hợp với yêu cầu của doanh nghiệp.
          </p>
        </div>

        {subscription && (
          <div className="cv-quota-pill" title="Hạn mức xem chi tiết hồ sơ trong gói hiện tại">
            <FiEye className="quota-pill-icon" />
            <span className="quota-pill-label">Hạn mức xem hồ sơ kho:</span>
            <span className="quota-pill-count">
              <strong>{usedViews}</strong> / {isUnlimitedViews ? '∞' : maxViews} lượt
            </span>
          </div>
        )}
      </div>

      {/* Thanh tìm kiếm & bộ lọc tích hợp chuẩn mực */}
      <form className="candidate-filter-bar" onSubmit={handleSearchSubmit}>
        <div className="filter-field-wrapper filter-field-keyword">
          <FiSearch className="filter-icon" />
          <input
            type="text"
            className="filter-input"
            placeholder="Tìm theo họ tên, kỹ năng, kinh nghiệm..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          {keyword && (
            <button
              type="button"
              className="filter-clear-btn"
              onClick={() => setKeyword('')}
              title="Xóa từ khóa"
            >
              <FiX size={14} />
            </button>
          )}
        </div>

        <div className="filter-divider" />

        <div className="filter-field-wrapper filter-field-location">
          <FiMapPin className="filter-icon" />
          <input
            type="text"
            className="filter-input"
            placeholder="Địa điểm (Hà Nội, TP.HCM...)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          {location && (
            <button
              type="button"
              className="filter-clear-btn"
              onClick={() => setLocation('')}
              title="Xóa địa điểm"
            >
              <FiX size={14} />
            </button>
          )}
        </div>

        <button type="submit" className="filter-submit-btn" disabled={loading}>
          <FiSearch className="submit-btn-icon" />
          <span>{loading ? 'Đang tìm...' : 'Tìm kiếm'}</span>
        </button>
      </form>

      {/* Cảnh báo phân quyền gói */}
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

      {/* Danh sách 9 ứng viên (3 dòng x 3 cột) */}
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
                <div
                  key={cand.userId}
                  className={`candidate-card ${cand.isUnlocked ? 'is-unlocked-card' : ''}`}
                >
                  {/* Header thẻ: Avatar, Tên, Cấp bậc, Địa điểm và Huy hiệu */}
                  <div className="cand-card-header">
                    <div className="cand-avatar-wrap">
                      {cand.avatar ? (
                        <img src={cand.avatar} alt={cand.fullName} className="cand-avatar-img" />
                      ) : (
                        <div className="cand-avatar-placeholder">
                          {cand.fullName ? cand.fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <span className="cand-avatar-status-dot" title="Sẵn sàng nhận việc" />
                    </div>

                    <div className="cand-header-meta">
                      <div className="cand-name-row">
                        <h3 className="cand-name" title={cand.fullName}>{cand.fullName}</h3>
                        <span className={`cand-status-badge ${cand.isUnlocked ? 'is-unlocked' : 'is-locked'}`}>
                          {cand.isUnlocked ? (
                            <>
                              <FiUnlock size={13} /> Đã mở khóa
                            </>
                          ) : (
                            <>
                              <FiLock size={13} /> Chưa mở khóa
                            </>
                          )}
                        </span>
                      </div>
                      <div className="cand-subline">
                        <span className="cand-subline-item">
                          <FiBriefcase size={12} /> {cand.experienceLevel || 'Chuyên viên'}
                        </span>
                        <span className="cand-subline-dot">•</span>
                        <span className="cand-subline-item">
                          <FiMapPin size={12} /> {cand.address || 'Toàn quốc'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Khung thông tin liên hệ và hồ sơ CV thực tế */}
                  <div className="cand-meta-box">
                    <div className="cand-meta-row">
                      <span className="cand-meta-label">Email:</span>
                      <span className={`cand-meta-val ${cand.isUnlocked ? 'is-real' : 'is-masked'}`} title={cand.email}>
                        <FiMail size={12} className="val-icon" />
                        {cand.email || (cand.isUnlocked ? 'Chưa cập nhật' : '••••••••••••')}
                      </span>
                    </div>
                    <div className="cand-meta-row">
                      <span className="cand-meta-label">SĐT:</span>
                      <span className={`cand-meta-val ${cand.isUnlocked ? 'is-real' : 'is-masked'}`}>
                        <FiPhone size={12} className="val-icon" />
                        {cand.phone || (cand.isUnlocked ? 'Chưa cập nhật' : '••••••••••••')}
                      </span>
                    </div>
                    <div className="cand-meta-row">
                      <span className="cand-meta-label">Hồ sơ:</span>
                      <span className="cand-meta-val is-cv">
                        <FiFileText size={12} className="val-icon" />
                        {cand.cvFileName || 'CV đính kèm (PDF)'}
                      </span>
                    </div>
                  </div>

                  {/* Phần tóm tắt giới thiệu */}
                  <div className="cand-bio-box">
                    <p className={`cand-bio-text ${!cand.summary ? 'cand-bio-text--placeholder' : ''}`}>
                      {cand.summary || 'Ứng viên sẵn sàng trao đổi các cơ hội nghề nghiệp phù hợp.'}
                    </p>
                  </div>

                  {/* Nút hành động ở chân thẻ */}
                  <div className={`cand-card-footer ${cand.isUnlocked ? 'cand-card-footer--dual' : ''}`}>
                    {cand.isUnlocked ? (
                      <>
                        <button
                          type="button"
                          className="cand-btn cand-btn--chat"
                          onClick={() => handleStartChat(cand)}
                          disabled={startingChat}
                          title="Nhắn tin trực tiếp với ứng viên"
                        >
                          <FiMessageSquare size={13} />
                          <span>Nhắn tin</span>
                        </button>
                        <button
                          type="button"
                          className="cand-btn cand-btn--view"
                          onClick={() => handleOpenProfile(cand.userId)}
                          disabled={loadingDetail}
                          title="Xem chi tiết đầy đủ hồ sơ và CV"
                        >
                          <FiEye size={13} />
                          <span>Xem hồ sơ</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="cand-btn cand-btn--unlock"
                        onClick={() => handleOpenProfile(cand.userId)}
                        disabled={loadingDetail}
                      >
                        <FiUnlock size={14} />
                        <span>Mở khóa xem hồ sơ</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Phân trang: 9 người/trang (3 dòng x 3 cột) */}
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
              title="Đóng modal"
            >
              <FiX />
            </button>

            {/* Header Modal */}
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
                    {selectedCandidate.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <span className="cand-avatar-status-dot" title="Sẵn sàng kết nối" />
              </div>

              <div className="modal-cand-header-info">
                <div className="modal-name-row">
                  <h3 className="modal-cand-name">{selectedCandidate.fullName}</h3>
                  <span className="modal-cand-level">
                    <FiBriefcase size={12} /> Chuyên viên
                  </span>
                </div>
                <div className="modal-badges-row">
                  <span className="modal-status-badge is-unlocked">
                    <FiUnlock size={11} /> Đã mở thông tin liên hệ
                  </span>
                  {selectedCandidate.hasAppliedToCompany && (
                    <span className="modal-status-badge is-applied">
                      <FiCheckCircle size={11} /> Ứng viên đã nộp đơn vào công ty bạn
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Body Modal */}
            <div className="modal-cand-body">
              {/* Lưới thông tin nhanh 4 ô */}
              <div className="modal-quick-info-grid">
                <div className="quick-info-card">
                  <div className="quick-info-header">
                    <FiMail className="quick-info-icon" />
                    <span>Email liên hệ</span>
                  </div>
                  <div className="quick-info-value">
                    <span>{selectedCandidate.email || 'Chưa cung cấp'}</span>
                    {selectedCandidate.email && (
                      <button
                        type="button"
                        className="quick-copy-btn"
                        onClick={() => handleCopy(selectedCandidate.email, 'email')}
                        title="Sao chép Email"
                      >
                        {copiedField === 'email' ? <FiCheck className="text-success" /> : <FiCopy />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="quick-info-card">
                  <div className="quick-info-header">
                    <FiPhone className="quick-info-icon" />
                    <span>Số điện thoại</span>
                  </div>
                  <div className="quick-info-value">
                    <span>{selectedCandidate.phone || 'Chưa cung cấp'}</span>
                    {selectedCandidate.phone && (
                      <button
                        type="button"
                        className="quick-copy-btn"
                        onClick={() => handleCopy(selectedCandidate.phone, 'phone')}
                        title="Sao chép SĐT"
                      >
                        {copiedField === 'phone' ? <FiCheck className="text-success" /> : <FiCopy />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="quick-info-card">
                  <div className="quick-info-header">
                    <FiMapPin className="quick-info-icon" />
                    <span>Khu vực</span>
                  </div>
                  <div className="quick-info-value">
                    <span>{selectedCandidate.address || 'Toàn quốc'}</span>
                  </div>
                </div>

                <div className="quick-info-card">
                  <div className="quick-info-header">
                    <FiBriefcase className="quick-info-icon" />
                    <span>Tình trạng tìm việc</span>
                  </div>
                  <div className="quick-info-value text-success">
                    <span>Sẵn sàng kết nối</span>
                  </div>
                </div>
              </div>

              {/* Giới thiệu bản thân */}
              <div className="modal-section-block">
                <h4 className="modal-section-title">
                  <FiUser className="section-title-icon" /> Giới thiệu bản thân
                </h4>
                <div className="modal-bio-card">
                  <p className="modal-summary-text">
                    {selectedCandidate.summary ||
                      'Ứng viên đang tìm kiếm cơ hội nghề nghiệp phù hợp và chưa cập nhật phần tóm tắt chi tiết.'}
                  </p>
                </div>
              </div>

              {/* Danh sách CV đính kèm */}
              <div className="modal-section-block">
                <h4 className="modal-section-title">
                  <FiFileText className="section-title-icon" /> Danh sách CV & Hồ sơ đính kèm
                </h4>
                {selectedCandidate.cvs && selectedCandidate.cvs.length > 0 ? (
                  <div className="modal-cvs-list">
                    {selectedCandidate.cvs.map((cv) => (
                      <div key={cv.id} className="cv-item-card">
                        <div className="cv-item-info">
                          <div className="cv-icon-wrap">
                            <FiFileText className="cv-icon" />
                          </div>
                          <div className="cv-item-meta">
                            <div className="cv-item-title-row">
                              <strong className="cv-filename">{cv.fileName || 'CV Ứng viên'}</strong>
                              {cv.isDefault && <span className="cv-default-tag">Mặc định</span>}
                            </div>
                            <span className="cv-item-sub">Định dạng PDF • Đã được kiểm tra an toàn</span>
                          </div>
                        </div>
                        <div className="cv-item-actions">
                          <a
                            href={cv.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline btn-sm cv-btn-view"
                          >
                            <FiEye />
                            <span>Xem CV</span>
                          </a>
                          <a
                            href={cv.fileUrl}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-primary btn-sm cv-btn-download"
                          >
                            <FiDownload />
                            <span>Tải về</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-cv-box">
                    <p className="text-muted">Ứng viên chưa tải lên CV dạng tập tin. Bạn có thể liên hệ trực tiếp để nhận CV mới nhất.</p>
                  </div>
                )}
              </div>

              {/* Hộp gợi ý tuyển dụng */}
              <div className="modal-recruiter-tip">
                <FiMessageSquare className="recruiter-tip-icon" />
                <div className="recruiter-tip-text">
                  <strong>Kết nối trực tiếp:</strong> Bạn có thể bắt đầu cuộc trò chuyện ngay với ứng viên để đặt câu hỏi về kinh nghiệm, trao đổi vị trí hoặc gửi lời mời phỏng vấn nhanh chóng.
                </div>
              </div>
            </div>

            {/* Footer Modal với nút Đóng và nút Chat */}
            <div className="modal-cand-footer">
              <button
                type="button"
                className="btn btn-outline modal-btn-secondary"
                onClick={() => setSelectedCandidate(null)}
              >
                Đóng
              </button>

              <button
                type="button"
                className="btn btn-primary modal-btn-chat"
                onClick={() => handleStartChat(selectedCandidate)}
                disabled={startingChat}
              >
                <FiMessageSquare className="chat-btn-icon" />
                <span>{startingChat ? 'Đang kết nối...' : 'Chat với Ứng Viên'}</span>
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
