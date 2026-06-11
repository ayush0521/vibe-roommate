const jwt = require('jsonwebtoken');
const Auth = require('../modules/auth/auth.model');
const { isBlocked } = require('../shared/utils/tokenBlocklist');

/**
 * Protect routes – verifies JWT token.
 * Reads from httpOnly cookie first (secure), falls back to Authorization header (Socket.IO).
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Prefer httpOnly cookie (set by login/register — XSS-safe)
  if (req.cookies && req.cookies.vr_token) {
    token = req.cookies.vr_token;
  }
  // 2. Fallback: Authorization header (Socket.IO handshake / API clients)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  // 3. Check blocklist — ensures logout is truly server-side
  if (isBlocked(token)) {
    return res.status(401).json({ success: false, message: 'Session has been invalidated. Please login again.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Auth.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (!req.user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed or expired' });
  }
};

/**
 * Role-based access control
 * @param  {...string} roles - allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

/**
 * Optional auth – attaches user if token exists, doesn't block if not
 */
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.vr_token) {
    token = req.cookies.vr_token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token && !isBlocked(token)) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await Auth.findById(decoded.id).select('-password');
    } catch {
      req.user = null;
    }
  }
  next();
};

module.exports = { protect, authorize, optionalAuth };
