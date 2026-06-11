const jwt = require('jsonwebtoken');
const Auth = require('../modules/auth/auth.model');
const chatSocket = require('./chat.socket');
const notificationSocket = require('./notification.socket');

// Map of userId -> socketId for online tracking
const onlineUsers = new Map();

const initializeSockets = (io) => {
  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await Auth.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);

    console.log(`🔌 Socket connected: ${userId}`);

    // Broadcast online status
    socket.broadcast.emit('user_online', { userId });

    // Register feature handlers
    chatSocket(io, socket, onlineUsers);
    notificationSocket(io, socket, onlineUsers);

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      socket.broadcast.emit('user_offline', { userId });
      console.log(`❌ Socket disconnected: ${userId}`);
    });
  });

  return io;
};

module.exports = { initializeSockets, onlineUsers };
