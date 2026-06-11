const jwt = require('jsonwebtoken');

const ACCESS_SECRET  = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh';

// ── Token Generators ───────────────────────────────────────────────────────

const generateAccessToken = (id) =>
  jwt.sign({ id, type: 'access' }, ACCESS_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30m',
  });

const generateRefreshToken = (id) =>
  jwt.sign({ id, type: 'refresh' }, REFRESH_SECRET, {
    expiresIn: '7d',
  });

// ── Legacy alias (used in socket auth) ────────────────────────────────────
const generateToken = generateAccessToken;

// ── Send Tokens as httpOnly Cookies ───────────────────────────────────────
/**
 * Sets TWO httpOnly cookies:
 *   vr_token   — access token  (30 min, used by every API request)
 *   vr_refresh — refresh token (7 days, used to silently renew access token)
 *
 * Also returns the access token in JSON body for Socket.IO handshake.
 */
const sendTokenResponse = (auth, statusCode, res, extraData = {}) => {
  const accessToken  = generateAccessToken(auth._id);
  const refreshToken = generateRefreshToken(auth._id);

  const isProd      = process.env.NODE_ENV === 'production';
  const sameSiteVal = isProd ? 'strict' : 'lax';
  const secureVal   = isProd;

  // Access token cookie — 30 min
  const accessExpireMs = parseExpireToMs(process.env.JWT_EXPIRE || '30m');
  res.cookie('vr_token', accessToken, {
    httpOnly: true,
    secure:   secureVal,
    sameSite: sameSiteVal,
    maxAge:   accessExpireMs,
    path:     '/',
  });

  // Refresh token cookie — 7 days
  res.cookie('vr_refresh', refreshToken, {
    httpOnly: true,
    secure:   secureVal,
    sameSite: sameSiteVal,
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
    path:     '/api/auth/refresh',      // Only sent to refresh endpoint (security)
  });

  res.status(statusCode).json({
    success: true,
    token: accessToken, // Needed only for Socket.IO (cannot access cookies)
    user: {
      id:              auth._id,
      email:           auth.email,
      role:            auth.role,
      isPremium:       auth.isPremium,
      isEmailVerified: auth.isEmailVerified,
    },
    ...extraData,
  });
};

// ── Clear Both Cookies on Logout ───────────────────────────────────────────
const clearTokenCookie = (res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('vr_token', '', {
    httpOnly: true,
    secure:   isProd,
    sameSite: isProd ? 'strict' : 'lax',
    expires:  new Date(0),
    path:     '/',
  });
  res.cookie('vr_refresh', '', {
    httpOnly: true,
    secure:   isProd,
    sameSite: isProd ? 'strict' : 'lax',
    expires:  new Date(0),
    path:     '/api/auth/refresh',
  });
};

// ── Helpers ───────────────────────────────────────────────────────────────
const parseExpireToMs = (expire) => {
  const unit  = expire.slice(-1);
  const value = parseInt(expire.slice(0, -1), 10);
  switch (unit) {
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default:  return 30 * 60 * 1000;
  }
};

module.exports = {
  generateToken,
  generateAccessToken,
  generateRefreshToken,
  sendTokenResponse,
  clearTokenCookie,
  ACCESS_SECRET,
  REFRESH_SECRET,
};
