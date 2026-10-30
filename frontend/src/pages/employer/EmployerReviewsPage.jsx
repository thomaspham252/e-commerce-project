import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Star,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Send,
  Edit3,
  Trash2,
  Search,
  Filter,
  ExternalLink,
  ThumbsUp,
  ShieldCheck,
  Sparkles,
  X
} from 'lucide-react';
import { employerService } from '../../services/employerService';
import { getErrorMessage } from '../../services/apiClient';
import { formatDate } from '../../utils/formatDate';
import './EmployerReviewsPage.css';

export const EmployerReviewsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [selectedRating, setSelectedRating] = useState('all');
  const [replyStatus, setReplyStatus] = useState('all');
  const [keyword, setKeyword] = useState('');

  // Inline Reply state
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [deletingReplyId, setDeletingReplyId] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await employerService.getReviews({
        rating: selectedRating !== 'all' ? Number(selectedRating) : undefined,
        replyStatus: replyStatus !== 'all' ? replyStatus : undefined,
        keyword: keyword.trim() || undefined,
        size: 50
      });
      setData(res);
    } catch (err) {
      console.error('Không tải được danh sách đánh giá:', err);
      setError(getErrorMessage(err) || 'Không thể tải danh sách đánh giá. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [selectedRating, replyStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReviews();
  };

  const handleOpenReplyForm = (review) => {
    setActiveReplyId(review.id);
    setReplyContent(review.reply ? review.reply.content : '');
  };

  const handleCloseReplyForm = () => {
    setActiveReplyId(null);
    setReplyContent('');
  };

  const handleApplyTemplate = (text) => {
    setReplyContent(text);
  };

  const handleSendReply = async (reviewId) => {
    if (!replyContent.trim()) {
      toast.warning('Vui lòng nhập nội dung phản hồi.');
      return;
    }

    setSubmittingReply(true);
    try {
      const updatedReview = await employerService.replyReview(reviewId, {
        content: replyContent.trim()
      });

      toast.success('Đã gửi phản hồi đánh giá thành công!');
      handleCloseReplyForm();

      // Cập nhật state nội bộ ngay lập tức
      setData((prev) => {
        if (!prev) return prev;
        const updatedList = (prev.reviews?.content || []).map((r) =>
          r.id === reviewId ? updatedReview : r
        );
        return {
          ...prev,
          repliedCount: prev.reviews?.content?.some((r) => r.id === reviewId && r.reply)
            ? prev.repliedCount
            : prev.repliedCount + 1,
          unrepliedCount: Math.max(0, prev.unrepliedCount - 1),
          reviews: {
            ...prev.reviews,
            content: updatedList
          }
        };
      });
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Gửi phản hồi thất bại.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteReply = async (reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phản hồi này?')) return;

    setDeletingReplyId(reviewId);
    try {
      await employerService.deleteReply(reviewId);
      toast.success('Đã xóa phản hồi.');

      // Cập nhật state nội bộ ngay lập tức
      setData((prev) => {
        if (!prev) return prev;
        const updatedList = (prev.reviews?.content || []).map((r) => {
          if (r.id === reviewId) {
            return { ...r, reply: null };
          }
          return r;
        });
        return {
          ...prev,
          repliedCount: Math.max(0, prev.repliedCount - 1),
          unrepliedCount: prev.unrepliedCount + 1,
          reviews: {
            ...prev.reviews,
            content: updatedList
          }
        };
      });
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Xóa phản hồi thất bại.');
    } finally {
      setDeletingReplyId(null);
    }
  };

  const reviewsList = data?.reviews?.content || [];
  const totalReviews = data?.totalReviews || 0;
  const avgRating = data?.averageRating || 5.0;
  const repliedCount = data?.repliedCount || 0;
  const unrepliedCount = data?.unrepliedCount || 0;
  const responseRate = data?.responseRate || 100;
  const breakdown = data?.ratingBreakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  return (
    <div className="emp-reviews-container">
      {/* 1. PAGE HEADER */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="page-title">Quản lý Đánh giá & Phản hồi</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Theo dõi trải nghiệm từ ứng viên, xây dựng uy tín nhà tuyển dụng và tương tác phản hồi trực tiếp.
          </p>
        </div>

        {data?.companyId && (
          <Link
            to={`/cong-ty/${data.companyId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', padding: '9px 16px', borderRadius: '8px', textDecoration: 'none' }}
          >
            <Building2 size={16} />
            <span>Xem trang công ty công khai</span>
            <ExternalLink size={14} />
          </Link>
        )}
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '14px 18px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* 2. KPI STATS CARDS */}
      <div className="emp-stats-grid">
        <div className="emp-stat-card">
          <div className="emp-stat-icon-wrap emp-stat-icon-gold">
            <Star size={24} fill="#F59E0B" color="#F59E0B" />
          </div>
          <div className="emp-stat-info">
            <span className="emp-stat-label">Điểm trung bình</span>
            <span className="emp-stat-value">{avgRating.toFixed(1)} / 5.0</span>
            <span className="emp-stat-hint">Dựa trên {totalReviews} đánh giá</span>
          </div>
        </div>

        <div className="emp-stat-card">
          <div className="emp-stat-icon-wrap emp-stat-icon-blue">
            <MessageSquare size={24} />
          </div>
          <div className="emp-stat-info">
            <span className="emp-stat-label">Tổng số đánh giá</span>
            <span className="emp-stat-value">{totalReviews}</span>
            <span className="emp-stat-hint">Từ ứng viên và nhân viên</span>
          </div>
        </div>

        <div className="emp-stat-card">
          <div className="emp-stat-icon-wrap emp-stat-icon-orange">
            <Clock size={24} />
          </div>
          <div className="emp-stat-info">
            <span className="emp-stat-label">Chưa phản hồi</span>
            <span className="emp-stat-value" style={{ color: unrepliedCount > 0 ? '#EA580C' : '#0F172A' }}>
              {unrepliedCount}
            </span>
            <span className="emp-stat-hint">{unrepliedCount > 0 ? 'Cần phản hồi sớm' : 'Đã phản hồi toàn bộ'}</span>
          </div>
        </div>

        <div className="emp-stat-card">
          <div className="emp-stat-icon-wrap emp-stat-icon-green">
            <CheckCircle2 size={24} />
          </div>
          <div className="emp-stat-info">
            <span className="emp-stat-label">Tỷ lệ phản hồi</span>
            <span className="emp-stat-value">{responseRate}%</span>
            <span className="emp-stat-hint">{repliedCount} / {totalReviews} đã phản hồi</span>
          </div>
        </div>
      </div>

      {/* 3. PHÂN PHỐI ĐÁNH GIÁ (TIẾN TRÌNH TỪNG MỨC SAO) */}
      <div className="emp-breakdown-card">
        <div className="emp-score-overview">
          <span className="emp-big-score">{avgRating.toFixed(1)}</span>
          <div className="emp-big-stars">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={18}
                fill={avgRating >= s ? '#F59E0B' : '#E2E8F0'}
                color={avgRating >= s ? '#F59E0B' : '#CBD5E1'}
              />
            ))}
          </div>
          <span className="emp-score-count">{totalReviews} lượt đánh giá</span>
        </div>

        <div className="emp-breakdown-bars">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = breakdown[stars] || 0;
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <div key={stars} className="emp-bar-row">
                <span className="emp-bar-label">
                  {stars} <Star size={13} fill="#F59E0B" color="#F59E0B" />
                </span>
                <div className="emp-bar-track">
                  <div className="emp-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="emp-bar-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. TOOLBAR VÀ BỘ LỌC */}
      <div className="emp-filter-card">
        <form className="emp-search-box" onSubmit={handleSearchSubmit}>
          <Search size={18} color="#94A3B8" />
          <input
            type="text"
            placeholder="Tìm theo tên ứng viên hoặc nội dung nhận xét..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </form>

        <div className="emp-filter-group">
          <select
            className="emp-select-filter"
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
          >
            <option value="all">⭐ Tất cả mức sao</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>

          <select
            className="emp-select-filter"
            value={replyStatus}
            onChange={(e) => setReplyStatus(e.target.value)}
          >
            <option value="all">💬 Tất cả trạng thái</option>
            <option value="unreplied">⏳ Chưa phản hồi ({unrepliedCount})</option>
            <option value="replied">✅ Đã phản hồi ({repliedCount})</option>
          </select>
        </div>
      </div>

      {/* 5. DANH SÁCH BÌNH LUẬN & ĐÁNH GIÁ */}
      {loading ? (
        <div className="emp-empty-box">
          <Clock size={36} className="emp-empty-icon" style={{ animation: 'spin 1.5s linear infinite' }} />
          <h4 className="emp-empty-title">Đang tải danh sách đánh giá...</h4>
          <p className="emp-empty-desc">Vui lòng chờ trong giây lát.</p>
        </div>
      ) : reviewsList.length === 0 ? (
        <div className="emp-empty-box">
          <MessageSquare size={40} className="emp-empty-icon" />
          <h4 className="emp-empty-title">Không tìm thấy đánh giá nào</h4>
          <p className="emp-empty-desc">
            Chưa có đánh giá nào phù hợp với bộ lọc hiện tại. Thử chọn lại điều kiện tìm kiếm khác.
          </p>
        </div>
      ) : (
        <div className="emp-reviews-list">
          {reviewsList.map((review) => {
            const hasReply = !!review.reply;
            const isEditing = activeReplyId === review.id;
            const authorName = review.candidateName || 'Ứng viên ẩn danh';
            const authorInitial = authorName.trim().charAt(0).toUpperCase();

            return (
              <div key={review.id} className="emp-review-card">
                {/* Header đánh giá */}
                <div className="emp-review-header">
                  <div className="emp-review-author">
                    <div className="emp-author-avatar">{authorInitial}</div>
                    <div className="emp-author-info">
                      <span className="emp-author-name">{authorName}</span>
                      <span className="emp-review-date">{formatDate(review.createdAt)}</span>
                    </div>
                  </div>

                  <div className="emp-review-meta">
                    <div className="emp-stars-row">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={16}
                          fill={review.rating >= s ? '#F59E0B' : '#E2E8F0'}
                          color={review.rating >= s ? '#F59E0B' : '#CBD5E1'}
                        />
                      ))}
                    </div>

                    {hasReply ? (
                      <span className="emp-badge-status emp-badge-replied">
                        <CheckCircle2 size={13} /> Đã phản hồi
                      </span>
                    ) : (
                      <span className="emp-badge-status emp-badge-unreplied">
                        <Clock size={13} /> Chưa phản hồi
                      </span>
                    )}
                  </div>
                </div>

                {/* Nội dung nhận xét của ứng viên */}
                <div className="emp-review-body">
                  "{review.content}"
                </div>

                {/* Khối phản hồi hiện tại của Nhà tuyển dụng (nếu đã có) */}
                {hasReply && !isEditing && (
                  <div className="emp-reply-box">
                    <div className="emp-reply-head">
                      <span className="emp-reply-title">
                        <ShieldCheck size={16} /> Phản hồi chính thức từ Nhà tuyển dụng
                      </span>
                      <span className="emp-reply-date">{formatDate(review.reply.createdAt)}</span>
                    </div>
                    <p className="emp-reply-content">{review.reply.content}</p>
                    <div className="emp-reply-actions">
                      <button
                        type="button"
                        className="emp-reply-action-btn emp-btn-edit"
                        onClick={() => handleOpenReplyForm(review)}
                      >
                        <Edit3 size={13} /> Chỉnh sửa
                      </button>
                      <button
                        type="button"
                        className="emp-reply-action-btn emp-btn-delete"
                        disabled={deletingReplyId === review.id}
                        onClick={() => handleDeleteReply(review.id)}
                      >
                        <Trash2 size={13} /> {deletingReplyId === review.id ? 'Đang xóa...' : 'Xóa'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Form viết / chỉnh sửa phản hồi */}
                {isEditing ? (
                  <div className="emp-reply-form-wrap">
                    {/* Gợi ý mẫu phản hồi nhanh */}
                    <div className="emp-templates-row">
                      <span className="emp-templates-label">
                        <Sparkles size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        Mẫu nhanh:
                      </span>
                      <button
                        type="button"
                        className="emp-template-chip"
                        onClick={() =>
                          handleApplyTemplate(
                            `Cảm ơn bạn đã luôn tin tưởng và đánh giá cao môi trường làm việc tại ${data?.companyName || 'công ty'}. Chúc bạn luôn gặt hái nhiều thành công rực rỡ!`
                          )
                        }
                      >
                        👍 Cảm ơn tích cực
                      </button>
                      <button
                        type="button"
                        className="emp-template-chip"
                        onClick={() =>
                          handleApplyTemplate(
                            `Cảm ơn bạn đã đóng góp ý kiến quý báu. Ban lãnh đạo ${data?.companyName || 'công ty'} luôn lắng nghe và không ngừng cải thiện để mang lại môi trường làm việc tốt nhất.`
                          )
                        }
                      >
                        💡 Tiếp thu đóng góp
                      </button>
                      <button
                        type="button"
                        className="emp-template-chip"
                        onClick={() =>
                          handleApplyTemplate(
                            `Cảm ơn bạn đã quan tâm ứng tuyển tại ${data?.companyName || 'công ty'}. Đội ngũ nhân sự luôn sẵn sàng đồng hành và hỗ trợ bạn tốt nhất!`
                          )
                        }
                      >
                        🤝 Hỗ trợ ứng viên
                      </button>
                    </div>

                    <textarea
                      rows={4}
                      className="emp-reply-textarea"
                      placeholder="Nhập nội dung phản hồi đại diện cho doanh nghiệp của bạn..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                    />

                    <div className="emp-form-buttons">
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px' }}
                        onClick={handleCloseReplyForm}
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ padding: '8px 18px', fontSize: '13px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        disabled={submittingReply}
                        onClick={() => handleSendReply(review.id)}
                      >
                        <Send size={14} />
                        <span>{submittingReply ? 'Đang gửi...' : hasReply ? 'Cập nhật phản hồi' : 'Gửi phản hồi'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  !hasReply && (
                    <div className="emp-action-bar">
                      <button
                        type="button"
                        className="emp-btn-reply-trigger"
                        onClick={() => handleOpenReplyForm(review)}
                      >
                        <MessageSquare size={14} />
                        <span>Trả lời đánh giá</span>
                      </button>
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

