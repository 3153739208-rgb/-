const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'campus_trade_jwt_secret_2024';
const onlineUsers = new Map();

function initChat(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('未登录'));
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('token 无效'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    onlineUsers.set(userId, socket.id);
    socket.join(`user_${userId}`);
    io.emit('user_online', { userId, online: true });

    socket.on('join_chat', ({ targetUserId }) => {
      const room = [userId, targetUserId].sort().join('_');
      socket.join(room);
    });

    socket.on('typing', ({ receiverId }) => {
      io.to(`user_${receiverId}`).emit('user_typing', { userId });
    });

    socket.on('stop_typing', ({ receiverId }) => {
      io.to(`user_${receiverId}`).emit('user_stop_typing', { userId });
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('user_online', { userId, online: false });
    });
  });

  return { onlineUsers };
}

module.exports = { initChat, onlineUsers };
