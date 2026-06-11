const Auth = require('./auth.model');
const User = require('../users/user.model');
const asyncHandler = require('../../shared/utils/asyncHandler');
const { sendTokenResponse, clearTokenCookie, REFRESH_SECRET } = require('../../shared/utils/jwt');
const { addToBlocklist } = require('../../shared/utils/tokenBlocklist');
const { sendEmail, emailTemplates } = require('../../shared/utils/email');
const PasswordReset = require('../../shared/models/passwordReset.model');
const EmailVerification = require('../../shared/models/emailVerification.model');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { email, password, role = 'student' } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const existing = await Auth.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const auth = await Auth.create({ email, password, role });

  // Create empty user profile
  const user = await User.create({ authId: auth._id });

  // Send email verification OTP async (non-blocking)
  setImmediate(async () => {
    try {
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await EmailVerification.create({ email: auth.email, otp, expiresAt });
      await sendEmail({
        to: auth.email,
        subject: 'VibeRoommate — Verify Your Email',
        html: emailTemplates.emailVerificationOtp(otp),
      });
    } catch (e) { /* non-critical — user can resend */ }
  });

  sendTokenResponse(auth, 201, res, { profileId: user._id, isProfileComplete: false });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  const auth = await Auth.findOne({ email }).select('+password');
  if (!auth || !auth.password) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const isMatch = await auth.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (!auth.isActive) {
    return res.status(403).json({ success: false, message: 'Account has been deactivated' });
  }

  auth.lastLogin = new Date();
  await auth.save({ validateBeforeSave: false });

  const userProfile = await User.findOne({ authId: auth._id });
  sendTokenResponse(auth, 200, res, {
    profileId: userProfile?._id,
    isProfileComplete: userProfile?.isProfileComplete || false,
    hasCompletedQuiz: userProfile?.hasCompletedQuiz || false,
  });
});

// @desc    Google OAuth login/register
// @route   POST /api/auth/google
// @access  Public
const googleAuth = asyncHandler(async (req, res) => {
  const { credential, role = 'student' } = req.body;

  if (!credential) {
    return res.status(400).json({ success: false, message: 'Google credential required' });
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, sub: googleId, name, picture } = payload;

  let auth = await Auth.findOne({ $or: [{ email }, { googleId }] });

  if (!auth) {
    auth = await Auth.create({ email, googleId, role, isEmailVerified: true });
    const user = await User.create({
      authId: auth._id,
      fullName: name || '',
      profilePhoto: { url: picture || '', publicId: '' },
    });
    auth.lastLogin = new Date();
    await auth.save({ validateBeforeSave: false });
    const userProfile = user;
    return sendTokenResponse(auth, 201, res, {
      profileId: userProfile._id,
      isProfileComplete: false,
      hasCompletedQuiz: false,
    });
  }

  if (!auth.googleId) {
    auth.googleId = googleId;
    await auth.save({ validateBeforeSave: false });
  }

  auth.lastLogin = new Date();
  await auth.save({ validateBeforeSave: false });

  const userProfile = await User.findOne({ authId: auth._id });
  sendTokenResponse(auth, 200, res, {
    profileId: userProfile?._id,
    isProfileComplete: userProfile?.isProfileComplete || false,
    hasCompletedQuiz: userProfile?.hasCompletedQuiz || false,
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const auth = req.user;
  const userProfile = await User.findOne({ authId: auth._id });

  res.status(200).json({
    success: true,
    data: {
      auth: {
        id: auth._id,
        email: auth.email,
        role: auth.role,
        isPremium: auth.isPremium,
        isEmailVerified: auth.isEmailVerified,
      },
      profile: userProfile,
    },
  });
});

// @desc    Logout – invalidates JWT server-side and clears httpOnly cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  // 1. Add both tokens to blocklist
  const accessToken  = req.cookies?.vr_token || req.headers.authorization?.replace('Bearer ', '');
  const refreshToken = req.cookies?.vr_refresh;
  if (accessToken)  addToBlocklist(accessToken);
  if (refreshToken) addToBlocklist(refreshToken);

  // 2. Clear both httpOnly cookies in the browser
  clearTokenCookie(res);

  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @desc    Forgot password — sends 6-digit OTP to email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  // Always return success to avoid user enumeration
  const auth = await Auth.findOne({ email: email.toLowerCase().trim() });
  if (!auth) {
    return res.status(200).json({ success: true, message: 'If this email is registered, an OTP has been sent.' });
  }

  // Generate 6-digit OTP
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Invalidate any existing OTPs for this email
  await PasswordReset.deleteMany({ email: email.toLowerCase().trim() });

  // Save new OTP
  await PasswordReset.create({ email: email.toLowerCase().trim(), otp, expiresAt });

  // Send OTP email
  try {
    await sendEmail({
      to: email,
      subject: 'VibeRoommate — Password Reset OTP',
      html: emailTemplates.passwordReset(otp),
    });
  } catch (emailErr) {
    console.warn('⚠️  OTP email failed:', emailErr.message);
    // Don't fail the request — OTP is saved, user can retry
  }

  res.status(200).json({ success: true, message: 'If this email is registered, an OTP has been sent.' });
});

