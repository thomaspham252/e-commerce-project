import { apiClient } from './apiClient';
import { QUICK_REPLIES } from './messagesMockData';

/**
 * Dịch vụ xử lý Tin nhắn Tuyển dụng phía Nhà tuyển dụng (Employer Messages Service)
 * Tích hợp REST API backend Spring Boot (/api/v1/chat/*)
 */

const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
};

/**
 * Chuẩn hóa conversation từ Backend về cấu trúc UI Nhà tuyển dụng
 */
const normalizeEmployerConv = (conv) => {
  const name = conv.candidateName || conv.candidateEmail || 'Ứng viên';
  const words = name.trim().split(/\s+/);
  const initials = words.length >= 2 
    ? (words[0][0] + words[words.length - 1][0]).toUpperCase() 
    : name.slice(0, 2).toUpperCase();

  return {
    id: conv.id,
    candidateId: conv.candidateId,
    candidateName: name,
    candidateEmail: conv.candidateEmail,
    candidateAvatar: '',
    avatarFallback: initials,
    companyId: conv.companyId,
    companyName: conv.companyName,
    jobId: conv.jobId,
    jobTitle: conv.jobTitle || 'Vị trí tuyển dụng',
    salary: conv.salary,
    location: conv.location,
    applicationStatus: 'Đang xem xét',
    isOnline: conv.isOnline ?? true,
    lastMessage: conv.lastMessage || 'Bắt đầu cuộc trò chuyện',
    lastMessageTime: conv.lastMessageAt || new Date().toISOString(),
    unreadCount: conv.unreadCount ?? 0
  };
};

/**
 * Chuẩn hóa message từ Backend về cấu trúc UI
 */
const normalizeEmployerMsg = (m) => ({
  id: m.id,
  conversationId: m.conversationId,
  senderType: (m.senderType || 'EMPLOYER').toLowerCase(),
  senderName: m.senderType === 'EMPLOYER' ? 'Bạn' : (m.senderName || 'Ứng viên'),
  content: m.content || '',
  attachmentUrl: m.attachmentUrl || null,
  timestamp: m.createdAt || new Date().toISOString(),
  timeFormatted: m.timeFormatted || formatTime(m.createdAt),
  dateGroup: 'Hôm nay',
  status: m.isRead ? 'read' : 'sent'
});

/**
 * Lấy danh sách hội thoại của Nhà tuyển dụng
 */
export const getConversations = async ({ filter = 'all', search = '' } = {}) => {
  try {
    const res = await apiClient.get('/v1/chat/conversations', {
      params: { role: 'employer' }
    });

    let list = (res.data || []).map(normalizeEmployerConv);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.candidateName.toLowerCase().includes(q) ||
          c.jobTitle.toLowerCase().includes(q) ||
          c.lastMessage.toLowerCase().includes(q)
      );
    }

    if (filter === 'unread') {
      list = list.filter((c) => (c.unreadCount || 0) > 0);
    }

    return list;
  } catch (error) {
    console.warn('Lỗi khi tải danh sách hội thoại NTD:', error);
    return [];
  }
};

/**
 * Lấy thông tin một cuộc hội thoại theo ID
 */
export const getConversationById = async (conversationId) => {
  try {
    const convs = await getConversations();
    return convs.find((c) => String(c.id) === String(conversationId)) || null;
  } catch (error) {
    console.warn('Lỗi khi lấy chi tiết hội thoại:', error);
    return null;
  }
};

/**
 * Lấy danh sách tin nhắn của cuộc hội thoại
 */
export const getMessages = async (conversationId) => {
  if (!conversationId) return [];
  try {
    const res = await apiClient.get(`/v1/chat/conversations/${conversationId}/messages`);
    return (res.data || []).map(normalizeEmployerMsg);
  } catch (error) {
    console.warn(`Lỗi khi lấy tin nhắn hội thoại ${conversationId}:`, error);
    return [];
  }
};

/**
 * Gửi tin nhắn từ phía Nhà tuyển dụng
 */
export const sendMessage = async ({ conversationId, content, attachmentUrl = null }) => {
  if (!conversationId || !content?.trim()) {
    throw new Error('Nội dung tin nhắn không được để trống.');
  }

  try {
    const res = await apiClient.post(`/v1/chat/conversations/${conversationId}/messages`, {
      content: content.trim(),
      attachmentUrl
    });

    const normalizedMsg = normalizeEmployerMsg(res.data);
    return {
      success: true,
      message: normalizedMsg
    };
  } catch (error) {
    console.error('Lỗi khi gửi tin nhắn NTD:', error);
    throw error;
  }
};

/**
 * Đánh dấu cuộc hội thoại đã đọc
 */
export const markAsRead = async (conversationId) => {
  if (!conversationId) return { success: false };
  try {
    await apiClient.put(`/v1/chat/conversations/${conversationId}/read`);
    return { success: true, conversationId };
  } catch (error) {
    console.warn('Lỗi khi đánh dấu đã đọc:', error);
    return { success: false };
  }
};

/**
 * Lấy tổng số tin nhắn chưa đọc của NTD
 */
export const getTotalUnreadCount = async () => {
  try {
    const res = await apiClient.get('/v1/chat/unread-count');
    return res.data?.totalUnread ?? 0;
  } catch (error) {
    console.warn('Lỗi khi lấy tổng tin chưa đọc của NTD:', error);
    return 0;
  }
};

/**
 * Lấy danh sách tin nhắn mẫu gợi ý (Quick Replies)
 */
export const getQuickReplies = async () => {
  return QUICK_REPLIES;
};

/**
 * Mở hoặc tìm cuộc hội thoại cho ứng viên
 */
export const getOrCreateConversationForCandidate = async (candidateData) => {
  const { candidateId, candidateName, jobTitle, jobId, companyId } = candidateData;
  try {
    const res = await apiClient.post('/v1/chat/conversations', {
      companyId: companyId || 2,
      jobId: jobId || null
    });
    return normalizeEmployerConv(res.data);
  } catch (error) {
    console.warn('Lỗi khi mở cuộc hội thoại với ứng viên:', error);
    return {
      id: Date.now(),
      candidateId: candidateId || 1,
      candidateName: candidateName || 'Ứng viên',
      jobTitle: jobTitle || 'Vị trí tuyển dụng',
      avatarFallback: 'UV',
      isOnline: true,
      lastMessage: 'Cuộc trò chuyện mới',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0
    };
  }
};
