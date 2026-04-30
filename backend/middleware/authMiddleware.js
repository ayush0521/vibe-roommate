const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // 1. get token from header
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "No token, access denied" });
    }

    // 2. remove "Bearer "
    const actualToken = token.startsWith("Bearer ")
      ? token.slice(7)
      : token;

    // 3. verify token
    const decoded = jwt.verify(actualToken, "mysecretkey");

    // 4. attach user info to request
    req.user = decoded;

    next(); // move to next step
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;