import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

/**
 * Khởi tạo hoặc lấy kết nối Socket.IO
 */
export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('⚡ [Socket.io Client] Kết nối thành công tới Server:', socket.id);
    });

    socket.on('connect_error', (error) => {
      console.warn('⚠️ [Socket.io Client] Lỗi kết nối Socket Server:', error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 [Socket.io Client] Ngắt kết nối:', reason);
    });
  }
  return socket;
};

/**
 * Đăng ký nhận thông báo cá nhân cho user (user_<userId>)
 */
export const registerUserSocket = (userId) => {
  const s = getSocket();
  if (s && userId) {
    s.emit('register_user', userId);
  }
};

/**
 * Tham gia phòng chat cụ thể: conv_<conversationId>
 */
export const joinConversationRoom = ({ conversationId, userId, role }) => {
  const s = getSocket();
  if (s && conversationId) {
    s.emit('join_conversation', { conversationId, userId, role });
  }
};

/**
 * Rời phòng chat cụ thể
 */
export const leaveConversationRoom = ({ conversationId, userId }) => {
  const s = getSocket();
  if (s && conversationId) {
    s.emit('leave_conversation', { conversationId, userId });
  }
};

/**
 * Phát tin nhắn mới theo thời gian thực tới phòng hội thoại
 */
export const emitChatMessage = ({ conversationId, message, recipientUserId }) => {
  const s = getSocket();
  if (s && conversationId && message) {
    s.emit('send_message', { conversationId, message, recipientUserId });
  }
};

/**
 * Báo trạng thái đang soạn tin (Typing indicator)
 */
export const emitTypingStatus = ({ conversationId, userId, userName, isTyping }) => {
  const s = getSocket();
  if (s && conversationId) {
    s.emit('typing', { conversationId, userId, userName, isTyping });
  }
};

/**
 * Báo trạng thái đã đọc tin nhắn
 */
export const emitMarkRead = ({ conversationId, readerId, readerRole }) => {
  const s = getSocket();
  if (s && conversationId) {
    s.emit('mark_read', { conversationId, readerId, readerRole });
  }
};

/**
 * Lắng nghe tin nhắn mới từ đối phương
 */
export const onReceiveMessage = (callback) => {
  const s = getSocket();
  if (!s) return () => {};
  s.on('receive_message', callback);
  return () => s.off('receive_message', callback);
};

/**
 * Lắng nghe trạng thái soạn tin
 */
export const onUserTyping = (callback) => {
  const s = getSocket();
  if (!s) return () => {};
  s.on('user_typing', callback);
  return () => s.off('user_typing', callback);
};

/**
 * Lắng nghe thông báo tin nhắn mới ngoài phòng (để tăng badge chưa đọc)
 */
export const onNewMessageNotification = (callback) => {
  const s = getSocket();
  if (!s) return () => {};
  s.on('new_message_notification', callback);
  return () => s.off('new_message_notification', callback);
};

/**
 * Lắng nghe sự kiện đối phương đã đọc tin nhắn
 */
export const onMessagesMarkedRead = (callback) => {
  const s = getSocket();
  if (!s) return () => {};
  s.on('messages_marked_read', callback);
  return () => s.off('messages_marked_read', callback);
};

/**
 * Ngắt kết nối socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

