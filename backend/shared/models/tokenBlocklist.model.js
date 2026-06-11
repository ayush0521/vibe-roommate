const mongoose = require('mongoose');

/**
 * Persisted token blocklist — survives server restarts.
 * TTL index on `expiresAt` means MongoDB auto-deletes expired entries.
 * No manual cleanup cron needed.
 */
const tokenBlocklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, { timestamps: false });

// MongoDB TTL index — auto-deletes documents when expiresAt is passed
tokenBlocklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('TokenBlocklist', tokenBlocklistSchema);
