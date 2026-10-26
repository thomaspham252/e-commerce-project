/**
 * Dịch vụ Quản lý Tin nhắn giữa Ứng viên và Nhà Tuyển Dụng (Candidate Employer Messages Service)
 * Hỗ trợ lưu trữ persistent qua localStorage, tìm kiếm, lọc chưa đọc,
 * tin nhắn mẫu hỏi nhanh và tự động phản hồi mô phỏng từ NTD.
 */

const STORAGE_KEY_CONVS = 'jobviet_candidate_conversations';
const STORAGE_KEY_MSGS = 'jobviet_candidate_messages_map';

const INITIAL_EMPLOYER_CONVERSATIONS = [
  {
    id: 'c-conv-katalon',
    companyName: 'Katalon',
    recruiterName: 'Thảo My (Tech Recruiter)',
    companyAvatar: '',
    companyInitials: 'KT',
    jobTitle: 'Senior Database Administrator (PostgreSQL/AWS/Aurora)',
    location: 'TP. Hồ Chí Minh',
    responseTime: 'Phản hồi trong 15 phút',
    isOnline: true,
    lastMessage: 'Chào bạn Linh, hồ sơ của bạn rất phù hợp với dự án Aurora của Katalon!',
    lastMessageTime: '2026-10-27T08:30:00.000Z',
    unreadCount: 1,
    salary: 'Thoả thuận theo năng lực'
  },
  {
    id: 'c-conv-toshiba',
    companyName: 'Toshiba Software Development',
    recruiterName: 'Hoàng Nam (HR Specialist)',
    companyAvatar: '',
    companyInitials: 'TS',
    jobTitle: 'Fullstack Engineer (NodeJS, ReactJS, Javascript)',
    location: 'Hà Nội',
    responseTime: 'Phản hồi trong 1 giờ',
    isOnline: false,
    lastMessage: 'Công ty đã nhận được CV đính kèm của bạn và đang chuyển sang Team Lead xem xét nhé.',
    lastMessageTime: '2026-10-26T16:20:00.000Z',
    unreadCount: 0,
    salary: 'Cạnh tranh'
  },
  {
    id: 'c-conv-mblife',
    companyName: 'MB Life',
    recruiterName: 'Ngọc Lan (Talent Acquisition)',
    companyAvatar: '',
    companyInitials: 'MB',
    jobTitle: 'Data Governance Expert',
    location: 'Hà Nội',
    responseTime: 'Phản hồi trong 30 phút',
    isOnline: true,
    lastMessage: 'Bạn có thể sắp xếp tham gia buổi phỏng vấn trực tuyến vào sáng thứ Tư này không?',
    lastMessageTime: '2026-10-26T10:15:00.000Z',
    unreadCount: 1,
    salary: '2,000 - 4,000 USD'
  },
  {
    id: 'c-conv-fpt',
    companyName: 'FPT Software',
    recruiterName: 'Bảo Trâm (Recruitment Officer)',
    companyAvatar: '',
    companyInitials: 'FPT',
    jobTitle: 'Senior Java Fullstack Developer',
    location: 'Toàn quốc',
    responseTime: 'Phản hồi trong 2 giờ',
    isOnline: false,
    lastMessage: 'Chào Linh, dự án bên mình sử dụng Spring Boot và Microservices với khách hàng Nhật Bản.',
    lastMessageTime: '2026-10-25T14:40:00.000Z',
    unreadCount: 0,
    salary: 'Lên đến 35.000.000 VND'
  }
];

