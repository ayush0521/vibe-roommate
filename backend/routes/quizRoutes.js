const express = require("express");
const router = express.Router();

const { submitQuiz } = require("../controllers/quizController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/submit", authMiddleware, submitQuiz);

module.exports = router;