const Verification = require('./verification.model');
const User = require('../users/user.model');
const asyncHandler = require('../../shared/utils/asyncHandler');
const { sendEmail, emailTemplates } = require('../../shared/utils/email');
const crypto = require('crypto');

// @desc    Submit college email for verification
// @route   POST /api/verification/college-email
// @access  Private
const submitCollegeEmail = asyncHandler(async (req, res) => {
  const { collegeEmail } = req.body;
  if (!collegeEmail) return res.status(400).json({ success: false, message: 'College email required' });

  const user = await User.findOne({ authId: req.user._id });
  const token = crypto.randomBytes(32).toString('hex');
  const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  await Verification.findOneAndUpdate(
    { userId: user._id },
    { userId: user._id, method: 'college-email', collegeEmail, token, tokenExpiry, status: 'pending' },
    { upsert: true, new: true }
  );

  user.verificationStatus = 'pending';
  await user.save();

  const link = `${process.env.FRONTEND_URL}/verify/${token}`;
  try {
    await sendEmail({ to: collegeEmail, subject: 'Verify your VibeRoommate Account', html: emailTemplates.verification(user.fullName || 'Student', link) });
  } catch (e) {
    console.warn('Email sending failed (non-critical):', e.message);
  }

  res.status(200).json({ success: true, message: 'Verification email sent. Check your college inbox.' });
});

// @desc    Verify via token link
// @route   GET /api/verification/verify/:token
// @access  Public
const verifyToken = asyncHandler(async (req, res) => {
  const verification = await Verification.findOne({
    token: req.params.token,
    tokenExpiry: { $gt: new Date() },
  });

  if (!verification) {
    return res.status(400).json({ success: false, message: 'Invalid or expired verification link' });
  }

  verification.status = 'verified';
  verification.verifiedAt = new Date();
  verification.token = null;
  await verification.save();

  await User.findByIdAndUpdate(verification.userId, { verificationStatus: 'verified' });

  res.status(200).json({ success: true, message: 'Email verified successfully! You now have a Verified Student badge.' });
});

// @desc    Submit for manual verification
// @route   POST /api/verification/manual
// @access  Private
const submitManual = asyncHandler(async (req, res) => {
  const user = await User.findOne({ authId: req.user._id });
  await Verification.findOneAndUpdate(
    { userId: user._id },
    { userId: user._id, method: 'manual', status: 'pending' },
    { upsert: true, new: true }
  );
  user.verificationStatus = 'pending';
  await user.save();
  res.status(200).json({ success: true, message: 'Manual verification request submitted. Expect review within 48 hours.' });
});

module.exports = { submitCollegeEmail, verifyToken, submitManual };