const INITIAL_CANDIDATE_MESSAGES = {
  'c-conv-katalon': [
    {
      id: 'cmsg-101',
      conversationId: 'c-conv-katalon',
      senderType: 'employer',
      senderName: 'Thảo My (Katalon)',
      content: 'Chào bạn Linh, cảm ơn bạn đã quan tâm đến vị trí Senior Database Administrator tại Katalon!',
      timestamp: '2026-10-27T08:15:00.000Z',
      timeFormatted: '08:15',
      dateGroup: 'Hôm nay',
      status: 'read'
    },
    {
      id: 'cmsg-102',
      conversationId: 'c-conv-katalon',
      senderType: 'candidate',
      senderName: 'Bạn',
      content: 'Dạ chào chị Thảo My, em đã theo dõi các giải pháp kiểm thử tự động của Katalon từ lâu và rất hào hứng với vị trí này ạ.',
      timestamp: '2026-10-27T08:22:00.000Z',
      timeFormatted: '08:22',
      dateGroup: 'Hôm nay',
      status: 'read'
    },
    {
      id: 'cmsg-103',
      conversationId: 'c-conv-katalon',
      senderType: 'employer',
      senderName: 'Thảo My (Katalon)',
      content: 'Chào bạn Linh, hồ sơ của bạn rất phù hợp với dự án Aurora của Katalon! Đội ngũ kỹ thuật muốn trao đổi ngắn với bạn qua Google Meet vào 14:00 chiều nay được không?',
      timestamp: '2026-10-27T08:30:00.000Z',
      timeFormatted: '08:30',
      dateGroup: 'Hôm nay',
      status: 'delivered'
    }
  ],
  'c-conv-toshiba': [
    {
      id: 'cmsg-201',
      conversationId: 'c-conv-toshiba',
      senderType: 'candidate',
      senderName: 'Bạn',
      content: 'Chào anh/chị, em vừa gửi hồ sơ ứng tuyển vị trí Fullstack Engineer (NodeJS/ReactJS). Em xin phép gửi thêm link portfolio ạ.',
      timestamp: '2026-10-26T15:50:00.000Z',
      timeFormatted: '15:50',
      dateGroup: 'Hôm qua',
      status: 'read'
    },
    {
      id: 'cmsg-202',
      conversationId: 'c-conv-toshiba',
      senderType: 'employer',
      senderName: 'Hoàng Nam (Toshiba)',
      content: 'Công ty đã nhận được CV đính kèm của bạn và đang chuyển sang Team Lead xem xét nhé. Chúng tôi sẽ phản hồi kết quả trong 24 giờ.',
      timestamp: '2026-10-26T16:20:00.000Z',
      timeFormatted: '16:20',
      dateGroup: 'Hôm qua',
      status: 'read'
    }
  ],
  'c-conv-mblife': [
    {
      id: 'cmsg-301',
      conversationId: 'c-conv-mblife',
      senderType: 'employer',
      senderName: 'Ngọc Lan (MB Life)',
      content: 'Chào bạn Linh, phòng Nhân sự MB Life rất ấn tượng với chuyên môn quản trị dữ liệu của bạn.',
      timestamp: '2026-10-26T09:40:00.000Z',
      timeFormatted: '09:40',
      dateGroup: 'Hôm qua',
      status: 'read'
    },
    {
      id: 'cmsg-302',
      conversationId: 'c-conv-mblife',
      senderType: 'employer',
      senderName: 'Ngọc Lan (MB Life)',
      content: 'Bạn có thể sắp xếp tham gia buổi phỏng vấn trực tuyến vào sáng thứ Tư này không?',
      timestamp: '2026-10-26T10:15:00.000Z',
      timeFormatted: '10:15',
      dateGroup: 'Hôm qua',
      status: 'delivered'
    }
  ],
  'c-conv-fpt': [
    {
      id: 'cmsg-401',
      conversationId: 'c-conv-fpt',
      senderType: 'candidate',
      senderName: 'Bạn',
      content: 'Chào chị Bảo Trâm, cho em hỏi thêm về công nghệ Microservices và mô hình làm việc Hybrid của FPT Software với ạ.',
      timestamp: '2026-10-25T14:10:00.000Z',
      timeFormatted: '14:10',
      dateGroup: '25/10/2026',
      status: 'read'
    },
    {
      id: 'cmsg-402',
      conversationId: 'c-conv-fpt',
      senderType: 'employer',
      senderName: 'Bảo Trâm (FPT Software)',
      content: 'Chào Linh, dự án bên mình sử dụng Spring Boot và Microservices với khách hàng Nhật Bản. Bên mình hỗ trợ làm việc linh hoạt 2 ngày WFH/tuần bạn nhé.',
      timestamp: '2026-10-25T14:40:00.000Z',
      timeFormatted: '14:40',
      dateGroup: '25/10/2026',
      status: 'read'
    }
  ]
};

// Đọc dữ liệu từ localStorage
const loadData = () => {
  try {
    const rawConvs = localStorage.getItem(STORAGE_KEY_CONVS);
    const rawMsgs = localStorage.getItem(STORAGE_KEY_MSGS);

    const conversations = rawConvs ? JSON.parse(rawConvs) : INITIAL_EMPLOYER_CONVERSATIONS;
    const messagesMap = rawMsgs ? JSON.parse(rawMsgs) : INITIAL_CANDIDATE_MESSAGES;

    return { conversations, messagesMap };
  } catch (err) {
    console.error('Lỗi khi đọc tin nhắn ứng viên từ localStorage:', err);
    return {
      conversations: INITIAL_EMPLOYER_CONVERSATIONS,
      messagesMap: INITIAL_CANDIDATE_MESSAGES
    };
  }
};

