const authMiddleware = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

// ✅ Protected route (move here)
router.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You accessed protected route",
    user: req.user
  });
});

module.exports = router;