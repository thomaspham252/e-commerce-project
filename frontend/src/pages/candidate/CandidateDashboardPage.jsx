import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coins,
  Cpu,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  FolderKanban,
  Globe,
  GraduationCap,
  Heart,
  HelpCircle,
  Inbox,
  Info,
  Languages,
  LayoutGrid,
  Mail,
  MapPin,
  MessageSquare,
  Paperclip,
  Pause,
  Play,
  Plus,
  PlusCircle,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  SquarePen,
  Trash2,
  Trophy,
  Upload,
  User,
  Users,
  Wallet,
  X,
  Zap
} from 'lucide-react';
import { getAuthSession } from '../../services/apiClient';
import { useSavedJobs } from '../../context/SavedJobsContext';
import { useApplications } from '../../context/ApplicationsContext';
import {
  getCandidateConversations,
  getCandidateMessages,
  sendCandidateMessage,
  markCandidateConversationRead,
  getOrCreateCandidateConversation,
  simulateEmployerReply,
  getCandidateTotalUnread,
  CANDIDATE_QUICK_QUESTIONS
} from '../../services/candidateMessagesService';
import './CandidateDashboardPage.css';

export const CandidateDashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { savedJobIds, toggleSaveJob, isJobSaved } = useSavedJobs();
  const { applications } = useApplications();

  // Xác định tab đang chọn: 'overview' | 'profile' | 'create-cv' | 'my-jobs' | 'invitations' | 'messages' | 'email' | 'notifications' | 'settings'
  const determineActiveTab = (pathname) => {
    if (pathname.includes('/ho-so')) return 'profile';
    if (pathname.includes('/tao-cv') || pathname.includes('/cv')) return 'create-cv';
    if (pathname.includes('/viec-lam')) return 'my-jobs';
    if (pathname.includes('/loi-moi')) return 'invitations';
    if (pathname.includes('/tin-nhan') || pathname.includes('/chat')) return 'messages';
    if (pathname.includes('/dang-ky-email') || pathname.includes('/email')) return 'email';
    if (pathname.includes('/thong-bao')) return 'notifications';
    if (pathname.includes('/cai-dat')) return 'settings';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(() => determineActiveTab(location.pathname));

  useEffect(() => {
    setActiveTab(determineActiveTab(location.pathname));
  }, [location.pathname]);

  const changeTab = (tabKey, routePath) => {
    setActiveTab(tabKey);
    navigate(routePath);
  };

  // Dữ liệu hồ sơ người dùng lưu trong localStorage để luôn đồng bộ và nhất quán
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('jobviet.candidateProfile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    const session = getAuthSession();
    const email = session?.email || '22130143@st.hcmuaf.edu.vn';
    const isLinh = email === '22130143@st.hcmuaf.edu.vn' || email.includes('linh') || email === 'flack25.2@gmail.com';
    return {
      fullName: session?.name || session?.fullName || (isLinh ? 'Linh Phạm Văn' : 'Ứng viên'),
      title: 'Cập nhật chức danh',
      email: email,
      phone: '0393373094',
      birthday: '',
      gender: '',
      address: '',
      personalLink: '',
      desiredLocation: 'Ho Chi Minh',
      expertise: '',
      languages: '',
      experienceYears: '',
      currentLevel: '',
      workType: '',
      expectedSalary: '10.000.000 VND/tháng',
      coverLetter: '',
      cvFileName: 'Linh_Pham_Van_cv.pdf',
      cvLastUpdated: '23/10/2026',
      cvStatus: 'Fresher',
      completionRate: 5,
      isSearchable: true,
    };
  });

  // State riêng cho từng tab
  const [myJobsSubTab, setMyJobsSubTab] = useState('recent'); // 'applied' | 'saved' | 'recent'
  const [invitationsSubTab, setInvitationsSubTab] = useState('pending'); // 'pending' | 'accepted' | 'expired'

  // State Tin nhắn với Nhà tuyển dụng (Candidate Employer Chat)
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatSearch, setChatSearch] = useState('');
  const [chatFilter, setChatFilter] = useState('all'); // 'all' | 'unread'
  const [inputMessage, setInputMessage] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [totalUnreadChat, setTotalUnreadChat] = useState(0);
  const cardContainerRef = useRef(null);
  const quickQuestionsRef = useRef(null);
  const timelinePaneRef = useRef(null);

  const refreshConversations = async () => {
    const list = await getCandidateConversations({ search: chatSearch, filter: chatFilter });
    setConversations(list);
    const unread = await getCandidateTotalUnread();
    setTotalUnreadChat(unread);
    return list;
  };

  useEffect(() => {
    refreshConversations().then(async (list) => {
      const companyParam = searchParams.get('company');
      const companyIdParam = searchParams.get('companyId');
      const jobIdParam = searchParams.get('jobId');
      const jobParam = searchParams.get('jobTitle');
      if (companyParam || companyIdParam) {
        const targetConv = await getOrCreateCandidateConversation({
          companyId: companyIdParam ? parseInt(companyIdParam, 10) : undefined,
          jobId: jobIdParam ? parseInt(jobIdParam, 10) : undefined,
          companyName: companyParam || 'Doanh nghiệp tuyển dụng',
          jobTitle: jobParam || 'Vị trí tuyển dụng'
        });
        if (targetConv && targetConv.id) {
          setActiveConvId(targetConv.id);
        }
        const updated = await refreshConversations();
        setConversations(updated);
      } else if (!activeConvId && list.length > 0) {
        setActiveConvId(list[0].id);
      }
    });
  }, [chatSearch, chatFilter, searchParams]);

  useEffect(() => {
    if (activeConvId) {
      getCandidateMessages(activeConvId).then((msgs) => {
        setChatMessages(msgs);
        markCandidateConversationRead(activeConvId).then(async () => {
          const unread = await getCandidateTotalUnread();
          setTotalUnreadChat(unread);
        });
      });
    }
  }, [activeConvId]);

  // Adaptive Polling 3.5s khi đang mở tab tin nhắn
  useEffect(() => {
    if (activeTab !== 'messages') return;

    const intervalId = setInterval(async () => {
      if (document.hidden) return;
      await refreshConversations();
      if (activeConvId) {
        const msgs = await getCandidateMessages(activeConvId);
        setChatMessages(msgs);
      }
    }, 3500);

    return () => clearInterval(intervalId);
  }, [activeTab, activeConvId]);

  // Đảm bảo khi đổi tab hoặc URL, trang luôn giữ ở đầu trang, không bị giật xuống footer
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (cardContainerRef.current) {
      cardContainerRef.current.scrollTop = 0;
    }
  }, [location.pathname, activeTab]);

  // Cuộn NỘI BỘ trong timelinePaneRef, giữ nguyên scroll card và tuyệt đối không cuộn window
  useEffect(() => {
    if (activeTab === 'messages') {
      if (cardContainerRef.current) {
        cardContainerRef.current.scrollTop = 0;
      }
      if (timelinePaneRef.current) {
        timelinePaneRef.current.scrollTop = timelinePaneRef.current.scrollHeight;
      }
    }
  }, [chatMessages, activeConvId, activeTab]);

  const handleSelectConv = (e, id) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setActiveConvId(id);
    if (cardContainerRef.current) {
      cardContainerRef.current.scrollTop = 0;
    }
  };

  const handleSendMessageSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !activeConvId || isSendingMsg) return;

    const textToSend = inputMessage.trim();
    setInputMessage('');
    setIsSendingMsg(true);

    try {
      await sendCandidateMessage({ conversationId: activeConvId, content: textToSend });
      const currentMsgs = await getCandidateMessages(activeConvId);
      setChatMessages(currentMsgs);
      await refreshConversations();

      // Phản hồi mô phỏng từ NTD sau 1.5s
      simulateEmployerReply(activeConvId, textToSend).then(async (reply) => {
        if (reply && reply.conversationId === activeConvId) {
          const freshMsgs = await getCandidateMessages(activeConvId);
          setChatMessages(freshMsgs);
          await refreshConversations();
        }
      });
    } catch (err) {
      console.error('Lỗi khi gửi tin nhắn:', err);
    } finally {
      setIsSendingMsg(false);
    }
  };

  const handleSendQuickQuestion = (questionText) => {
    setInputMessage(questionText);
  };

  // Tab Đăng ký email state
  const [registeredAlerts, setRegisteredAlerts] = useState([
    { id: 1, text: 'github java mysql tại TP Hồ Chí Minh', active: true }
  ]);
  const [newKeyword, setNewKeyword] = useState('');
  const [newLocation, setNewLocation] = useState('TP Hồ Chí Minh');

  // Tab Cài đặt: Tìm kiếm công ty chặn
  const [blockedCompanies, setBlockedCompanies] = useState([]);
  const [companySearch, setCompanySearch] = useState('');

  // Modals & toast
  const [modalType, setModalType] = useState(null);
  const [modalForm, setModalForm] = useState(profile);
  const [toastMessage, setToastMessage] = useState('');
  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        showToast('Kích thước tệp vượt quá 3MB. Vui lòng chọn tệp nhỏ hơn.');
        return;
      }
      const updated = {
        ...profile,
        cvFileName: file.name,
        cvLastUpdated: new Date().toLocaleDateString('vi-VN'),
        completionRate: Math.min(100, Math.max(profile.completionRate, 35)),
      };
      setProfile(updated);
      localStorage.setItem('jobviet.candidateProfile', JSON.stringify(updated));
      showToast(`Tải lên thành công: ${file.name}`);
    }
  };

  const openModal = (type) => {
    setModalForm(profile);
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    setProfile(modalForm);
    localStorage.setItem('jobviet.candidateProfile', JSON.stringify(modalForm));
    closeModal();
    showToast('Cập nhật thông tin thành công!');
  };

  // Danh sách việc làm đã xem gần đây (Khớp ảnh mẫu)
  const recentViewedJobs = [
    {
      id: 'katalon-1',
      title: 'Senior Database Administrator (PostgreSQL/AWS/Aurora)',
      company: 'Katalon',
      location: 'TP Hồ Chí Minh • Tại văn phòng',
      perk: "You'll love it",
      posted: 'Đăng 2 giờ trước (Hết hạn trong 14 ngày)',
      logoText: 'katalon'
    },
    {
      id: 'toshiba-2',
      title: 'Fullstack Engineer (NodeJS, ReactJS, Javascript)',
      company: 'Toshiba Software Development (Viet Nam) Co, Ltd',
      location: 'Hà Nội • Tại văn phòng',
      perk: "You'll love it",
      posted: 'Đăng 3 ngày trước (Hết hạn trong 31 ngày)',
      logoText: 'TOSHIBA'
    },
    {
      id: 'mblife-3',
      title: 'Data Governance Expert',
      company: 'MB Life',
      location: 'Hà Nội • Tại văn phòng',
      salary: '2,000 - 4,000 USD',
      posted: 'Đăng 3 ngày trước (Hết hạn trong 21 ngày)',
      logoText: 'MBLife'
    }
  ];

  const cvSections = [
    { id: 'intro', title: 'Giới thiệu bản thân', bump: '↑ 5%', desc: 'Giới thiệu điểm mạnh và số năm kinh nghiệm của bạn' },
    { id: 'education', title: 'Học vấn', bump: '↑ 5%', desc: 'Chia sẻ trình độ học vấn của bạn' },
    { id: 'experience', title: 'Kinh nghiệm làm việc', bump: '↑ 30%', desc: 'Thể hiện những thông tin chi tiết về quá trình làm việc' },
    { id: 'skills', title: 'Kỹ năng', bump: '↑ 20%', desc: 'Liệt kê các kỹ năng chuyên môn của bạn' },
    { id: 'languages', title: 'Ngoại ngữ', bump: '↑ 10%', desc: 'Liệt kê các ngôn ngữ mà bạn biết' },
    { id: 'projects', title: 'Dự án nổi bật', bump: '↑ 5%', desc: 'Giới thiệu dự án nổi bật của bạn' },
    { id: 'certificates', title: 'Chứng chỉ', bump: '↑ 5%', desc: 'Bổ sung chứng chỉ liên quan đến kỹ năng của bạn' },
    { id: 'awards', title: 'Giải thưởng', bump: '↑ 5%', desc: 'Thể hiện giải thưởng hoặc thành tích mà bạn đạt được' },
  ];

  const avatarLetter = (profile.fullName || 'L').trim().charAt(0).toUpperCase();

  return (
    <div className="itv-dash-page">
      <div className="container itv-dash-container">
        {/* =========================================================
            CỘT TRÁI: SIDEBAR THÔNG TIN VÀ ĐIỀU HƯỚNG
            ========================================================= */}
        <aside className="itv-dash-sidebar">
          {/* Card trạng thái người dùng (Gọn gàng theo yêu cầu trước) */}
          <div className="itv-user-status-card">
            <div className="itv-status-greeting">
              <span className="itv-wave-hand">👋</span>
              <span className="itv-greeting-label">Xin chào</span>
            </div>
            <h3 className="itv-status-username" title={profile.fullName}>
              {profile.fullName}
            </h3>
          </div>

          {/* Card menu điều hướng */}
          <nav className="itv-sidebar-nav-card" aria-label="Điều hướng hồ sơ">
            <button
              type="button"
              className={`itv-nav-item ${activeTab === 'overview' ? 'is-active' : ''}`}
              onClick={() => changeTab('overview', '/ung-vien')}
            >
              <LayoutGrid size={18} className="itv-nav-icon" />
              <span>Tổng quan</span>
            </button>

            <button
              type="button"
              className={`itv-nav-item ${activeTab === 'profile' ? 'is-active' : ''}`}
              onClick={() => changeTab('profile', '/ung-vien/ho-so')}
            >
              <User size={18} className="itv-nav-icon" />
              <span>Hồ sơ của tôi</span>
            </button>

            <button
              type="button"
              className={`itv-nav-item ${activeTab === 'create-cv' ? 'is-active' : ''}`}
              onClick={() => changeTab('create-cv', '/ung-vien/tao-cv')}
            >
              <FileText size={18} className="itv-nav-icon" />
              <span>Tạo CV</span>
            </button>

            <button
              type="button"
              className={`itv-nav-item ${activeTab === 'my-jobs' ? 'is-active' : ''}`}
              onClick={() => changeTab('my-jobs', '/ung-vien/viec-lam')}
            >
              <Briefcase size={18} className="itv-nav-icon" />
              <span>Việc làm của tôi</span>
            </button>

            <button
              type="button"
              className={`itv-nav-item ${activeTab === 'invitations' ? 'is-active' : ''}`}
              onClick={() => changeTab('invitations', '/ung-vien/loi-moi')}
            >
              <Inbox size={18} className="itv-nav-icon" />
              <div className="itv-nav-item-content">
                <span>Lời mời công việc</span>
                <span className="itv-pill-count">0</span>
              </div>
            </button>

            <button
              type="button"
              className={`itv-nav-item ${activeTab === 'messages' ? 'is-active' : ''}`}
              onClick={() => changeTab('messages', '/ung-vien/tin-nhan')}
            >
              <MessageSquare size={18} className="itv-nav-icon" />
              <div className="itv-nav-item-content">
                <span>Tin nhắn với NTD</span>
                {totalUnreadChat > 0 && <span className="itv-pill-count">{totalUnreadChat}</span>}
              </div>
            </button>

            <button
              type="button"
              className={`itv-nav-item ${activeTab === 'email' ? 'is-active' : ''}`}
              onClick={() => changeTab('email', '/ung-vien/dang-ky-email')}
            >
              <Mail size={18} className="itv-nav-icon" />
              <span>Đăng ký nhận email</span>
            </button>

            <button
              type="button"
              className={`itv-nav-item ${activeTab === 'notifications' ? 'is-active' : ''}`}
              onClick={() => changeTab('notifications', '/ung-vien/thong-bao')}
            >
              <Bell size={18} className="itv-nav-icon" />
              <span>Thông báo</span>
            </button>

            <button
              type="button"
              className={`itv-nav-item ${activeTab === 'settings' ? 'is-active' : ''}`}
              onClick={() => changeTab('settings', '/ung-vien/cai-dat')}
            >
              <Settings size={18} className="itv-nav-icon" />
              <span>Cài đặt</span>
            </button>
          </nav>
        </aside>

        {/* =========================================================
            CỘT PHẢI: HIỂN THỊ NỘI DUNG TỪNG TAB
            ========================================================= */}
        <main className="itv-dash-main">
          {/* TAB 1: TỔNG QUAN */}
          {activeTab === 'overview' && (
            <>
              <section className="itv-dash-card itv-profile-header-card">
                <div className="itv-profile-head-left">
                  <div className="itv-dash-avatar-circle">
                    <span>{avatarLetter}</span>
                  </div>
                  <div className="itv-dash-user-meta">
                    <h2 className="itv-dash-fullname">{profile.fullName}</h2>
                    <div className="itv-dash-email-row">
                      <Mail size={15} />
                      <span>{profile.email}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="itv-update-profile-btn"
                  onClick={() => changeTab('profile', '/ung-vien/ho-so')}
                >
                  <span>Cập nhật hồ sơ</span>
                  <ChevronRight size={16} />
                </button>
              </section>

              <section className="itv-dash-card itv-employer-views-card">
                <span className="itv-card-tag-new">MỚI</span>
                <div className="itv-views-metric-box">
                  <strong className="itv-metric-number">0</strong>
                  <span className="itv-metric-sub">lượt xem</span>
                </div>
                <div className="itv-views-desc-block">
                  <h3 className="itv-views-title">Nhà tuyển dụng xem CV</h3>
                  <p className="itv-views-text">
                    CV ẩn danh của bạn được các nhà tuyển dụng xem khi tìm kiếm ứng viên.
                  </p>
                </div>
              </section>

              <section className="itv-dash-card itv-attached-resume-card">
                <h3 className="itv-section-heading">Hồ sơ đính kèm của bạn</h3>
                <div className="itv-resume-file-box">
                  <div className="itv-resume-icon-wrap">
                    <div className="itv-pdf-icon-graphic">
                      <div className="itv-pdf-icon-header">
                        <div className="itv-pdf-user-mini" />
                      </div>
                      <div className="itv-pdf-icon-lines">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                  <div className="itv-resume-file-info">
                    <a
                      href="#download-cv"
                      className="itv-resume-file-name"
                      onClick={(e) => {
                        e.preventDefault();
                        showToast(`Đang tải xuống: ${profile.cvFileName}`);
                      }}
                    >
                      {profile.cvFileName}
                    </a>
                    <p className="itv-resume-updated-time">
                      Cập nhật lần cuối: {profile.cvLastUpdated}
                    </p>
                    <button
                      type="button"
                      className="itv-resume-upload-action"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <span>Tải lên ngay</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </section>

              <section className="itv-dash-card itv-activities-card">
                <h3 className="itv-section-heading">Hoạt động của bạn</h3>
                <div className="itv-activity-grid">
                  <button
                    type="button"
                    className="itv-activity-box itv-box-applied"
                    onClick={() => changeTab('my-jobs', '/ung-vien/viec-lam')}
                  >
                    <span className="itv-act-title">Việc làm đã ứng tuyển</span>
                    <strong className="itv-act-num">{applications.length}</strong>
                    <div className="itv-act-bg-graphic"><Send size={44} /></div>
                  </button>

                  <button
                    type="button"
                    className="itv-activity-box itv-box-saved"
                    onClick={() => changeTab('my-jobs', '/ung-vien/viec-lam')}
                  >
                    <span className="itv-act-title">Việc làm đã lưu</span>
                    <strong className="itv-act-num">{savedJobIds.size}</strong>
                    <div className="itv-act-bg-graphic"><Heart size={44} fill="currentColor" /></div>
                  </button>

                  <button
                    type="button"
                    className="itv-activity-box itv-box-invitations"
                    onClick={() => changeTab('invitations', '/ung-vien/loi-moi')}
                  >
                    <span className="itv-act-title">Lời mời công việc</span>
                    <strong className="itv-act-num">0</strong>
                    <div className="itv-act-bg-graphic"><Mail size={44} /></div>
                  </button>
                </div>
              </section>
            </>
          )}

          {/* TAB 2: HỒ SƠ CỦA TÔI */}
          {activeTab === 'profile' && (
            <>
              <section className="itv-dash-card itv-cv-manage-card">
                <h2 className="itv-section-heading">Quản lý CV</h2>
                <div className="itv-notice-purple-banner">
                  <span className="itv-purple-badge">
                    <Zap size={14} /> Bạn nên biết:
                  </span>
                  <span className="itv-purple-text">
                    ITviec luôn gửi CV gần nhất cho nhà tuyển dụng khi bạn ứng tuyển hoặc chấp nhận chia sẻ CV qua Lời mời công việc.
                  </span>
                </div>

                <div className="itv-your-cv-box">
                  <h3 className="itv-your-cv-heading">CV của bạn</h3>
                  <div className="itv-resume-file-box itv-profile-resume-box">
                    <div className="itv-resume-icon-wrap">
                      <div className="itv-pdf-icon-graphic">
                        <div className="itv-pdf-icon-header"><div className="itv-pdf-user-mini" /></div>
                        <div className="itv-pdf-icon-lines"><span /><span /><span /></div>
                      </div>
                    </div>
                    <div className="itv-resume-file-info">
                      <a href="#download" className="itv-resume-file-name">{profile.cvFileName}</a>
                      <p className="itv-resume-updated-time">Cập nhật lần cuối: {profile.cvLastUpdated}</p>
                    </div>
                  </div>

                  <div className="itv-upload-cv-action-row">
                    <button
                      type="button"
                      className="itv-upload-outline-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={16} />
                      <span>Tải CV lên</span>
                    </button>
                    <p className="itv-upload-hint-text">
                      Hỗ trợ định dạng .doc, .docx hoặc .pdf, dưới 3MB và không chứa mật khẩu bảo vệ
                    </p>
                  </div>

                  <div className="itv-cv-status-row">
                    <div className="itv-status-badge-group">
                      <span className="itv-status-title">Trạng thái:</span>
                      <span className="itv-pill-fresher">{profile.cvStatus || 'Fresher'}</span>
                    </div>
                    <p className="itv-fresher-note">
                      <Info size={14} className="itv-fresher-info-icon" />
                      <span>
                        CV của bạn được đánh dấu là Fresher. Bạn có thể ứng tuyển vào các công việc có gắn nhãn{' '}
                        <span className="itv-text-link">Chấp nhận Fresher</span>.
                      </span>
                    </p>
                  </div>
                </div>

                <div className="itv-cv-audit-help-row">
                  <a href="#audit" className="itv-audit-help-link" onClick={(e) => { e.preventDefault(); showToast('Đội ngũ chuyên gia ITviec sẽ xét duyệt CV theo từ khóa và năng lực.'); }}>
                    Bạn thắc mắc CV của mình được xét duyệt như thế nào?
                  </a>
                </div>
              </section>

              <section className="itv-dash-card itv-info-section-card">
                <div className="itv-card-header-with-action">
                  <h2 className="itv-section-heading">Thông tin cơ bản</h2>
                  <button type="button" className="itv-card-edit-btn" onClick={() => openModal('basic')}>
                    <SquarePen size={18} />
                  </button>
                </div>
                <div className="itv-detail-fields-list">
                  <div className="itv-detail-field-row">
                    <span className="itv-df-label">Họ và Tên</span>
                    <strong className="itv-df-value">{profile.fullName}</strong>
                  </div>
                  <div className="itv-detail-field-row">
                    <span className="itv-df-label">Số điện thoại</span>
                    <strong className="itv-df-value">{profile.phone}</strong>
                  </div>
                  <div className="itv-detail-field-row">
                    <span className="itv-df-label">Nơi làm việc mong muốn</span>
                    <strong className="itv-df-value">{profile.desiredLocation}</strong>
                  </div>
                  <div className="itv-detail-field-row">
                    <span className="itv-df-label">Chuyên môn</span>
                    {profile.expertise ? <strong className="itv-df-value">{profile.expertise}</strong> : <button type="button" className="itv-missing-info-btn" onClick={() => openModal('basic')}><AlertCircle size={15} /><span>Thêm thông tin</span></button>}
                  </div>
                  <div className="itv-detail-field-row">
                    <span className="itv-df-label">Ngoại ngữ</span>
                    {profile.languages ? <strong className="itv-df-value">{profile.languages}</strong> : <button type="button" className="itv-missing-info-btn" onClick={() => openModal('basic')}><AlertCircle size={15} /><span>Thêm thông tin</span></button>}
                  </div>
                </div>
              </section>

              <section className="itv-dash-card itv-info-section-card">
                <div className="itv-card-header-with-action">
                  <h2 className="itv-section-heading">Thông tin chung</h2>
                  <button type="button" className="itv-card-edit-btn" onClick={() => openModal('general')}>
                    <SquarePen size={18} />
                  </button>
                </div>
                <div className="itv-detail-fields-list">
                  <div className="itv-detail-field-row">
                    <span className="itv-df-label">Tổng số năm kinh nghiệm</span>
                    {profile.experienceYears ? <strong className="itv-df-value">{profile.experienceYears}</strong> : <span className="itv-text-placeholder-btn" onClick={() => openModal('general')}>Thêm thông tin</span>}
                  </div>
                  <div className="itv-detail-field-row">
                    <span className="itv-df-label">Cấp bậc hiện tại</span>
                    {profile.currentLevel ? <strong className="itv-df-value">{profile.currentLevel}</strong> : <span className="itv-text-placeholder-btn" onClick={() => openModal('general')}>Thêm thông tin</span>}
                  </div>
                  <div className="itv-detail-field-row">
                    <span className="itv-df-label">Hình thức làm việc mong muốn</span>
                    {profile.workType ? <strong className="itv-df-value">{profile.workType}</strong> : <span className="itv-text-placeholder-btn" onClick={() => openModal('general')}>Thêm thông tin</span>}
                  </div>
                  <div className="itv-detail-field-row">
                    <span className="itv-df-label">Mức lương mong muốn</span>
                    <strong className="itv-df-value itv-df-salary">{profile.expectedSalary}</strong>
                  </div>
                </div>
              </section>

              <section className="itv-dash-card itv-cover-letter-card">
                <div className="itv-cover-letter-head">
                  <h2 className="itv-section-heading">Thư xin việc</h2>
                  <div className="itv-cl-actions-group">
                    <div className="itv-letter-icon-graphic"><FileText size={20} /></div>
                    <button type="button" className="itv-card-edit-btn" onClick={() => openModal('coverLetter')}>
                      <SquarePen size={18} />
                    </button>
                  </div>
                </div>
                <div className="itv-cover-letter-body">
                  {profile.coverLetter ? (
                    <p className="itv-cl-content-active">{profile.coverLetter}</p>
                  ) : (
                    <p className="itv-cl-placeholder-text" onClick={() => openModal('coverLetter')}>
                      Giới thiệu bản thân và lý do vì sao bạn sẽ là lựa chọn tuyển dụng tuyệt vời
                    </p>
                  )}
                </div>
              </section>
            </>
          )}

          {/* TAB 3: TẠO CV (KHỚP ẢNH 1) */}
          {activeTab === 'create-cv' && (
            <div className="itv-cv-builder-grid">
              <div className="itv-cv-builder-left">
                {/* Header Profile Thẻ Tạo CV */}
                <section className="itv-dash-card itv-cv-head-card">
                  <div className="itv-cv-head-top">
                    <div className="itv-cv-avatar-wrap">
                      <span className="itv-bump-badge">↑ 10%</span>
                      <div className="itv-dash-avatar-circle">
                        <span>{avatarLetter}</span>
                      </div>
                    </div>
                    <div className="itv-cv-head-info">
                      <div className="itv-cv-name-row">
                        <h2 className="itv-dash-fullname">{profile.fullName}</h2>
                        <button type="button" className="itv-card-edit-btn" onClick={() => openModal('basic')}>
                          <SquarePen size={18} />
                        </button>
                      </div>
                      <span className="itv-cv-job-title-prompt" onClick={() => openModal('basic')}>
                        {profile.title || 'Cập nhật chức danh'}
                      </span>
                    </div>
                  </div>

                  <div className="itv-cv-required-warning">
                    <AlertTriangle size={15} />
                    <span>Thiếu thông tin bắt buộc</span>
                  </div>

                  <div className="itv-cv-meta-grid">
                    <div className="itv-cv-meta-cell">
                      <Mail size={14} />
                      <span title={profile.email}>{profile.email}</span>
                    </div>
                    <div className="itv-cv-meta-cell">
                      <Briefcase size={14} />
                      <span>{profile.phone}</span>
                    </div>
                    <div className="itv-cv-meta-cell is-empty" onClick={() => openModal('basic')}>
                      <Calendar size={14} />
                      <span>Ngày sinh</span>
                    </div>
                    <div className="itv-cv-meta-cell is-empty" onClick={() => openModal('basic')}>
                      <User size={14} />
                      <span>Giới tính</span>
                    </div>
                    <div className="itv-cv-meta-cell is-empty" onClick={() => openModal('basic')}>
                      <MapPin size={14} />
                      <span>Địa chỉ hiện tại</span>
                    </div>
                    <div className="itv-cv-meta-cell is-empty" onClick={() => openModal('basic')}>
                      <Globe size={14} />
                      <span>Link cá nhân</span>
                    </div>
                  </div>
                </section>

                {/* Danh sách 8 khối thông tin CV có dấu cộng (+) */}
                <div className="itv-cv-sections-list">
                  {cvSections.map((sec) => (
                    <div
                      key={sec.id}
                      className="itv-dash-card itv-cv-section-item"
                      onClick={() => showToast(`Thêm mục: ${sec.title}`)}
                    >
                      <div className="itv-cv-sec-info">
                        <div className="itv-cv-sec-title-row">
                          <strong className="itv-cv-sec-title">{sec.title}</strong>
                          <span className="itv-bump-pill">{sec.bump}</span>
                        </div>
                        <p className="itv-cv-sec-desc">{sec.desc}</p>
                      </div>
                      <div className="itv-cv-add-btn">
                        <PlusCircle size={22} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cột phải: Độ hoàn thiện hồ sơ & Cập nhật nhanh */}
              <div className="itv-cv-builder-right">
                <section className="itv-dash-card itv-cv-completion-card">
                  <div className="itv-completion-header">
                    <h3>Độ hoàn thiện hồ sơ</h3>
                    <strong className="itv-completion-number">{profile.completionRate}%</strong>
                  </div>
                  <div className="itv-completion-bar-track">
                    <div className="itv-completion-bar-fill" style={{ width: `${profile.completionRate}%` }} />
                  </div>
                  <p className="itv-completion-hint">
                    Nâng cấp hồ sơ của bạn lên <strong>70%</strong> để bắt đầu tạo mẫu CV IT chuyên nghiệp.
                  </p>
                  <ul className="itv-completion-steps">
                    <li>
                      <div className="itv-cs-label">
                        <PlusCircle size={15} />
                        <span>Kinh nghiệm làm việc</span>
                      </div>
                      <span className="itv-bump-pill">↑ 30%</span>
                    </li>
                    <li>
                      <div className="itv-cs-label">
                        <PlusCircle size={15} />
                        <span>Kỹ năng</span>
                      </div>
                      <span className="itv-bump-pill">↑ 20%</span>
                    </li>
                    <li>
                      <div className="itv-cs-label">
                        <PlusCircle size={15} />
                        <span>Thông tin cá nhân</span>
                      </div>
                      <span className="itv-bump-pill">↑ 10%</span>
                    </li>
                  </ul>
                </section>

                <section className="itv-dash-card itv-cv-autofill-card">
                  <div className="itv-autofill-header">
                    <h3>Cập nhật nhanh hồ sơ của bạn</h3>
                    <span className="itv-tag-new-green">NEW</span>
                  </div>
                  <p className="itv-autofill-desc">Điền nhanh hồ sơ bằng CV của bạn chỉ với ít phút.</p>
                  <button
                    type="button"
                    className="itv-autofill-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Điền hồ sơ tự động
                  </button>
                </section>
              </div>
            </div>
          )}

          {/* TAB 4: VIỆC LÀM CỦA TÔI (KHỚP ẢNH 2) */}
          {activeTab === 'my-jobs' && (
            <div className="itv-my-jobs-wrapper">
              <section className="itv-dash-card itv-my-jobs-card">
                <h2 className="itv-section-heading">Việc làm của tôi</h2>

                {/* 3 Sub-tabs */}
                <div className="itv-subtabs-row">
                  <button
                    type="button"
                    className={`itv-subtab-btn ${myJobsSubTab === 'applied' ? 'is-active' : ''}`}
                    onClick={() => setMyJobsSubTab('applied')}
                  >
                    <span>Đã ứng tuyển</span>
                    <span className="itv-subtab-counter">{applications.length}</span>
                  </button>
                  <button
                    type="button"
                    className={`itv-subtab-btn ${myJobsSubTab === 'saved' ? 'is-active' : ''}`}
                    onClick={() => setMyJobsSubTab('saved')}
                  >
                    <span>Đã lưu</span>
                    <span className="itv-subtab-counter">{savedJobIds.size}</span>
                  </button>
                  <button
                    type="button"
                    className={`itv-subtab-btn ${myJobsSubTab === 'recent' ? 'is-active' : ''}`}
                    onClick={() => setMyJobsSubTab('recent')}
                  >
                    <span>Đã xem gần đây</span>
                    <span className="itv-subtab-counter itv-counter-red">{recentViewedJobs.length}</span>
                  </button>
                </div>

                {/* Notice & Sort row */}
                <div className="itv-jobs-filter-line">
                  <span className="itv-jfl-note">
                    <Info size={14} /> Chỉ hiển thị công việc đã xem trong 3 tháng gần nhất.
                  </span>
                  <div className="itv-jfl-sort">
                    <span>Sắp xếp theo: <strong>Xem gần nhất</strong></span>
                    <ChevronDown size={14} />
                  </div>
                </div>

                {/* Danh sách việc làm đã xem gần đây */}
                <div className="itv-recent-jobs-list">
                  {recentViewedJobs.map((item) => (
                    <div key={item.id} className="itv-recent-job-item">
                      <div className="itv-rji-logo-wrap">
                        <span className="itv-company-badge-name">{item.logoText}</span>
                      </div>
                      <div className="itv-rji-content">
                        <Link to="/viec-lam" className="itv-rji-title">
                          {item.title}
                        </Link>
                        <p className="itv-rji-company">{item.company}</p>
                        <p className="itv-rji-location">{item.location}</p>
                        {item.perk && (
                          <div className="itv-rji-perk">
                            <span className="itv-dollar-icon">$</span>
                            <span>{item.perk}</span>
                          </div>
                        )}
                        {item.salary && (
                          <div className="itv-rji-salary">
                            <span className="itv-dollar-icon">$</span>
                            <span>{item.salary}</span>
                          </div>
                        )}
                      </div>

                      <div className="itv-rji-actions-col">
                        <span className="itv-rji-time">{item.posted}</span>
                        <div className="itv-rji-btns-row">
                          <Link to="/viec-lam" className="itv-rji-apply-btn">
                            Ứng tuyển
                          </Link>
                          <button
                            type="button"
                            className={`itv-rji-save-btn ${isJobSaved(item.id) ? 'is-saved' : ''}`}
                            onClick={() => toggleSaveJob(item.id)}
                            aria-label="Lưu việc làm"
                          >
                            <Heart size={18} fill={isJobSaved(item.id) ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* TAB 5: LỜI MỜI CÔNG VIỆC (KHỚP ẢNH 3) */}
          {activeTab === 'invitations' && (
            <section className="itv-dash-card itv-invitations-card">
              <h2 className="itv-section-heading">Lời mời công việc</h2>
              <p className="itv-invitations-sub">
                ITviec cung cấp dịch vụ kết nối ứng viên ẩn danh với các cơ hội việc làm phù hợp. Tìm hiểu thêm về Lời mời công việc <a href="#learn" className="itv-text-link">tại đây</a>.
              </p>

              {/* Sub-tabs */}
              <div className="itv-subtabs-row">
                <button
                  type="button"
                  className={`itv-subtab-btn ${invitationsSubTab === 'pending' ? 'is-active' : ''}`}
                  onClick={() => setInvitationsSubTab('pending')}
                >
                  <span>Đang chờ</span>
                  <span className="itv-subtab-counter itv-counter-red">0</span>
                </button>
                <button
                  type="button"
                  className={`itv-subtab-btn ${invitationsSubTab === 'accepted' ? 'is-active' : ''}`}
                  onClick={() => setInvitationsSubTab('accepted')}
                >
                  <span>Đã chấp nhận</span>
                  <span className="itv-subtab-counter">0</span>
                </button>
                <button
                  type="button"
                  className={`itv-subtab-btn ${invitationsSubTab === 'expired' ? 'is-active' : ''}`}
                  onClick={() => setInvitationsSubTab('expired')}
                >
                  <span>Đã hết hạn</span>
                  <span className="itv-subtab-counter">0</span>
                </button>
              </div>

              <div className="itv-invitations-notice">
                <Info size={14} />
                <span>Mục này lưu trữ lời mời còn hiệu lực, bạn có thể xem chi tiết và chia sẻ CV.</span>
              </div>

              {/* Empty state biểu tượng robot ITviec */}
              <div className="itv-empty-robot-state">
                <div className="itv-robot-box-graphic">
                  <div className="itv-robot-antennae" />
                  <div className="itv-robot-face">
                    <span className="itv-rf-eye">✕</span>
                    <span className="itv-rf-eye">✕</span>
                    <span className="itv-rf-mouth" />
                  </div>
                </div>
                <p className="itv-empty-text">Bạn có 0 Lời mời đang chờ</p>
              </div>
            </section>
          )}

          {/* TAB: TIN NHẮN VỚI NHÀ TUYỂN DỤNG */}
          {activeTab === 'messages' && (
            <section className="itv-candidate-chat-card itv-dash-card" ref={cardContainerRef}>
              <div className="itv-candidate-chat-container">
                {/* CỘT TRÁI: DANH SÁCH DOANH NGHIỆP TUYỂN DỤNG */}
                <div className="itv-chat-sidebar-col">
                  <div className="itv-chat-sidebar-header">
                    <div className="itv-chat-sidebar-title-row">
                      <div className="itv-chat-title-group">
                        <MessageSquare size={19} className="itv-chat-title-icon" />
                        <h2 className="itv-chat-main-title">Tin nhắn tuyển dụng</h2>
                      </div>
                      {totalUnreadChat > 0 && (
                        <span className="itv-chat-unread-badge">{totalUnreadChat} mới</span>
                      )}
                    </div>

                    <div className="itv-chat-search-wrap">
                      <Search size={15} className="itv-chat-search-icon" />
                      <input
                        type="text"
                        placeholder="Tìm công ty, vị trí, HR..."
                        value={chatSearch}
                        onChange={(e) => setChatSearch(e.target.value)}
                        className="itv-chat-search-input"
                      />
                    </div>

                    <div className="itv-chat-filters-row">
                      <button
                        type="button"
                        className={`itv-chat-filter-btn ${chatFilter === 'all' ? 'is-active' : ''}`}
                        onClick={() => setChatFilter('all')}
                      >
                        Tất cả ({conversations.length})
                      </button>
                      <button
                        type="button"
                        className={`itv-chat-filter-btn ${chatFilter === 'unread' ? 'is-active' : ''}`}
                        onClick={() => setChatFilter('unread')}
                      >
                        Chưa đọc {totalUnreadChat > 0 && `(${totalUnreadChat})`}
                      </button>
                    </div>
                  </div>

                  {/* Danh sách các cuộc trò chuyện */}
                  <div className="itv-chat-convs-list">
                    {conversations.length === 0 ? (
                      <div className="itv-chat-convs-empty">
                        <MessageSquare size={32} />
                        <p>Chưa có cuộc trò chuyện nào phù hợp.</p>
                      </div>
                    ) : (
                      conversations.map((conv) => {
                        const isActive = conv.id === activeConvId;
                        return (
                          <button
                            type="button"
                            key={conv.id}
                            className={`itv-chat-conv-item ${isActive ? 'is-active' : ''} ${conv.unreadCount > 0 ? 'is-unread' : ''}`}
                            onClick={(e) => handleSelectConv(e, conv.id)}
                          >
                            <div className="itv-conv-avatar-box">
                              <span className="itv-conv-initials">{conv.companyInitials}</span>
                              {conv.isOnline && <span className="itv-conv-online-dot" title="Đang hoạt động" />}
                            </div>

                            <div className="itv-conv-content">
                              <div className="itv-conv-top-line">
                                <strong className="itv-conv-company">{conv.companyName}</strong>
                                <span className="itv-conv-time">
                                  {new Date(conv.lastMessageTime).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>

                              <span className="itv-conv-job-tag" title={conv.jobTitle}>
                                {conv.jobTitle}
                              </span>

                              <p className="itv-conv-snippet">{conv.lastMessage}</p>
                            </div>

                            {conv.unreadCount > 0 && (
                              <span className="itv-conv-unread-pill">{conv.unreadCount}</span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* CỘT PHẢI: KHUNG TRÒ CHUYỆN CHI TIẾT */}
                {(() => {
                  const selectedConv = conversations.find((c) => c.id === activeConvId) || conversations[0];
                  if (!selectedConv) {
                    return (
                      <div className="itv-chat-no-selection">
                        <MessageSquare size={48} />
                        <h3>Chọn một nhà tuyển dụng</h3>
                        <p>Chọn doanh nghiệp trong danh sách bên trái để bắt đầu trao đổi chi tiết.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="itv-chat-main-pane">
                      {/* Header hội thoại */}
                      <div className="itv-chat-header-pane">
                        <div className="itv-chp-top-row">
                          <div className="itv-chp-left">
                            <div className="itv-chp-avatar">
                              <span>{selectedConv.companyInitials}</span>
                              {selectedConv.isOnline && <span className="itv-chp-online-indicator" />}
                            </div>
                            <div className="itv-chp-meta">
                              <div className="itv-chp-company-row">
                                <h3 className="itv-chp-company-name">{selectedConv.companyName}</h3>
                                <span className="itv-chp-verified-badge">
                                  <ShieldCheck size={13} /> Doanh nghiệp
                                </span>
                              </div>
                              <div className="itv-chp-recruiter-line">
                                <span className="itv-chp-recruiter">{selectedConv.recruiterName}</span>
                                <span className="itv-chp-dot">•</span>
                                <span className="itv-chp-response-hint">{selectedConv.responseTime}</span>
                              </div>
                            </div>
                          </div>

                          <div className="itv-chp-actions">
                            <Link to="/viec-lam" className="itv-chp-view-job-link">
                              <span>Xem tin tuyển dụng</span>
                              <ExternalLink size={13} />
                            </Link>
                          </div>
                        </div>

                        <div className="itv-chp-job-context-bar">
                          <div className="itv-chp-job-pill" title={selectedConv.jobTitle}>
                            <Briefcase size={14} className="itv-job-icon" />
                            <span className="itv-job-prefix">Vị trí:</span>
                            <strong className="itv-job-name">{selectedConv.jobTitle}</strong>
                          </div>
                          {selectedConv.salary && (
                            <span className="itv-chp-tag-pill itv-tag-salary">💰 {selectedConv.salary}</span>
                          )}
                          {selectedConv.location && (
                            <span className="itv-chp-tag-pill itv-tag-location">📍 {selectedConv.location}</span>
                          )}
                        </div>
                      </div>

                      {/* Thông báo bảo mật cố định dưới header */}
                      <div className="itv-chat-safety-notice">
                        <ShieldCheck size={15} className="itv-safety-shield-icon" />
                        <span>JobViet bảo mật danh tính ứng viên. Không nộp phí hay chia sẻ mã OTP cho bất kỳ ai.</span>
                      </div>

                      {/* Dòng thời gian tin nhắn (cuộn nội bộ) */}
                      <div className="itv-chat-timeline-pane" ref={timelinePaneRef}>
                        {chatMessages.map((msg) => {
                          const isMe = msg.senderType === 'candidate';
                          return (
                            <div
                              key={msg.id}
                              className={`itv-chat-bubble-row ${isMe ? 'is-candidate' : 'is-employer'}`}
                            >
                              {!isMe && (
                                <div className="itv-bubble-avatar">
                                  <span>{selectedConv.companyInitials}</span>
                                </div>
                              )}

                              <div className="itv-bubble-content-col">
                                <span className="itv-bubble-sender-name">
                                  {isMe ? 'Bạn' : msg.senderName}
                                </span>
                                <div className="itv-bubble-box">
                                  <p className="itv-bubble-text">{msg.content}</p>
                                  {msg.attachment && (
                                    <div className="itv-bubble-attachment-box">
                                      <FileText size={15} />
                                      <span>{msg.attachment}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="itv-bubble-meta-row">
                                  <span className="itv-bubble-time">{msg.timeFormatted}</span>
                                  {isMe && (
                                    <span className="itv-bubble-status">
                                      <CheckCheck size={13} className="itv-check-icon" /> Đã gửi
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Gợi ý câu hỏi nhanh dành cho ứng viên với nút cuộn trái/phải */}
                      <div className="itv-chat-quick-questions-bar">
                        <button
                          type="button"
                          className="itv-qq-arrow-btn"
                          title="Cuộn sang trái"
                          onClick={() => {
                            if (quickQuestionsRef.current) {
                              quickQuestionsRef.current.scrollBy({ left: -140, behavior: 'smooth' });
                            }
                          }}
                        >
                          <ChevronLeft size={14} />
                        </button>

                        <div className="itv-qq-label">
                          <Sparkles size={14} />
                          <span>Gợi ý hỏi nhanh:</span>
                        </div>

                        <div className="itv-qq-chips-list" ref={quickQuestionsRef}>
                          {CANDIDATE_QUICK_QUESTIONS.map((q) => (
                            <button
                              key={q.id}
                              type="button"
                              className="itv-qq-chip"
                              onClick={() => handleSendQuickQuestion(q.message)}
                            >
                              {q.text}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          className="itv-qq-arrow-btn"
                          title="Cuộn sang phải"
                          onClick={() => {
                            if (quickQuestionsRef.current) {
                              quickQuestionsRef.current.scrollBy({ left: 140, behavior: 'smooth' });
                            }
                          }}
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>

                      {/* Ô nhập tin nhắn */}
                      <form className="itv-chat-input-bar" onSubmit={handleSendMessageSubmit}>
                        <button
                          type="button"
                          className="itv-chat-attach-btn"
                          title={`Đính kèm file CV (${profile.cvFileName})`}
                          onClick={() => {
                            setInputMessage((prev) =>
                              prev
                                ? `${prev}\n[Đính kèm hồ sơ: ${profile.cvFileName}]`
                                : `[Đính kèm hồ sơ: ${profile.cvFileName}]`
                            );
                            showToast(`Đã đính kèm ${profile.cvFileName}`);
                          }}
                        >
                          <Paperclip size={18} />
                        </button>

                        <input
                          type="text"
                          placeholder="Nhập tin nhắn gửi nhà tuyển dụng (Nhấn Enter để gửi)..."
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          className="itv-chat-text-input"
                        />

                        <button
                          type="submit"
                          className="itv-chat-send-btn"
                          disabled={!inputMessage.trim() || isSendingMsg}
                        >
                          <Send size={16} />
                          <span>Gửi</span>
                        </button>
                      </form>
                    </div>
                  );
                })()}
              </div>
            </section>
          )}

          {/* TAB 6: ĐĂNG KÝ NHẬN EMAIL (KHỚP ẢNH 4) */}
          {activeTab === 'email' && (
            <div className="itv-email-subs-wrapper">
              {/* Thẻ 1: Kỹ năng đã đăng ký */}
              <section className="itv-dash-card itv-email-card">
                <h2 className="itv-section-heading">Kỹ năng đã đăng ký ({registeredAlerts.length}/5)</h2>
                <p className="itv-email-sub">Đăng ký Job Robot để không bỏ lỡ việc làm phù hợp với kỹ năng của bạn.</p>

                <form
                  className="itv-email-register-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newKeyword.trim()) return;
                    if (registeredAlerts.length >= 5) {
                      showToast('Bạn chỉ có thể đăng ký tối đa 5 thông báo việc làm.');
                      return;
                    }
                    setRegisteredAlerts([
                      ...registeredAlerts,
                      { id: Date.now(), text: `${newKeyword.trim()} tại ${newLocation}`, active: true }
                    ]);
                    setNewKeyword('');
                    showToast('Đăng ký Job Robot thành công!');
                  }}
                >
                  <input
                    type="text"
                    className="itv-input-text"
                    placeholder="Tìm kiếm kỹ năng, chức vụ..."
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                  />
                  <select
                    className="itv-select-custom"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                  >
                    <option value="TP Hồ Chí Minh">TP Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Toàn quốc">Toàn quốc</option>
                  </select>
                  <button type="submit" className="itv-btn-red-fill">Đăng ký</button>
                </form>

                <div className="itv-registered-alerts-list">
                  {registeredAlerts.map((alert, idx) => (
                    <div key={alert.id} className="itv-alert-item-row">
                      <span className="itv-alert-text">
                        <strong>{idx + 1}.</strong> {alert.text}
                      </span>
                      <div className="itv-alert-actions">
                        <span className={`itv-badge-registered ${alert.active ? 'is-active' : 'is-paused'}`}>
                          {alert.active ? 'Đã đăng ký' : 'Tạm dừng'}
                        </span>
                        <button
                          type="button"
                          className="itv-alert-icon-btn"
                          title={alert.active ? 'Tạm dừng nhận thông báo' : 'Tiếp tục nhận thông báo'}
                          onClick={() => {
                            setRegisteredAlerts(registeredAlerts.map(a => a.id === alert.id ? { ...a, active: !a.active } : a));
                          }}
                        >
                          {alert.active ? <Pause size={15} /> : <Play size={15} />}
                        </button>
                        <button
                          type="button"
                          className="itv-alert-icon-btn"
                          title="Xóa thông báo này"
                          onClick={() => {
                            setRegisteredAlerts(registeredAlerts.filter(a => a.id !== alert.id));
                            showToast('Đã xóa thông báo việc làm.');
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Thẻ 2: Công ty đã theo dõi */}
              <section className="itv-dash-card itv-email-card">
                <h2 className="itv-section-heading">Công ty đã theo dõi ({blockedCompanies.length}/5)</h2>
                <p className="itv-email-sub">Nhận thêm thông báo khi công ty bạn yêu thích có lượt đánh giá hoặc việc làm mới.</p>

                <div className="itv-email-register-form">
                  <input
                    type="text"
                    className="itv-input-text"
                    placeholder="Tìm kiếm công ty..."
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                  />
                  <button
                    type="button"
                    className="itv-btn-red-fill"
                    onClick={() => {
                      if (!companySearch.trim()) return;
                      setBlockedCompanies([...blockedCompanies, companySearch.trim()]);
                      setCompanySearch('');
                      showToast('Đã theo dõi công ty thành công!');
                    }}
                  >
                    Theo dõi
                  </button>
                </div>

                <div className="itv-empty-robot-state">
                  <div className="itv-mail-empty-graphic">
                    <Mail size={32} />
                  </div>
                  <p className="itv-empty-text">Bạn chưa theo dõi công ty nào.</p>
                </div>
              </section>
            </div>
          )}

          {/* TAB 7: THÔNG BÁO */}
          {activeTab === 'notifications' && (
            <section className="itv-dash-card">
              <h2 className="itv-section-heading">Thông báo</h2>
              <div className="itv-empty-robot-state">
                <Bell size={36} className="itv-empty-bell-icon" />
                <p className="itv-empty-text">Bạn chưa có thông báo mới nào.</p>
              </div>
            </section>
          )}

          {/* TAB 8: CÀI ĐẶT (KHỚP ẢNH 5) */}
          {activeTab === 'settings' && (
            <div className="itv-settings-wrapper">
              {/* Thẻ 1: Thông tin tài khoản */}
              <section className="itv-dash-card itv-setting-section-card">
                <h2 className="itv-section-heading">Thông tin tài khoản</h2>
                <div className="itv-detail-fields-list">
                  <div className="itv-detail-field-row">
                    <span className="itv-df-label">Email:</span>
                    <div className="itv-df-col">
                      <strong className="itv-df-value">{profile.email}</strong>
                      <span className="itv-setting-sub-hint">
                        <Info size={13} /> Không thể thay đổi email đăng nhập.
                      </span>
                    </div>
                  </div>

                  <div className="itv-detail-field-row">
                    <span className="itv-df-label">Họ và Tên:</span>
                    <div className="itv-df-col">
                      <strong className="itv-df-value">{profile.fullName}</strong>
                      <span className="itv-setting-sub-hint">
                        <Info size={13} /> Tên tài khoản được đồng bộ với thông tin hồ sơ.
                      </span>
                      <button
                        type="button"
                        className="itv-settings-text-link"
                        onClick={() => openModal('basic')}
                      >
                        Cập nhật thông tin hồ sơ &gt;
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Thẻ 2: Mật khẩu */}
              <section className="itv-dash-card itv-setting-section-card">
                <h2 className="itv-section-heading">Mật khẩu</h2>
                <p className="itv-setting-sub-hint">
                  <Info size={14} /> Không có mật khẩu đối với tài khoản đăng ký bằng Google.
                </p>
              </section>

              {/* Thẻ 3: Cho phép tìm kiếm CV */}
              <section className="itv-dash-card itv-setting-section-card">
                <div className="itv-setting-title-row">
                  <h2 className="itv-section-heading">Cho phép tìm kiếm CV</h2>
                  <a href="#learn" className="itv-setting-learn-link">
                    <span>Tìm hiểu thêm</span>
                    <ExternalLink size={13} />
                  </a>
                </div>

                <div className="itv-setting-switch-row">
                  <p className="itv-setting-switch-desc">
                    Cho phép nhà tuyển dụng tìm kiếm CV ẩn danh của bạn và gửi lời mời công việc qua email, SMS và ITviec Inbox.
                  </p>
                  <button
                    type="button"
                    className={`itv-red-switch-btn ${profile.isSearchable ? 'is-active' : ''}`}
                    onClick={() => {
                      const next = !profile.isSearchable;
                      setProfile({ ...profile, isSearchable: next });
                      showToast(next ? 'Đã bật Cho phép tìm kiếm CV' : 'Đã tắt tìm kiếm CV');
                    }}
                  >
                    <span className="itv-switch-knob" />
                    <span className="itv-switch-label">{profile.isSearchable ? 'Bật' : 'Tắt'}</span>
                  </button>
                </div>

                <div className="itv-block-companies-block">
                  <h4 className="itv-bc-title">Không nhận lời mời công việc từ:</h4>
                  <span className="itv-bc-sub">Tối đa 5 nhà tuyển dụng</span>
                  <div className="itv-bc-dropdown-box">
                    <span>Tìm kiếm công ty</span>
                    <ChevronDown size={14} />
                  </div>
                  <p className="itv-bc-empty-notice">Chưa chọn công ty nào</p>
                </div>
              </section>

              {/* Thẻ 4: Xoá tài khoản */}
              <section className="itv-dash-card itv-setting-section-card">
                <h2 className="itv-section-heading">Xoá tài khoản</h2>
                <p className="itv-delete-acc-warning">
                  Thao tác xóa tài khoản là vĩnh viễn và không thể hoàn tác. Nếu bạn xóa tài khoản vì nhận quá nhiều email từ ITviec, bạn có thể <a href="#unsub" className="itv-text-link">hủy đăng ký email tại đây</a>.
                </p>
                <button
                  type="button"
                  className="itv-btn-delete-account"
                  onClick={() => {
                    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản vĩnh viễn?')) {
                      showToast('Yêu cầu xóa tài khoản đã được tiếp nhận.');
                    }
                  }}
                >
                  Xoá tài khoản
                </button>
              </section>
            </div>
          )}
        </main>
      </div>

      {/* INPUT FILE ẨN CHUNG ĐỂ UPLOAD CV */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".pdf,.doc,.docx"
        onChange={handleFileUpload}
      />

      {/* MODALS CHỈNH SỬA TỪNG PHẦN */}
      {modalType === 'basic' && (
        <div className="itv-modal-overlay" onClick={closeModal} role="dialog" aria-modal="true">
          <div className="itv-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="itv-modal-header">
              <div className="itv-modal-title-row">
                <SquarePen size={18} className="itv-modal-title-icon" />
                <h3>Chỉnh sửa Thông tin cơ bản</h3>
              </div>
              <button type="button" className="itv-modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="itv-modal-form">
              <div className="itv-form-group">
                <label>Họ và Tên</label>
                <input
                  type="text"
                  value={modalForm.fullName}
                  onChange={(e) => setModalForm({ ...modalForm, fullName: e.target.value })}
                  placeholder="Linh Phạm Văn"
                  required
                />
              </div>

              <div className="itv-form-group">
                <label>Chức danh nghề nghiệp</label>
                <input
                  type="text"
                  value={modalForm.title}
                  onChange={(e) => setModalForm({ ...modalForm, title: e.target.value })}
                  placeholder="Ví dụ: Fullstack Developer"
                />
              </div>

              <div className="itv-form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  value={modalForm.phone}
                  onChange={(e) => setModalForm({ ...modalForm, phone: e.target.value })}
                  placeholder="0393373094"
                  required
                />
              </div>

              <div className="itv-form-group">
                <label>Nơi làm việc mong muốn</label>
                <input
                  type="text"
                  value={modalForm.desiredLocation}
                  onChange={(e) => setModalForm({ ...modalForm, desiredLocation: e.target.value })}
                  placeholder="Ho Chi Minh"
                  required
                />
              </div>

              <div className="itv-form-group">
                <label>Chuyên môn</label>
                <input
                  type="text"
                  value={modalForm.expertise}
                  onChange={(e) => setModalForm({ ...modalForm, expertise: e.target.value })}
                  placeholder="Ví dụ: Backend Developer (Java/Spring Boot)"
                />
              </div>

              <div className="itv-form-group">
                <label>Ngoại ngữ</label>
                <input
                  type="text"
                  value={modalForm.languages}
                  onChange={(e) => setModalForm({ ...modalForm, languages: e.target.value })}
                  placeholder="Ví dụ: Tiếng Anh (Giao tiếp tốt, TOEIC 750)"
                />
              </div>

              <div className="itv-modal-actions">
                <button type="button" className="itv-btn-cancel" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="itv-btn-save">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST THÔNG BÁO */}
      {toastMessage && (
        <div className="itv-toast-notify" role="status">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
