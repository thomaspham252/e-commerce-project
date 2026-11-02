const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Tạo HTTP Server phục vụ endpoint health check đơn giản
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'UP',
      service: 'JobViet Socket.io Realtime Service',
      version: '1.0.0',
      connectedClients: io.engine.clientsCount,
      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

// Khởi tạo Socket.IO với cấu hình CORS
const io = new Server(server, {
  cors: {
    origin: [CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Quản lý kết nối Socket.IO
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client kết nối mới: ${socket.id}`);

  // 1. User đăng ký nhận thông báo cá nhân (phòng riêng: user_<userId>)
  socket.on('register_user', (userId) => {
    if (!userId) return;
    const userRoom = `user_${userId}`;
    socket.join(userRoom);
    console.log(`[Socket.io] Socket ${socket.id} đã vào phòng cá nhân: ${userRoom}`);
  });

  // 2. Vào phòng chat hội thoại cụ thể: conv_<conversationId>
  socket.on('join_conversation', ({ conversationId, userId, role }) => {
    if (!conversationId) return;
    const roomName = `conv_${conversationId}`;
    socket.join(roomName);
    console.log(`[Socket.io] User ${userId} (${role}) đã tham gia phòng ${roomName}`);

    // Báo cho các client khác trong phòng
    socket.to(roomName).emit('user_joined', { userId, role, conversationId });
  });

  // 3. Rời phòng hội thoại
  socket.on('leave_conversation', ({ conversationId, userId }) => {
    if (!conversationId) return;
    const roomName = `conv_${conversationId}`;
    socket.leave(roomName);
    console.log(`[Socket.io] User ${userId} đã rời phòng ${roomName}`);
  });

  // 4. Gửi tin nhắn realtime
  socket.on('send_message', (payload) => {
    const { conversationId, message, recipientUserId } = payload;
    if (!conversationId || !message) return;

    const roomName = `conv_${conversationId}`;
    console.log(`[Socket.io] Phát tin nhắn mới vào phòng ${roomName}: id=${message.id}, sender=${message.senderType}`);

    // Phát cho tất cả thành viên trong phòng chat (ngoại trừ người vừa gửi)
    socket.to(roomName).emit('receive_message', {
      conversationId,
      message
    });

    // Phát thông báo tin nhắn mới tới phòng cá nhân của người nhận (cập nhật badge chưa đọc)
    if (recipientUserId) {
      io.to(`user_${recipientUserId}`).emit('new_message_notification', {
        conversationId,
        message
      });
    }
  });

  // 5. Trạng thái đang nhập văn bản (Typing Indicator)
  socket.on('typing', ({ conversationId, userId, userName, isTyping }) => {
    if (!conversationId) return;
    const roomName = `conv_${conversationId}`;
    socket.to(roomName).emit('user_typing', {
      conversationId,
      userId,
      userName,
      isTyping
    });
  });

  // 6. Đã đọc tin nhắn
  socket.on('mark_read', ({ conversationId, readerId, readerRole }) => {
    if (!conversationId) return;
    const roomName = `conv_${conversationId}`;
    socket.to(roomName).emit('messages_marked_read', {
      conversationId,
      readerId,
      readerRole
    });
  });

  socket.on('disconnect', (reason) => {
    console.log(`[Socket.io] Client ngắt kết nối: ${socket.id} (Lý do: ${reason})`);
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` [Socket.io] Server đang lắng nghe tại http://localhost:${PORT}`);
  console.log(` [Socket.io] Hỗ trợ CORS: ${CLIENT_ORIGIN}`);
  console.log(`=======================================================`);
});

