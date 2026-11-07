import { apiClient } from './apiClient';

/**
 * Dịch vụ Quản lý Tin nhắn giữa Ứng viên và Nhà Tuyển Dụng (Candidate Employer Messages Service)
 * Tích hợp REST API backend Spring Boot (/api/v1/chat/*)
 */

export const CANDIDATE_QUICK_QUESTIONS = [
  { id: 'q1', text: '📅 Hỏi về lịch phỏng vấn', message: 'Chào anh/chị, em muốn hỏi về quy trình và thời gian dự kiến tổ chức phỏng vấn cho vị trí này ạ?' },
  { id: 'q2', text: '💼 Hỏi về mức lương & đãi ngộ', message: 'Dạ cho em hỏi thêm về dải lương và chế độ đãi ngộ, bảo hiểm cho vị trí này bên mình với ạ?' },
  { id: 'q3', text: '📄 Gửi CV mới nhất', message: 'Em xin phép gửi bản CV cập nhật gần đây nhất của em để quý công ty xem xét ạ.' },
  { id: 'q4', text: '💻 Hỏi về công nghệ dự án', message: 'Dạ cho em hỏi stack công nghệ chính và mô hình phát triển phần mềm trong dự án này là gì ạ?' }
];

/**
 * Định dạng ngày giờ hiển thị
 */
const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Chuẩn hóa đối tượng Conversation từ Backend sang cấu trúc UI
 */
const normalizeConversation = (conv) => ({
  id: conv.id,
  candidateId: conv.candidateId,
  companyId: conv.companyId,
  companyName: conv.companyName || 'Doanh nghiệp tuyển dụng',
  recruiterName: conv.recruiterName || 'Bộ phận Tuyển dụng',
  companyAvatar: conv.companyAvatar || '',
  companyInitials: conv.companyInitials || (conv.companyName ? conv.companyName.substring(0, 2).toUpperCase() : 'DN'),
  jobId: conv.jobId,
  jobTitle: conv.jobTitle || 'Vị trí tuyển dụng',
  location: conv.location || 'Toàn quốc',
  salary: conv.salary || 'Thương lượng',
  responseTime: 'Phản hồi trong 15 phút',
  isOnline: conv.isOnline ?? true,
  lastMessage: conv.lastMessage || 'Bắt đầu cuộc trò chuyện',
  lastMessageTime: conv.lastMessageAt || new Date().toISOString(),
  unreadCount: conv.unreadCount ?? 0
});

/**
 * Chuẩn hóa đối tượng ChatMessage từ Backend sang cấu trúc UI
 */
const normalizeMessage = (m) => ({
  id: m.id,
  conversationId: m.conversationId,
  senderType: (m.senderType || 'CANDIDATE').toLowerCase(),
  senderName: m.senderName || (m.senderType === 'CANDIDATE' ? 'Bạn' : 'Nhà tuyển dụng'),
  content: m.content || '',
  attachmentUrl: m.attachmentUrl || null,
  timestamp: m.createdAt || new Date().toISOString(),
  timeFormatted: m.timeFormatted || formatTime(m.createdAt),
  dateGroup: 'Hôm nay',
  status: m.isRead ? 'read' : 'delivered'
});

/**
 * Lấy danh sách cuộc hội thoại của ứng viên từ API
 */
export const getCandidateConversations = async ({ search = '', filter = 'all' } = {}) => {
  try {
    const res = await apiClient.get('/v1/chat/conversations', {
      params: { role: 'candidate' }
    });

    let list = (res.data || []).map(normalizeConversation);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.companyName.toLowerCase().includes(q) ||
          c.jobTitle.toLowerCase().includes(q) ||
          c.lastMessage.toLowerCase().includes(q)
      );
    }

    if (filter === 'unread') {
      list = list.filter((c) => (c.unreadCount || 0) > 0);
    }

    return list;
  } catch (error) {
    console.warn('Lỗi khi tải danh sách hội thoại ứng viên:', error);
    return [];
  }
};

/**
 * Lấy danh sách tin nhắn của một cuộc hội thoại từ API
 */
export const getCandidateMessages = async (conversationId) => {
  if (!conversationId) return [];
  try {
    const res = await apiClient.get(`/v1/chat/conversations/${conversationId}/messages`);
    return (res.data || []).map(normalizeMessage);
  } catch (error) {
    console.warn(`Lỗi khi lấy tin nhắn hội thoại ${conversationId}:`, error);
    return [];
  }
};

/**
 * Gửi tin nhắn từ Ứng viên lên API
 */
export const sendCandidateMessage = async ({ conversationId, content, attachmentUrl = null }) => {
  if (!conversationId || !content?.trim()) return null;
  try {
    const res = await apiClient.post(`/v1/chat/conversations/${conversationId}/messages`, {
      content: content.trim(),
      attachmentUrl
    });
    return normalizeMessage(res.data);
  } catch (error) {
    console.error('Lỗi khi gửi tin nhắn ứng viên:', error);
    throw error;
  }
};

/**
 * Đánh dấu cuộc hội thoại đã đọc từ phía ứng viên
 */
export const markCandidateConversationRead = async (conversationId) => {
  if (!conversationId) return;
  try {
    await apiClient.put(`/v1/chat/conversations/${conversationId}/read`);
  } catch (error) {
    console.warn('Lỗi khi đánh dấu đã đọc:', error);
  }
};

/**
 * Khởi tạo hoặc tìm cuộc hội thoại với NTD
 */
export const getOrCreateCandidateConversation = async ({
  companyId,
  jobId,
  companyName = 'Doanh nghiệp tuyển dụng',
  jobTitle = 'Vị trí tuyển dụng'
}) => {
  try {
    // Nếu chưa có companyId, thử dùng company 2 (TechAsia) mặc định
    const targetCompanyId = companyId || 2;
    const res = await apiClient.post('/v1/chat/conversations', {
      companyId: targetCompanyId,
      jobId: jobId || null
    });
    return normalizeConversation(res.data);
  } catch (error) {
    console.error('Lỗi khi tìm/khởi tạo hội thoại:', error);
    // Fallback trả về object tạm thời nếu API lỗi
    return {
      id: Date.now(),
      companyName,
      jobTitle,
      companyInitials: companyName.substring(0, 2).toUpperCase(),
      lastMessage: 'Bắt đầu cuộc trò chuyện',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      isOnline: true
    };
  }
};

/**
 * Lấy tổng số tin nhắn chưa đọc của ứng viên từ API
 */
export const getCandidateTotalUnread = async () => {
  try {
    const res = await apiClient.get('/v1/chat/unread-count');
    return res.data?.totalUnread ?? 0;
  } catch (error) {
    console.warn('Lỗi khi lấy tổng tin chưa đọc:', error);
    return 0;
  }
};
