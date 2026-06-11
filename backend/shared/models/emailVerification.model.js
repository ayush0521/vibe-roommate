const mongoose = require('mongoose');

/**
 * Email Verification OTP model (for verifying login email on registration).
 * Separate from college-email verification (which uses the Verification module).
 * TTL index auto-deletes documents after 15 minutes.
 */
const emailVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// MongoDB TTL — auto-deletes expired OTPs
emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
emailVerificationSchema.index({ email: 1 });

module.exports = mongoose.model('EmailVerification', emailVerificationSchema);
