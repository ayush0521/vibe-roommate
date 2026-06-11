const Report = require('./report.model');
const User = require('../users/user.model');
const asyncHandler = require('../../shared/utils/asyncHandler');

// @desc    Report a profile or listing
// @route   POST /api/reports
// @access  Private
const createReport = asyncHandler(async (req, res) => {
  const user = await User.findOne({ authId: req.user._id });
  const { targetType, targetId, reason, description } = req.body;

  if (!targetType || !targetId || !reason) {
    return res.status(400).json({ success: false, message: 'targetType, targetId and reason are required' });
  }

  const report = await Report.create({ reportedBy: user._id, targetType, targetId, reason, description });
  res.status(201).json({ success: true, message: 'Report submitted. Our team will review it shortly.', data: report });
});

module.exports = { createReport };
