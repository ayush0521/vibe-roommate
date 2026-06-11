/**
 * Token Blocklist — Hybrid implementation
 *
 * L1: In-memory Set  → Zero-latency sync lookups on every request
 * L2: MongoDB         → Survives server restarts (persistent)
 *
 * TTL index on the DB model auto-deletes expired tokens — no manual cron needed.
 */

const jwt = require('jsonwebtoken');

// In-memory cache (fast sync lookup for auth middleware)
const _cache = new Set();

/**
 * Add a token to the blocklist.
 * Writes to in-memory cache immediately (sync) + persists to DB async.
 * @param {string} token
 */
const addToBlocklist = (token) => {
  _cache.add(token);

  // Async persist to MongoDB — fire-and-forget, no await needed
  setImmediate(async () => {
    try {
      const BlockedToken = require('../models/tokenBlocklist.model');
      const decoded = jwt.decode(token);
      if (decoded?.exp) {
        const expiresAt = new Date(decoded.exp * 1000);
        await BlockedToken.create({ token, expiresAt });
      }
    } catch (err) {
      // Duplicate key = already blocked; ignore silently
      if (err.code !== 11000) {
        console.warn('⚠️  Blocklist persist warning:', err.message);
      }
    }
  });
};

/**
 * Check if token is blocked (sync — uses in-memory cache).
 * @param {string} token
 * @returns {boolean}
 */
const isBlocked = (token) => _cache.has(token);

/**
 * Load all unexpired tokens from MongoDB into the in-memory cache.
 * Called once on server startup after DB connects.
 * Ensures blocked tokens survive server restarts.
 */
const loadBlocklistFromDB = async () => {
  try {
    const BlockedToken = require('../models/tokenBlocklist.model');
    const tokens = await BlockedToken.find({ expiresAt: { $gt: new Date() } }, { token: 1 });
    tokens.forEach((t) => _cache.add(t.token));
    if (tokens.length > 0) {
      console.log(`🔐 Blocklist restored: ${tokens.length} invalidated token(s) loaded from DB`);
    }
  } catch (err) {
    console.warn('⚠️  Could not load blocklist from DB (non-critical):', err.message);
  }
};

/**
 * Periodic cleanup — removes expired tokens from the in-memory cache.
 * DB cleanup is handled automatically by MongoDB TTL index.
 * Run every 31 minutes.
 */
const startCacheCleanup = () => {
  setInterval(() => {
    let removed = 0;
    for (const token of _cache) {
      try {
        const decoded = jwt.decode(token);
        if (!decoded?.exp || decoded.exp * 1000 < Date.now()) {
          _cache.delete(token);
          removed++;
        }
      } catch {
        _cache.delete(token);
        removed++;
      }
    }
    if (removed > 0) console.log(`🧹 Blocklist cache: removed ${removed} expired token(s)`);
  }, 31 * 60 * 1000); // every 31 minutes
};

module.exports = { addToBlocklist, isBlocked, loadBlocklistFromDB, startCacheCleanup };
