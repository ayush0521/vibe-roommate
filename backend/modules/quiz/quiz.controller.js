const Question = require('./quiz.model');
const QuizResult = require('./quizResult.model');
const User = require('../users/user.model');
const asyncHandler = require('../../shared/utils/asyncHandler');
const { assignPersonalityTags } = require('../../shared/utils/matchEngine');

// @desc    Get 10 random quiz questions
// @route   GET /api/quiz/questions
// @access  Private
const getQuestions = asyncHandler(async (req, res) => {
  // Get 10 random from active question bank
  const questions = await Question.aggregate([
    { $match: { isActive: true } },
    { $sample: { size: 10 } },
    { $project: { question: 1, category: 1, type: 1, options: 1, sliderMin: 1, sliderMax: 1, sliderLabels: 1 } },
  ]);

  res.status(200).json({ success: true, count: questions.length, data: questions });
});

// @desc    Submit quiz answers
// @route   POST /api/quiz/submit
// @access  Private
const submitQuiz = asyncHandler(async (req, res) => {
  const { answers } = req.body; // [{ questionId, category, value }]

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ success: false, message: 'Answers are required' });
  }

  const user = await User.findOne({ authId: req.user._id });
  if (!user) return res.status(404).json({ success: false, message: 'Profile not found' });

  // Calculate category averages
  const categoryScores = {};
  const categoryCounts = {};

  answers.forEach(({ category, value }) => {
    if (!categoryScores[category]) { categoryScores[category] = 0; categoryCounts[category] = 0; }
    categoryScores[category] += value;
    categoryCounts[category]++;
  });

  const hiddenScores = {};
  Object.keys(categoryScores).forEach((cat) => {
    hiddenScores[cat] = Math.round((categoryScores[cat] / categoryCounts[cat]) * 10) / 10;
  });

  // Assign personality tags
  const personalityTags = assignPersonalityTags({
    sleep: hiddenScores.sleep || 5,
    cleanliness: hiddenScores.cleanliness || 5,
    social: hiddenScores.social || 5,
    study: hiddenScores.study || 5,
    financial: hiddenScores.financial || 5,
    conflict: hiddenScores.conflict || 5,
    lifestyle: hiddenScores.lifestyle || 5,
  });

  // Save or update quiz result
  const existing = await QuizResult.findOne({ userId: user._id });
  let result;
  if (existing) {
    existing.answers = answers;
    existing.hiddenScores = hiddenScores;
    existing.personalityTags = personalityTags;
    existing.retakeCount += 1;
    existing.completedAt = new Date();
    result = await existing.save();
  } else {
    result = await QuizResult.create({ userId: user._id, answers, hiddenScores, personalityTags });
  }

  // Update user profile with scores and tags
  user.personalityTags = personalityTags;
  user.compatibilityScores = hiddenScores;
  user.hasCompletedQuiz = true;
  await user.save();

  res.status(200).json({ success: true, data: { personalityTags, hiddenScores, result } });
});

// @desc    Get own quiz result
// @route   GET /api/quiz/result
// @access  Private
const getQuizResult = asyncHandler(async (req, res) => {
  const user = await User.findOne({ authId: req.user._id });
  if (!user) return res.status(404).json({ success: false, message: 'Profile not found' });

  const result = await QuizResult.findOne({ userId: user._id });
  if (!result) return res.status(404).json({ success: false, message: 'Quiz not completed yet' });

  res.status(200).json({ success: true, data: result });
});

module.exports = { getQuestions, submitQuiz, getQuizResult };
