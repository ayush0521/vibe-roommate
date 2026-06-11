const express = require('express');
const router = express.Router();
const {
  register, login, googleAuth, getMe, logout,
  forgotPassword, resetPassword,
  refreshToken, verifyEmail, resendVerification,
} = require('./auth.controller');
const { protect } = require('../../middleware/auth');
const { authLimiter } = require('../../middleware/rateLimiter');

router.post('/register',           authLimiter, register);
router.post('/login',              authLimiter, login);
router.post('/google',             authLimiter, googleAuth);
router.get( '/me',                 protect, getMe);
router.post('/logout',             protect, logout);
router.post('/forgot-password',    authLimiter, forgotPassword);
router.post('/reset-password',     authLimiter, resetPassword);
router.post('/refresh',            refreshToken);        // No protect — uses vr_refresh cookie
router.post('/verify-email',       protect, verifyEmail);
router.post('/resend-verification',protect, resendVerification);

module.exports = router;
