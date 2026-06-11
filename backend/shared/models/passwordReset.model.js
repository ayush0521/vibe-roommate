const mongoose = require('mongoose');

/**
 * Password reset OTP model.
 * TTL index auto-deletes documents after 15 minutes (expiresAt).
 */
const passwordResetSchema = new mongoose.Schema({
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

// TTL index — MongoDB auto-deletes after 15 min (OTP expiry)
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Fast lookup by email
passwordResetSchema.index({ email: 1 });

module.exports = mongoose.model('PasswordReset', passwordResetSchema);
