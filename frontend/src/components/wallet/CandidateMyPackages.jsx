import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Star,
  TrendingUp,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  Building2,
  History,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import './CandidateMyPackages.css';

/**
 * Component hiển thị "Gói Tiện Ích Của Tôi" dành cho Ứng viên.
 * Thiết kế giao diện chuyên nghiệp, gọn gàng, định hướng dashboard thực tế (TopCV/ITviec).
 * Không sử dụng các mẫu AI mặc định: bỏ badge trôi nổi, bỏ khối icon cầu vồng, bỏ all-caps và shadow quá đà.
 */
export const CandidateMyPackages = ({
  benefits = null,
  transactions = [],
  balance = 0,
  onViewFeesClick,
  onDepositClick,
}) => {
  const navigate = useNavigate();

  // Kiểm tra trạng thái kích hoạt thực tế
  const isBoostActive = Boolean(benefits?.isBoostActive);
  const isBadgeActive = Boolean(benefits?.isFeaturedBadgeActive);
  const isPriorityActive = Boolean(benefits?.isPriorityActive);
  const contactQuota = benefits?.contactUnlockQuota || 0;
  const aiQuota = benefits?.aiScoreQuota || 0;
  const unlockedCompanies = benefits?.unlockedCompanies || [];

  const hasAnyActive =
    isBoostActive ||
    isBadgeActive ||
    isPriorityActive ||
    contactQuota > 0 ||
    aiQuota > 0 ||
    unlockedCompanies.length > 0;

  // Lọc lịch sử giao dịch mua combo
  const comboHistory = transactions.filter((t) => {
    const desc = (t.title || t.refType || t.description || '').toLowerCase();
    return desc.includes('combo') || desc.includes('tiện ích');
  });

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Chưa kích hoạt';
    try {
      const d = new Date(dateStr);
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${hours}:${mins} - ${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="cmp-container">
      {/* 1. Tiêu đề phân hệ: Căn trái tự nhiên theo layout hệ thống */}
      <div className="cmp-header-bar">
        <div className="cmp-header-bar__text">
          <h2 className="cmp-title">Gói tiện ích của tôi</h2>
          <p className="cmp-subtitle">
            Theo dõi trạng thái và thời hạn các quyền lợi hỗ trợ tìm việc đang áp dụng cho hồ sơ của bạn.
          </p>
        </div>
        <button
          type="button"
          className="cmp-btn-primary"
          onClick={onViewFeesClick}
        >
          <span>Khám phá bảng giá combo</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {/* 2. Khối tóm tắt trạng thái và quyền lợi */}
      {hasAnyActive ? (
        <div className="cmp-perks-card">
          <div className="cmp-perks-card__header">
            <div className="cmp-status-indicator">
              <span className="cmp-status-dot" />
              <span className="cmp-status-label">Đang kích hoạt quyền lợi</span>
            </div>
            <div className="cmp-header-meta">
              <span>Số dư: <strong>{balance} Token</strong></span>
            </div>
          </div>

          <div className="cmp-perks-grid">
            {/* Cột 1: Hiển thị & Nổi bật hồ sơ */}
            <div className="cmp-perk-item">
              <div className="cmp-perk-item__head">
                <div className="cmp-perk-item__icon-wrap">
                  <Zap size={18} />
                </div>
                <div className="cmp-perk-item__title-wrap">
                  <span className="cmp-perk-name">Đẩy CV lên đầu (72h)</span>
                  <span className={`cmp-perk-badge ${isBoostActive ? 'is-active' : 'is-muted'}`}>
                    {isBoostActive ? 'Đang bật' : 'Chưa bật'}
                  </span>
                </div>
              </div>
              <p className="cmp-perk-desc">
                Tự động ưu tiên xếp hồ sơ lên đầu kết quả khi nhà tuyển dụng tìm kiếm ứng viên.
              </p>
              <div className="cmp-perk-footer">
                <Clock size={13} />
                <span>
                  {isBoostActive
                    ? `Hết hạn: ${formatDateTime(benefits?.boostCvExpireAt)}`
                    : 'Chưa áp dụng cho hồ sơ'}
                </span>
              </div>
            </div>

            {/* Cột 2: Huy hiệu nổi bật */}
            <div className="cmp-perk-item">
              <div className="cmp-perk-item__head">
                <div className="cmp-perk-item__icon-wrap">
                  <Star size={18} />
                </div>
                <div className="cmp-perk-item__title-wrap">
                  <span className="cmp-perk-name">Huy hiệu ứng viên nổi bật</span>
                  <span className={`cmp-perk-badge ${isBadgeActive ? 'is-active' : 'is-muted'}`}>
                    {isBadgeActive ? 'Đang bật' : 'Chưa bật'}
                  </span>
                </div>
              </div>
              <p className="cmp-perk-desc">
                Gắn nhãn nhận diện nổi bật bên cạnh tên hồ sơ, thu hút sự chú ý của nhà tuyển dụng.
              </p>
              <div className="cmp-perk-footer">
                <Clock size={13} />
                <span>
                  {isBadgeActive
                    ? `Hết hạn: ${formatDateTime(benefits?.featuredBadgeExpireAt)}`
                    : 'Chưa áp dụng cho hồ sơ'}
                </span>
              </div>
            </div>

            {/* Cột 3: Ưu tiên hiển thị */}
            <div className="cmp-perk-item">
              <div className="cmp-perk-item__head">
                <div className="cmp-perk-item__icon-wrap">
                  <TrendingUp size={18} />
                </div>
                <div className="cmp-perk-item__title-wrap">
                  <span className="cmp-perk-name">Ưu tiên thứ hạng hiển thị</span>
                  <span className={`cmp-perk-badge ${isPriorityActive ? 'is-active' : 'is-muted'}`}>
                    {isPriorityActive ? 'Đang bật' : 'Chưa bật'}
                  </span>
                </div>
              </div>
              <p className="cmp-perk-desc">
                Xếp hạng cao nhất trong danh sách ứng viên tiềm năng (dành cho gói Toàn diện).
              </p>
              <div className="cmp-perk-footer">
                <Clock size={13} />
                <span>
                  {isPriorityActive
                    ? `Hết hạn: ${formatDateTime(benefits?.priorityDisplayExpireAt)}`
                    : 'Gói hiện tại chưa có quyền lợi này'}
                </span>
              </div>
            </div>

            {/* Cột 4: Mở khóa liên hệ NTD */}
            <div className="cmp-perk-item cmp-perk-item--featured">
              <div className="cmp-perk-item__head">
                <div className="cmp-perk-item__icon-wrap">
                  <MessageSquare size={18} />
                </div>
                <div className="cmp-perk-item__title-wrap">
                  <span className="cmp-perk-name">Mở khóa nhắn tin NTD</span>
                  <span className={`cmp-perk-badge ${contactQuota > 0 ? 'is-highlight' : 'is-muted'}`}>
                    {contactQuota > 0 ? `Còn ${contactQuota} lượt` : 'Đã hết lượt'}
                  </span>
                </div>
              </div>
              <p className="cmp-perk-desc">
                Mở quyền nhắn tin trò chuyện trực tiếp với nhà tuyển dụng mà không cần chờ duyệt CV.
              </p>
              <div className="cmp-perk-footer">
                <CheckCircle2 size={13} />
                <span>Đã mở khóa: <strong>{unlockedCompanies.length} doanh nghiệp</strong></span>
              </div>
            </div>

            {/* Cột 5: Chấm điểm CV AI */}
            <div className="cmp-perk-item">
              <div className="cmp-perk-item__head">
                <div className="cmp-perk-item__icon-wrap">
                  <Sparkles size={18} />
                </div>
                <div className="cmp-perk-item__title-wrap">
                  <span className="cmp-perk-name">Chấm điểm & phân tích CV</span>
                  <span className={`cmp-perk-badge ${aiQuota > 0 ? 'is-active' : 'is-muted'}`}>
                    {aiQuota > 0 ? `Còn ${aiQuota} lượt` : 'Chưa kích hoạt'}
                  </span>
                </div>
              </div>
              <p className="cmp-perk-desc">
                Phân tích mức độ phù hợp giữa hồ sơ của bạn với yêu cầu công việc của nhà tuyển dụng.
              </p>
              <div className="cmp-perk-footer">
                <Sparkles size={13} />
                <span>{aiQuota > 0 ? 'Sẵn sàng sử dụng trong Tạo CV' : 'Dành cho gói Toàn diện'}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty state: Tự nhiên, thiết thực, có lời gọi hành động rõ ràng */
        <div className="cmp-empty-box">
          <div className="cmp-empty-box__content">
            <h3 className="cmp-empty-box__title">Bạn chưa kích hoạt gói tiện ích nào</h3>
            <p className="cmp-empty-box__desc">
              Kích hoạt ngay các combo tiện ích như <strong>Nổi bật</strong>, <strong>Liên hệ nhanh</strong> hoặc <strong>Toàn diện</strong> để đẩy CV lên vị trí ưu tiên, gắn huy hiệu nổi bật và mở khóa trò chuyện trực tiếp với nhà tuyển dụng.
            </p>
            <button
              type="button"
              className="cmp-btn-primary"
              onClick={onViewFeesClick}
            >
              <span>Xem bảng giá & kích hoạt combo</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* 3. Doanh nghiệp đã mở khóa trò chuyện */}
      <div className="cmp-section">
        <div className="cmp-section__header">
          <div>
            <h3 className="cmp-section__title">
              Nhà tuyển dụng đã mở khóa liên hệ
              <span className="cmp-counter-tag">{unlockedCompanies.length}</span>
            </h3>
            <p className="cmp-section__desc">
              Các doanh nghiệp bạn đã chủ động mở khóa quyền trò chuyện trực tiếp từ tin tuyển dụng.
            </p>
          </div>
        </div>

        {unlockedCompanies.length > 0 ? (
          <div className="cmp-companies-grid">
            {unlockedCompanies.map((c) => (
              <div key={c.companyId} className="cmp-company-row">
                <div className="cmp-company-row__avatar">
                  {c.companyLogo ? (
                    <img src={c.companyLogo} alt={c.companyName} className="cmp-company-logo" />
                  ) : (
                    <div className="cmp-company-logo-placeholder">
                      {c.companyName?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                  )}
                </div>
                <div className="cmp-company-row__info">
                  <h4 className="cmp-company-name" title={c.companyName}>{c.companyName}</h4>
                  <span className="cmp-company-meta">Mở khóa lúc: {formatDateTime(c.unlockedAt)}</span>
                </div>
                <button
                  type="button"
                  className="cmp-btn-chat"
                  onClick={() => navigate(`/ung-vien/tin-nhan?companyId=${c.companyId}&company=${encodeURIComponent(c.companyName)}`)}
                >
                  <MessageSquare size={14} />
                  <span>Vào trò chuyện</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="cmp-empty-inline">
            <Building2 size={22} className="cmp-empty-inline__icon" />
            <div>
              <p className="cmp-empty-inline__title">Chưa có doanh nghiệp nào được mở khóa</p>
              <p className="cmp-empty-inline__desc">
                Khi xem tin tuyển dụng phù hợp, bấm nút <strong>"Chat với NTD"</strong> để sử dụng lượt mở khóa và trao đổi trực tiếp.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4. Bảng lịch sử kích hoạt combo */}
      <div className="cmp-section">
        <div className="cmp-section__header">
          <div>
            <h3 className="cmp-section__title">Lịch sử kích hoạt gói tiện ích</h3>
            <p className="cmp-section__desc">
              Các lần trừ Token để kích hoạt gói combo tiện ích ứng tuyển JobViet.
            </p>
          </div>
        </div>

        <div className="cmp-table-container">
          <table className="cmp-table">
            <thead>
              <tr>
                <th>Gói tiện ích</th>
                <th>Thời gian kích hoạt</th>
                <th className="text-right">Token thanh toán</th>
                <th className="text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {comboHistory.length > 0 ? (
                comboHistory.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <div className="cmp-tx-name">
                        <strong>{tx.title || tx.refType || 'Mua combo tiện ích'}</strong>
                      </div>
                    </td>
                    <td className="cmp-tx-time">{formatDateTime(tx.createdAt)}</td>
                    <td className="text-right">
                      <span className="cmp-tx-amount">
                        {tx.amount > 0 ? `-${tx.amount}` : tx.amount} Token
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="cmp-badge-success">
                        <CheckCircle2 size={12} />
                        <span>Thành công</span>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="cmp-table-empty">
                    Chưa có giao dịch mua combo tiện ích nào được ghi nhận trong tài khoản.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
