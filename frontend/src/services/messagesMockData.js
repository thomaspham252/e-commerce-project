/**
 * Dữ liệu mẫu (Mock Data) độc lập cho phân hệ Tin nhắn Tuyển dụng
 * Tuân thủ Hiến pháp dự án (Nguyên tắc VII) và Data Model trong specs/005-employer-candidate-messages
 */

export const INITIAL_CONVERSATIONS = [
  {
    id: 'conv-001',
    candidateId: 1,
    candidateName: 'Nguyễn Văn A',
    candidateAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    avatarFallback: 'NA',
    jobTitle: 'Frontend Developer',
    applicationStatus: 'Đang xem xét',
    isOnline: true,
    lastMessage: 'Dạ em vừa gửi thêm bản PDF cập nhật dự án gần đây của em ạ.',
    lastMessageTime: '2026-10-16T08:45:00.000Z',
    unreadCount: 2,
    createdAt: '2026-10-14T09:00:00.000Z'
  },
  {
    id: 'conv-002',
    candidateId: 2,
    candidateName: 'Trần Thị B',
    candidateAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    avatarFallback: 'TB',
    jobTitle: 'Frontend Developer',
    applicationStatus: 'Phỏng vấn',
    isOnline: false,
    lastMessage: 'Công ty: Chúng tôi đã gửi email xác nhận lịch phỏng vấn qua Meet nhé.',
    lastMessageTime: '2026-10-15T16:20:00.000Z',
    unreadCount: 0,
    createdAt: '2026-10-13T10:30:00.000Z'
  },
  {
    id: 'conv-003',
    candidateId: 3,
    candidateName: 'Lê Văn C',
    candidateAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    avatarFallback: 'LC',
    jobTitle: 'Backend Node.js',
    applicationStatus: 'Đã ứng tuyển',
    isOnline: true,
    lastMessage: 'Dạ cho em hỏi về khung công nghệ Microservices của dự án bên mình với ạ.',
    lastMessageTime: '2026-10-16T07:15:00.000Z',
    unreadCount: 1,
    createdAt: '2026-10-15T14:00:00.000Z'
  },
  {
    id: 'conv-004',
    candidateId: 4,
    candidateName: 'Phạm Minh D',
    candidateAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    avatarFallback: 'MD',
    jobTitle: 'UI/UX Designer',
    applicationStatus: 'Trúng tuyển',
    isOnline: false,
    lastMessage: 'Dạ em đã nhận được thư mời nhận việc (Offer Letter) rồi ạ, cảm ơn công ty!',
    lastMessageTime: '2026-10-14T11:00:00.000Z',
    unreadCount: 0,
    createdAt: '2026-10-10T08:00:00.000Z'
  },
  {
    id: 'conv-005',
    candidateId: 5,
    candidateName: 'Hoàng Thu Trang',
    candidateAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    avatarFallback: 'HT',
    jobTitle: 'Product Owner',
    applicationStatus: 'Đang xem xét',
    isOnline: true,
    lastMessage: 'Chào anh/chị, em rất quan tâm đến định hướng phát triển sản phẩm e-commerce bên mình.',
    lastMessageTime: '2026-10-16T08:10:00.000Z',
    unreadCount: 1,
    createdAt: '2026-10-16T08:00:00.000Z'
  }
];