// Ghi dữ liệu vào localStorage
const saveData = (conversations, messagesMap) => {
  try {
    localStorage.setItem(STORAGE_KEY_CONVS, JSON.stringify(conversations));
    localStorage.setItem(STORAGE_KEY_MSGS, JSON.stringify(messagesMap));
  } catch (err) {
    console.error('Lỗi khi lưu tin nhắn ứng viên:', err);
  }
};

/**
 * Lấy danh sách hội thoại của ứng viên với nhà tuyển dụng
 */
export const getCandidateConversations = async ({ search = '', filter = 'all' } = {}) => {
  const { conversations } = loadData();
  let result = [...conversations];

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    result = result.filter(
      (c) =>
        c.companyName.toLowerCase().includes(q) ||
        c.jobTitle.toLowerCase().includes(q) ||
        c.recruiterName.toLowerCase().includes(q)
    );
  }

  if (filter === 'unread') {
    result = result.filter((c) => (c.unreadCount || 0) > 0);
  }

  result.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
  return result;
};

/**
 * Lấy tin nhắn của một hội thoại cụ thể
 */
export const getCandidateMessages = async (conversationId) => {
  const { messagesMap } = loadData();
  return messagesMap[conversationId] || [];
};

/**
 * Gửi tin nhắn từ phía ứng viên
 */
export const sendCandidateMessage = async ({ conversationId, content, attachment = null }) => {
  if (!content || !content.trim()) return null;

  const { conversations, messagesMap } = loadData();
  const convIndex = conversations.findIndex((c) => c.id === conversationId);

  const now = new Date();
  const timeFormatted = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const newMsg = {
    id: `cmsg-${Date.now()}`,
    conversationId,
    senderType: 'candidate',
    senderName: 'Bạn',
    content: content.trim(),
    attachment,
    timestamp: now.toISOString(),
    timeFormatted,
    dateGroup: 'Hôm nay',
    status: 'sent'
  };

  const updatedMessages = [...(messagesMap[conversationId] || []), newMsg];
  messagesMap[conversationId] = updatedMessages;

  if (convIndex !== -1) {
    conversations[convIndex] = {
      ...conversations[convIndex],
      lastMessage: `Bạn: ${content.trim()}`,
      lastMessageTime: now.toISOString()
    };
  }

  saveData(conversations, messagesMap);

  return { success: true, message: newMsg };
};

/**
 * Đánh dấu đã đọc hội thoại
 */
export const markCandidateConversationRead = async (conversationId) => {
  const { conversations, messagesMap } = loadData();
  const convIndex = conversations.findIndex((c) => c.id === conversationId);

  if (convIndex !== -1 && conversations[convIndex].unreadCount > 0) {
    conversations[convIndex] = {
      ...conversations[convIndex],
      unreadCount: 0
    };

    if (messagesMap[conversationId]) {
      messagesMap[conversationId] = messagesMap[conversationId].map((m) =>
        m.senderType === 'employer' ? { ...m, status: 'read' } : m
      );
    }

    saveData(conversations, messagesMap);
  }

  return { success: true, conversationId };
};

/**
 * Tìm hoặc tạo mới hội thoại khi bấm "Chat với NTD" từ trang việc làm
 */
export const getOrCreateCandidateConversation = async ({ companyName, jobTitle }) => {
  const { conversations, messagesMap } = loadData();

  const existing = conversations.find(
    (c) => c.companyName.toLowerCase() === (companyName || '').toLowerCase()
  );

  if (existing) {
    return existing;
  }

  const newId = `c-conv-${Date.now()}`;
  const now = new Date().toISOString();
  const initials = (companyName || 'NTD')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);

  const newConv = {
    id: newId,
    companyName: companyName || 'Doanh nghiệp tuyển dụng',
    recruiterName: `HR Tuyển dụng ${companyName || ''}`,
    companyAvatar: '',
    companyInitials: initials,
    jobTitle: jobTitle || 'Vị trí tuyển dụng',
    location: 'Toàn quốc',
    responseTime: 'Phản hồi trong 30 phút',
    isOnline: true,
    lastMessage: 'Cuộc trò chuyện mới được khởi tạo.',
    lastMessageTime: now,
    unreadCount: 0
  };

  const updatedConvs = [newConv, ...conversations];
  messagesMap[newId] = [
    {
      id: `cmsg-intro-${Date.now()}`,
      conversationId: newId,
      senderType: 'employer',
      senderName: newConv.recruiterName,
      content: `Xin chào! Cảm ơn bạn đã quan tâm đến cơ hội nghề nghiệp tại ${companyName}. Bạn có thể gửi câu hỏi hoặc chia sẻ CV để đội ngũ tuyển dụng hỗ trợ nhé!`,
      timestamp: now,
      timeFormatted: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      dateGroup: 'Hôm nay',
      status: 'delivered'
    }
  ];

  saveData(updatedConvs, messagesMap);
  return newConv;
};