// @desc    Reset password — verifies OTP and sets new password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  // Find valid, unused OTP
  const record = await PasswordReset.findOne({
    email: email.toLowerCase().trim(),
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!record) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please request a new one.' });
  }

  if (record.otp !== otp.trim()) {
    return res.status(400).json({ success: false, message: 'Incorrect OTP. Please try again.' });
  }

  // Mark OTP as used
  record.used = true;
  await record.save();

  // Update password
  const auth = await Auth.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!auth) {
    return res.status(404).json({ success: false, message: 'Account not found' });
  }

  auth.password = newPassword; // Pre-save hook hashes it
  await auth.save();

  res.status(200).json({ success: true, message: 'Password reset successfully. Please login with your new password.' });
});

// @desc    Refresh access token using refresh token cookie
// @route   POST /api/auth/refresh
// @access  Public (requires vr_refresh cookie)
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.vr_refresh;

  if (!token) {
    return res.status(401).json({ success: false, message: 'No refresh token provided' });
  }

  // Check if this refresh token was already invalidated (logout)
  const { isBlocked } = require('../../shared/utils/tokenBlocklist');
  if (isBlocked(token)) {
    return res.status(401).json({ success: false, message: 'Session invalidated. Please login again.' });
  }

  try {
    const decoded = jwt.verify(token, REFRESH_SECRET);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ success: false, message: 'Invalid token type' });
    }

    const auth = await Auth.findById(decoded.id);
    if (!auth || !auth.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated' });
    }

    // Rotate: blocklist old refresh token, issue new pair
    addToBlocklist(token);
    sendTokenResponse(auth, 200, res);

  } catch (err) {
    clearTokenCookie(res);
    return res.status(401).json({ success: false, message: 'Refresh token expired. Please login again.' });
  }
});

// @desc    Verify login email with OTP
// @route   POST /api/auth/verify-email
// @access  Private
const verifyEmail = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  if (!otp) return res.status(400).json({ success: false, message: 'OTP is required' });

  const record = await EmailVerification.findOne({
    email: req.user.email,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!record) {
    return res.status(400).json({ success: false, message: 'OTP expired or not found. Please resend.' });
  }

  if (record.otp !== otp.trim()) {
    return res.status(400).json({ success: false, message: 'Incorrect OTP. Please try again.' });
  }

  // Mark OTP used and update user
  record.used = true;
  await record.save();

  await Auth.findByIdAndUpdate(req.user._id, { isEmailVerified: true });

  res.status(200).json({ success: true, message: 'Email verified successfully! 🎉' });
});

// @desc    Resend email verification OTP
// @route   POST /api/auth/resend-verification
// @access  Private
const resendVerification = asyncHandler(async (req, res) => {
  if (req.user.isEmailVerified) {
    return res.status(400).json({ success: false, message: 'Email is already verified' });
  }

  // Invalidate old OTPs
  await EmailVerification.deleteMany({ email: req.user.email });

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await EmailVerification.create({ email: req.user.email, otp, expiresAt });

  try {
    await sendEmail({
      to: req.user.email,
      subject: 'VibeRoommate — Verify Your Email',
      html: emailTemplates.emailVerificationOtp(otp),
    });
  } catch (e) {
    console.warn('⚠️  Resend verification email failed:', e.message);
  }

  res.status(200).json({ success: true, message: 'Verification OTP sent to your email.' });
});

module.exports = {
  register, login, googleAuth, getMe, logout,
  forgotPassword, resetPassword,
  refreshToken, verifyEmail, resendVerification,
};