export const INITIAL_MESSAGES_MAP = {
  'conv-001': [
    {
      id: 'msg-101',
      conversationId: 'conv-001',
      senderType: 'employer',
      senderName: 'Nhà Tuyển Dụng JobViet',
      content: 'Chào Văn A! Công ty đã nhận được hồ sơ của bạn cho vị trí Frontend Developer.',
      timestamp: '2026-10-14T09:05:00.000Z',
      dateGroup: '14/10/2026',
      timeFormatted: '09:05',
      status: 'read'
    },
    {
      id: 'msg-102',
      conversationId: 'conv-001',
      senderType: 'candidate',
      senderName: 'Nguyễn Văn A',
      content: 'Dạ em chào quý công ty ạ! Em rất mong có cơ hội được đồng hành cùng team.',
      timestamp: '2026-10-14T09:12:00.000Z',
      dateGroup: '14/10/2026',
      timeFormatted: '09:12',
      status: 'read'
    },
    {
      id: 'msg-103',
      conversationId: 'conv-001',
      senderType: 'employer',
      senderName: 'Nhà Tuyển Dụng JobViet',
      content: 'Chào bạn, bạn có thể gửi thêm link Portfolio hoặc các dự án tiêu biểu bạn từng thực hiện với React/TypeScript để bộ phận kỹ thuật xem trước không?',
      timestamp: '2026-10-15T14:30:00.000Z',
      dateGroup: 'Hôm qua',
      timeFormatted: '14:30',
      status: 'read'
    },
    {
      id: 'msg-104',
      conversationId: 'conv-001',
      senderType: 'candidate',
      senderName: 'Nguyễn Văn A',
      content: 'Dạ được ạ, đây là link github repo dự án ecommerce em vừa làm: https://github.com/nguyenvana/react-store',
      timestamp: '2026-10-16T08:40:00.000Z',
      dateGroup: 'Hôm nay',
      timeFormatted: '08:40',
      status: 'read'
    },
    {
      id: 'msg-105',
      conversationId: 'conv-001',
      senderType: 'candidate',
      senderName: 'Nguyễn Văn A',
      content: 'Dạ em vừa gửi thêm bản PDF cập nhật dự án gần đây của em ạ.',
      timestamp: '2026-10-16T08:45:00.000Z',
      dateGroup: 'Hôm nay',
      timeFormatted: '08:45',
      status: 'read'
    }
  ],
  'conv-002': [
    {
      id: 'msg-201',
      conversationId: 'conv-002',
      senderType: 'candidate',
      senderName: 'Trần Thị B',
      content: 'Chào công ty, em đã nộp CV ứng tuyển vị trí Frontend Developer.',
      timestamp: '2026-10-13T10:30:00.000Z',
      dateGroup: '13/10/2026',
      timeFormatted: '10:30',
      status: 'read'
    },
    {
      id: 'msg-202',
      conversationId: 'conv-002',
      senderType: 'employer',
      senderName: 'Nhà Tuyển Dụng JobViet',
      content: 'Chào bạn, hồ sơ của bạn rất ấn tượng. Công ty muốn hẹn bạn một buổi phỏng vấn trực tuyến vào lúc 10:00 sáng mai.',
      timestamp: '2026-10-15T15:00:00.000Z',
      dateGroup: 'Hôm qua',
      timeFormatted: '15:00',
      status: 'read'
    },
    {
      id: 'msg-203',
      conversationId: 'conv-002',
      senderType: 'candidate',
      senderName: 'Trần Thị B',
      content: 'Dạ em đồng ý khung giờ này ạ. Em cảm ơn công ty!',
      timestamp: '2026-10-15T15:30:00.000Z',
      dateGroup: 'Hôm qua',
      timeFormatted: '15:30',
      status: 'read'
    },
    {
      id: 'msg-204',
      conversationId: 'conv-002',
      senderType: 'employer',
      senderName: 'Nhà Tuyển Dụng JobViet',
      content: 'Chúng tôi đã gửi email xác nhận lịch phỏng vấn qua Meet nhé.',
      timestamp: '2026-10-15T16:20:00.000Z',
      dateGroup: 'Hôm qua',
      timeFormatted: '16:20',
      status: 'read'
    }
  ],
  'conv-003': [
    {
      id: 'msg-301',
      conversationId: 'conv-003',
      senderType: 'candidate',
      senderName: 'Lê Văn C',
      content: 'Chào anh/chị, em vừa nộp hồ sơ vị trí Backend Node.js bên mình.',
      timestamp: '2026-10-15T14:00:00.000Z',
      dateGroup: 'Hôm qua',
      timeFormatted: '14:00',
      status: 'read'
    },
    {
      id: 'msg-302',
      conversationId: 'conv-003',
      senderType: 'candidate',
      senderName: 'Lê Văn C',
      content: 'Dạ cho em hỏi về khung công nghệ Microservices của dự án bên mình với ạ.',
      timestamp: '2026-10-16T07:15:00.000Z',
      dateGroup: 'Hôm nay',
      timeFormatted: '07:15',
      status: 'read'
    }
  ],
  'conv-004': [
    {
      id: 'msg-401',
      conversationId: 'conv-004',
      senderType: 'employer',
      senderName: 'Nhà Tuyển Dụng JobViet',
      content: 'Chào Minh D, chúc mừng bạn đã xuất sắc vượt qua các vòng phỏng vấn cho vị trí UI/UX Designer!',
      timestamp: '2026-10-14T10:00:00.000Z',
      dateGroup: '14/10/2026',
      timeFormatted: '10:00',
      status: 'read'
    },
    {
      id: 'msg-402',
      conversationId: 'conv-004',
      senderType: 'candidate',
      senderName: 'Phạm Minh D',
      content: 'Dạ em đã nhận được thư mời nhận việc (Offer Letter) rồi ạ, cảm ơn công ty!',
      timestamp: '2026-10-14T11:00:00.000Z',
      dateGroup: '14/10/2026',
      timeFormatted: '11:00',
      status: 'read'
    }
  ],
  'conv-005': [
    {
      id: 'msg-501',
      conversationId: 'conv-005',
      senderType: 'candidate',
      senderName: 'Hoàng Thu Trang',
      content: 'Chào anh/chị, em rất quan tâm đến định hướng phát triển sản phẩm e-commerce bên mình.',
      timestamp: '2026-10-16T08:10:00.000Z',
      dateGroup: 'Hôm nay',
      timeFormatted: '08:10',
      status: 'read'
    }
  ]
};

export const QUICK_REPLIES = [
  {
    id: 'qr-01',
    title: 'Hẹn phỏng vấn 📅',
    content: 'Chào bạn, hồ sơ của bạn rất ấn tượng. Công ty muốn hẹn bạn một buổi phỏng vấn trực tuyến vào lúc 09:30 sáng mai. Bạn có thể sắp xếp tham gia được không?'
  },
  {
    id: 'qr-02',
    title: 'Chào ứng viên 👋',
    content: 'Chào bạn, công ty đã tiếp nhận hồ sơ ứng tuyển của bạn và đang tiến hành đánh giá chi tiết. Chúng tôi sẽ phản hồi sớm nhất nhé!'
  },
  {
    id: 'qr-03',
    title: 'Xin CV / Portfolio 📁',
    content: 'Chào bạn, bạn vui lòng gửi thêm link Portfolio hoặc các dự án tiêu biểu bạn từng thực hiện qua đây để bộ phận kỹ thuật xem trước nhé.'
  },
  {
    id: 'qr-04',
    title: 'Xác nhận lịch hẹn ✅',
    content: 'Cảm ơn bạn đã phản hồi. Chúng tôi đã ghi nhận lịch hẹn và sẽ gửi link phòng họp trực tuyến qua đây trước 30 phút.'
  }
];