/**
 * Mô phỏng nhà tuyển dụng phản hồi tự động sau 1.5 giây để demo trải nghiệm sống động
 */
export const simulateEmployerReply = async (conversationId, candidateMessage) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { conversations, messagesMap } = loadData();
      const convIndex = conversations.findIndex((c) => c.id === conversationId);
      if (convIndex === -1) {
        resolve(null);
        return;
      }

      const conv = conversations[convIndex];
      const now = new Date();
      const timeFormatted = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

      let replyText = `Cảm ơn bạn đã liên hệ! Bộ phận nhân sự ${conv.companyName} đã tiếp nhận thông điệp và sẽ phản hồi chi tiết tới bạn qua email và tin nhắn sớm nhất.`;

      const lower = (candidateMessage || '').toLowerCase();
      if (lower.includes('phỏng vấn') || lower.includes('lịch')) {
        replyText = `Dạ công ty đã ghi nhận mong muốn xếp lịch phỏng vấn của bạn. Chúng tôi sẽ gửi email thư mời kèm link phòng họp trực tuyến trong ngày hôm nay nhé!`;
      } else if (lower.includes('lương') || lower.includes('đãi ngộ') || lower.includes('thưởng')) {
        replyText = `Về chế độ đãi ngộ: Vị trí ${conv.jobTitle} có gói lương thưởng cạnh tranh, xét tăng lương 2 lần/năm, thưởng tháng 13+ và bảo hiểm sức khỏe cao cấp.`;
      } else if (lower.includes('cv') || lower.includes('hồ sơ')) {
        replyText = `Cảm ơn bạn đã gửi CV cập nhật. Team tuyển dụng đã tải hồ sơ và đang đối chiếu với tiêu chí chuyên môn của dự án.`;
      }

      const replyMsg = {
        id: `cmsg-reply-${Date.now()}`,
        conversationId,
        senderType: 'employer',
        senderName: conv.recruiterName,
        content: replyText,
        timestamp: now.toISOString(),
        timeFormatted,
        dateGroup: 'Hôm nay',
        status: 'delivered'
      };

      messagesMap[conversationId] = [...(messagesMap[conversationId] || []), replyMsg];
      conversations[convIndex] = {
        ...conv,
        lastMessage: replyText,
        lastMessageTime: now.toISOString(),
        unreadCount: (conv.unreadCount || 0) + 1
      };

      saveData(conversations, messagesMap);
      resolve(replyMsg);
    }, 1500);
  });
};

/**
 * Tính tổng số tin nhắn chưa đọc
 */
export const getCandidateTotalUnread = () => {
  const { conversations } = loadData();
  return conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
};

export const CANDIDATE_QUICK_QUESTIONS = [
  { id: 'q1', text: '📅 Hỏi về lịch phỏng vấn', message: 'Chào anh/chị, em muốn hỏi về quy trình và thời gian dự kiến tổ chức phỏng vấn cho vị trí này ạ?' },
  { id: 'q2', text: '💼 Hỏi về mức lương & đãi ngộ', message: 'Dạ cho em hỏi thêm về dải lương và chế độ đãi ngộ, bảo hiểm cho vị trí này bên mình với ạ?' },
  { id: 'q3', text: '📄 Gửi CV mới nhất', message: 'Em xin phép gửi bản CV cập nhật gần đây nhất của em để quý công ty xem xét ạ.' },
  { id: 'q4', text: '💻 Hỏi về công nghệ dự án', message: 'Dạ cho em hỏi stack công nghệ chính và mô hình phát triển phần mềm trong dự án này là gì ạ?' }
];
