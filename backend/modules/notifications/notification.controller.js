const Notification = require('./notification.model');
const User = require('../users/user.model');
const asyncHandler = require('../../shared/utils/asyncHandler');

// @desc    Get notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const user = await User.findOne({ authId: req.user._id });
  const notifications = await Notification.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  const unreadCount = await Notification.countDocuments({ userId: user._id, isRead: false });
  res.status(200).json({ success: true, unreadCount, data: notifications });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const user = await User.findOne({ authId: req.user._id });
  await Notification.findOneAndUpdate({ _id: req.params.id, userId: user._id }, { isRead: true });
  res.status(200).json({ success: true });
});

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  const user = await User.findOne({ authId: req.user._id });
  await Notification.updateMany({ userId: user._id, isRead: false }, { isRead: true });
  res.status(200).json({ success: true });
});

module.exports = { getNotifications, markAsRead, markAllAsRead };
