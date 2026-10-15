/**
 * Dịch vụ xử lý nghiệp vụ Tin nhắn Tuyển dụng (Employer Messages Service)
 * Tuân thủ hợp đồng tại specs/005-employer-candidate-messages/contracts/employer-messages-contract.md
 * Có hỗ trợ đồng bộ đệm vào localStorage để giữ trạng thái tin nhắn khi tải lại trang
 */

import {
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES_MAP,
  QUICK_REPLIES
} from './messagesMockData';

const CONVERSATIONS_STORAGE_KEY = 'jobviet_employer_conversations';
const MESSAGES_STORAGE_KEY = 'jobviet_employer_messages';

// Khởi tạo hoặc lấy dữ liệu từ localStorage
const loadStoredData = () => {
  try {
    const storedConvs = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
    const storedMsgs = localStorage.getItem(MESSAGES_STORAGE_KEY);

    const conversations = storedConvs ? JSON.parse(storedConvs) : INITIAL_CONVERSATIONS;
    const messagesMap = storedMsgs ? JSON.parse(storedMsgs) : INITIAL_MESSAGES_MAP;

    return { conversations, messagesMap };
  } catch (error) {
    console.error('Lỗi khi đọc tin nhắn từ localStorage:', error);
    return {
      conversations: INITIAL_CONVERSATIONS,
      messagesMap: INITIAL_MESSAGES_MAP
    };
  }
};

const saveStoredData = (conversations, messagesMap) => {
  try {
    localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messagesMap));
  } catch (error) {
    console.error('Lỗi khi ghi tin nhắn vào localStorage:', error);
  }
};

/**
 * Lấy danh sách hội thoại, hỗ trợ tìm kiếm và lọc chưa đọc
 * @param {Object} options - { filter: 'all' | 'unread', search: string }
 * @returns {Promise<Array>} Danh sách hội thoại sắp xếp theo thời gian tin mới nhất
 */
export const getConversations = async ({ filter = 'all', search = '' } = {}) => {
  const { conversations } = loadStoredData();
  
  let result = [...conversations];

  // Lọc theo từ khóa tìm kiếm (tên ứng viên hoặc vị trí công việc)
  if (search && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    result = result.filter(
      (conv) =>
        conv.candidateName.toLowerCase().includes(q) ||
        conv.jobTitle.toLowerCase().includes(q)
    );
  }

  // Lọc theo tab "Chưa đọc"
  if (filter === 'unread') {
    result = result.filter((conv) => (conv.unreadCount || 0) > 0);
  }

  // Sắp xếp giảm dần theo thời gian tin nhắn mới nhất
  result.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

  return result;
};

/**
 * Lấy thông tin một cuộc hội thoại theo ID
 */
export const getConversationById = async (conversationId) => {
  const { conversations } = loadStoredData();
  return conversations.find((c) => c.id === conversationId) || null;
};

/**
 * Lấy lịch sử tin nhắn của một cuộc hội thoại
 */
export const getMessages = async (conversationId) => {
  const { messagesMap } = loadStoredData();
  return messagesMap[conversationId] || [];
};

/**
 * Gửi tin nhắn mới vào cuộc hội thoại
 */
export const sendMessage = async ({ conversationId, senderType = 'employer', content }) => {
  if (!content || content.trim() === '') {
    throw new Error('Nội dung tin nhắn không được để trống.');
  }

  const { conversations, messagesMap } = loadStoredData();
  const convIndex = conversations.findIndex((c) => c.id === conversationId);

  const now = new Date();
  const timeFormatted = now.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const newMessage = {
    id: `msg-${Date.now()}`,
    conversationId,
    senderType,
    senderName: senderType === 'employer' ? 'Nhà Tuyển Dụng JobViet' : 'Ứng viên',
    content: content.trim(),
    timestamp: now.toISOString(),
    dateGroup: 'Hôm nay',
    timeFormatted,
    status: 'sent'
  };

  const updatedMessages = [...(messagesMap[conversationId] || []), newMessage];
  messagesMap[conversationId] = updatedMessages;

  // Cập nhật thông tin hội thoại tương ứng và đẩy lên đầu
  if (convIndex !== -1) {
    conversations[convIndex] = {
      ...conversations[convIndex],
      lastMessage: (senderType === 'employer' ? 'Bạn: ' : '') + content.trim(),
      lastMessageTime: now.toISOString()
    };
  }

  saveStoredData(conversations, messagesMap);

  return {
    success: true,
    message: newMessage,
    conversation: conversations[convIndex]
  };
};

/**
 * Đánh dấu một cuộc hội thoại là đã đọc
 */
export const markAsRead = async (conversationId) => {
  const { conversations, messagesMap } = loadStoredData();
  const convIndex = conversations.findIndex((c) => c.id === conversationId);

  if (convIndex !== -1 && conversations[convIndex].unreadCount > 0) {
    conversations[convIndex] = {
      ...conversations[convIndex],
      unreadCount: 0
    };

    // Đánh dấu đã xem cho các tin nhắn trong hội thoại
    if (messagesMap[conversationId]) {
      messagesMap[conversationId] = messagesMap[conversationId].map((msg) =>
        msg.senderType === 'candidate' ? { ...msg, status: 'read' } : msg
      );
    }

    saveStoredData(conversations, messagesMap);
  }

  return { success: true, conversationId };
};

/**
 * Lấy danh sách tin nhắn mẫu gợi ý (Quick Replies)
 */
export const getQuickReplies = async () => {
  return QUICK_REPLIES;
};

/**
 * Tìm hoặc tạo mới cuộc hội thoại cho ứng viên (khi bấm từ Dashboard)
 */
export const getOrCreateConversationForCandidate = async (candidateData) => {
  const { candidateId, candidateName, jobTitle, applicationStatus } = candidateData;
  const { conversations, messagesMap } = loadStoredData();

  // Tìm hội thoại hiện có theo candidateId hoặc tên
  let existing = conversations.find(
    (c) => String(c.candidateId) === String(candidateId) || c.candidateName === candidateName
  );

  if (existing) {
    return existing;
  }

  // Tạo hội thoại mới nếu chưa từng chat
  const newConvId = `conv-${Date.now()}`;
  const now = new Date().toISOString();

  const initials = candidateName
    ? candidateName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'UV';

  const newConv = {
    id: newConvId,
    candidateId: candidateId || Date.now(),
    candidateName: candidateName || 'Ứng viên mới',
    candidateAvatar: '',
    avatarFallback: initials,
    jobTitle: jobTitle || 'Vị trí tuyển dụng',
    applicationStatus: applicationStatus || 'Đang xem xét',
    isOnline: true,
    lastMessage: 'Cuộc trò chuyện mới được tạo.',
    lastMessageTime: now,
    unreadCount: 0,
    createdAt: now
  };

  const updatedConvs = [newConv, ...conversations];
  messagesMap[newConvId] = [];

  saveStoredData(updatedConvs, messagesMap);
  return newConv;
};

/**
 * Tính tổng số tin nhắn chưa đọc của toàn bộ hội thoại
 */
export const getTotalUnreadCount = async () => {
  const { conversations } = loadStoredData();
  return conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);
};
