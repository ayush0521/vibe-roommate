const express = require("express");
const router = express.Router();

const {
  sendMessage,
  getMessages,
} = require("../controllers/messageController");

const auth = require("../middleware/authMiddleware");

// POST → send message
router.post("/", auth, sendMessage);

// GET → fetch chat
router.get("/:userId", auth, getMessages);

module.exports = router;