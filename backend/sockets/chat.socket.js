const Message = require('../modules/messages/message.model');
const Conversation = require('../modules/messages/conversation.model');
const User = require('../modules/users/user.model');
const Notification = require('../modules/notifications/notification.model');

const chatSocket = (io, socket, onlineUsers) => {
  const user = socket.user;

  // Join a conversation room
  socket.on('join_conversation', async ({ conversationId }) => {
    socket.join(`conversation_${conversationId}`);
    socket.emit('joined_conversation', { conversationId });
  });

  // Leave a conversation room
  socket.on('leave_conversation', ({ conversationId }) => {
    socket.leave(`conversation_${conversationId}`);
  });

  // Send a message
  socket.on('send_message', async ({ conversationId, content, type = 'text' }) => {
    try {
      const senderProfile = await User.findOne({ authId: user._id });
      if (!senderProfile) return;

      const conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.participants.some(p => p.toString() === senderProfile._id.toString())) return;

      // Save to DB
      const message = await Message.create({
        conversationId,
        sender: senderProfile._id,
        content,
        type,
      });

      const populated = await message.populate('sender', 'fullName profilePhoto');

      // Update conversation last message
      conversation.lastMessage = { content, sender: senderProfile._id, type, sentAt: new Date() };
      // Increment unread count for other participants
      conversation.participants.forEach((participantId) => {
        if (participantId.toString() !== senderProfile._id.toString()) {
          const current = conversation.unreadCounts.get(participantId.toString()) || 0;
          conversation.unreadCounts.set(participantId.toString(), current + 1);
        }
      });
      await conversation.save();

      // Broadcast to all in room
      io.to(`conversation_${conversationId}`).emit('message_received', { conversationId, message: populated });

      // Notify offline users
      for (const participantId of conversation.participants) {
        const pId = participantId.toString();
        if (pId !== senderProfile._id.toString()) {
          const isOnline = onlineUsers.has(pId);
          if (!isOnline) {
            await Notification.create({
              userId: participantId,
              type: 'new_message',
              title: `New message from ${senderProfile.fullName || 'Someone'}`,
              content: content.length > 60 ? content.substring(0, 60) + '...' : content,
              metadata: { conversationId, fromUserId: senderProfile._id },
              link: `/chat/${conversationId}`,
            });
          }
        }
      }
    } catch (err) {
      console.error('send_message error:', err.message);
      socket.emit('message_error', { error: err.message });
    }
  });

  // Typing indicators
  socket.on('typing', ({ conversationId }) => {
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      conversationId,
      userId: user._id,
    });
  });

  socket.on('stop_typing', ({ conversationId }) => {
    socket.to(`conversation_${conversationId}`).emit('user_stop_typing', {
      conversationId,
      userId: user._id,
    });
  });

  // Mark messages as read
  socket.on('mark_read', async ({ conversationId }) => {
    try {
      const senderProfile = await User.findOne({ authId: user._id });
      const conversation = await Conversation.findById(conversationId);
      if (conversation) {
        conversation.unreadCounts.set(senderProfile._id.toString(), 0);
        await conversation.save();
      }
      socket.to(`conversation_${conversationId}`).emit('messages_read', {
        conversationId,
        userId: senderProfile._id,
      });
    } catch (err) {
      console.error('mark_read error:', err.message);
    }
  });
};

module.exports = chatSocket;
