const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    // 🔍 Debug (keep during development)
    console.log("🔐 AUTH HEADER:", authHeader);

    // ❌ No header
    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    // ❌ Wrong format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid token format",
      });
    }

    // ✅ Extract token
    const token = authHeader.split(" ")[1];

    console.log("🔑 TOKEN:", token);

    // ❌ Missing secret (very common mistake)
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is not defined in .env");
      return res.status(500).json({
        message: "Server configuration error",
      });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("✅ DECODED:", decoded);

    // 🔥 IMPORTANT: standardize user object
    req.user = {
      id: decoded.id,
    };

    next();
  } catch (err) {
    console.error("❌ JWT ERROR:", err.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;