const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, async (req, res) => {
  res.json({
    currentUser: "Test User",
    matches: []
  });
});

module.exports = router;