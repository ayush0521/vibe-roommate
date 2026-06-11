const Conversation = require('./conversation.model');
const Message = require('./message.model');
const User = require('../users/user.model');
const asyncHandler = require('../../shared/utils/asyncHandler');
const { uploadToCloudinary } = require('../../middleware/upload');

// @desc    Get all conversations
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  const user = await User.findOne({ authId: req.user._id });
  const conversations = await Conversation.find({ participants: user._id, isActive: true })
    .sort({ 'lastMessage.sentAt': -1 })
    .populate({
      path: 'participants',
      select: 'fullName profilePhoto verificationStatus college authId phoneNumber',
      populate: { path: 'authId', select: 'role' },
    });

  res.status(200).json({ success: true, data: conversations });
});

// @desc    Get messages in conversation (with pagination)
// @route   GET /api/messages/conversations/:id
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const messages = await Message.find({ conversationId: req.params.id, isDeleted: false })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('sender', 'fullName profilePhoto');

  res.status(200).json({ success: true, data: messages.reverse() });
});

// @desc    Start or get conversation with another user
// @route   POST /api/messages/conversations/start/:userId
// @access  Private
const startConversation = asyncHandler(async (req, res) => {
  const currentUser = await User.findOne({ authId: req.user._id });
  const otherUser = await User.findById(req.params.userId);
  if (!otherUser) return res.status(404).json({ success: false, message: 'User not found' });

  // Block check: can't start conversation if blocked by other user or you've blocked them
  const currentBlocked = currentUser.blockedUsers?.map(String).includes(otherUser._id.toString());
  const otherBlocked = otherUser.blockedUsers?.map(String).includes(currentUser._id.toString());
  if (currentBlocked || otherBlocked) {
    return res.status(403).json({ success: false, message: 'Cannot start conversation — user is blocked' });
  }

  // Check if conversation already exists
  let conversation = await Conversation.findOne({
    participants: { $all: [currentUser._id, otherUser._id] },
  }).populate({
    path: 'participants',
    select: 'fullName profilePhoto verificationStatus college authId phoneNumber',
    populate: { path: 'authId', select: 'role' },
  });

  if (!conversation) {
    conversation = await Conversation.create({ participants: [currentUser._id, otherUser._id] });
    conversation = await conversation.populate({
      path: 'participants',
      select: 'fullName profilePhoto verificationStatus college authId phoneNumber',
      populate: { path: 'authId', select: 'role' },
    });
  }

  res.status(200).json({ success: true, data: conversation });
});

// @desc    Send a text message (REST fallback; real-time uses Socket.IO)
// @route   POST /api/messages/conversations/:id
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const currentUser = await User.findOne({ authId: req.user._id });
  const { content, type = 'text' } = req.body;

  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });
  if (!conversation.participants.map(String).includes(currentUser._id.toString())) {
    return res.status(403).json({ success: false, message: 'Not a participant' });
  }

  // Block check
  const otherParticipant = await User.findOne({
    _id: { $in: conversation.participants },
    _id: { $ne: currentUser._id },
  });
  if (otherParticipant?.blockedUsers?.map(String).includes(currentUser._id.toString())) {
    return res.status(403).json({ success: false, message: 'You have been blocked by this user' });
  }

  let imageUrl = null, imagePublicId = null;
  if (type === 'image' && req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'vibeRoommate/messages');
    imageUrl = result.secure_url;
    imagePublicId = result.public_id;
  }

  const message = await Message.create({
    conversationId: conversation._id,
    sender: currentUser._id,
    content: content || '',
    type,
    imageUrl,
    imagePublicId,
  });

  conversation.lastMessage = {
    content: type === 'image' ? '[Image]' : (content || ''),
    sender: currentUser._id,
    type,
    sentAt: new Date(),
  };
  await conversation.save();

  const populated = await message.populate('sender', 'fullName profilePhoto');
  res.status(201).json({ success: true, data: populated });
});

// @desc    Upload file/image to Cloudinary for chat
// @route   POST /api/messages/conversations/:id/upload
// @access  Private
const uploadChatFile = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  const currentUser = await User.findOne({ authId: req.user._id });
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });
  if (!conversation.participants.map(String).includes(currentUser._id.toString())) {
    return res.status(403).json({ success: false, message: 'Not a participant' });
  }

  const result = await uploadToCloudinary(
    req.file.buffer,
    'vibeRoommate/messages',
    `msg_${currentUser._id}_${Date.now()}`
  );

  // Save the image message to DB
  const message = await Message.create({
    conversationId: conversation._id,
    sender: currentUser._id,
    content: result.secure_url,
    type: 'image',
    imageUrl: result.secure_url,
    imagePublicId: result.public_id,
  });

  conversation.lastMessage = {
    content: '[Image]',
    sender: currentUser._id,
    type: 'image',
    sentAt: new Date(),
  };
  await conversation.save();

  const populated = await message.populate('sender', 'fullName profilePhoto');
  res.status(201).json({ success: true, data: populated, url: result.secure_url });
});

module.exports = { getConversations, getMessages, startConversation, sendMessage, uploadChatFile };
