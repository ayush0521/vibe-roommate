const User = require('../modules/users/user.model');

const notificationSocket = (io, socket, onlineUsers) => {
  const user = socket.user;

  // Join personal notification room
  socket.on('join_notifications', async () => {
    socket.join(`user_${user._id}`);
  });

  // Send notification to a specific user (utility function)
  socket.sendNotificationToUser = async (targetUserId, notification) => {
    const targetSocketId = onlineUsers.get(targetUserId.toString());
    if (targetSocketId) {
      io.to(`user_${targetUserId}`).emit('new_notification', notification);
    }
  };

  // Get online status of specific users
  socket.on('check_online', ({ userIds }) => {
    const statuses = {};
    userIds.forEach((id) => {
      statuses[id] = onlineUsers.has(id.toString());
    });
    socket.emit('online_statuses', statuses);
  });
};

/**
 * Helper: push real-time notification to a user (call from controllers)
 */
const pushNotification = (io, targetUserId, notification) => {
  io.to(`user_${targetUserId}`).emit('new_notification', notification);
};

module.exports = notificationSocket;
module.exports.pushNotification = pushNotification;
