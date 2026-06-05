const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getMatches
} = require("../controllers/matchController");

// ✅ REAL MATCH ROUTE
router.get("/", authMiddleware, getMatches);

module.exports = router;