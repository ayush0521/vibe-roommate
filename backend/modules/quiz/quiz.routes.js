const express = require('express');
const router = express.Router();
const { getQuestions, submitQuiz, getQuizResult } = require('./quiz.controller');
const { protect } = require('../../middleware/auth');

router.get('/questions', protect, getQuestions);
router.post('/submit', protect, submitQuiz);
router.get('/result', protect, getQuizResult);

module.exports = router;
