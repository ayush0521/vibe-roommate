const Match = require('./match.model');
const User = require('../users/user.model');
const QuizResult = require('../quiz/quizResult.model');
const Notification = require('../notifications/notification.model');
const asyncHandler = require('../../shared/utils/asyncHandler');
const { checkHardFilters, calculateCompatibilityScore } = require('../../shared/utils/matchEngine');

// @desc    Compute matches for current user
// @route   POST /api/matches/compute
// @access  Private
const computeMatches = asyncHandler(async (req, res) => {
  const currentUser = await User.findOne({ authId: req.user._id });
  if (!currentUser) return res.status(404).json({ success: false, message: 'Profile not found' });
  if (!currentUser.hasCompletedQuiz) {
    return res.status(400).json({ success: false, message: 'Complete the quiz first to get matches' });
  }

  // Find all eligible users (same gender, same city, profile complete, quiz done, not self)
  const candidates = await User.find({
    _id: { $ne: currentUser._id },
    gender: currentUser.gender,
    isProfileComplete: true,
    hasCompletedQuiz: true,
    city: currentUser.city,
  });

  if (candidates.length === 0) {
    return res.status(200).json({ success: true, computed: 0, message: 'No eligible candidates found yet' });
  }

  const candidateIds = candidates.map((c) => c._id);

  // ── FIX: Pre-fetch everything in 3 queries instead of N*2 queries ──

  // 1. All existing matches involving current user → build Set of already-matched IDs
  const existingMatches = await Match.find(
    { $or: [{ user1: currentUser._id }, { user2: currentUser._id }] },
    { user1: 1, user2: 1 }
  );
  const alreadyMatchedIds = new Set(
    existingMatches.flatMap((m) => [m.user1.toString(), m.user2.toString()])
      .filter((id) => id !== currentUser._id.toString())
  );

  // 2. Current user's quiz result
  const currentQuiz = await QuizResult.findOne({ userId: currentUser._id });

  // 3. All quiz results for all candidates in one query → Map
  const candidateQuizResults = await QuizResult.find({ userId: { $in: candidateIds } });
  const quizMap = new Map(candidateQuizResults.map((q) => [q.userId.toString(), q]));

  // ── Process candidates in-memory (zero DB calls in loop) ──
  const newMatches = [];
  const notificationsToCreate = [];

  for (const candidate of candidates) {
    // Skip if already matched
    if (alreadyMatchedIds.has(candidate._id.toString())) continue;

    // Hard filter check (in-memory, no DB)
    const hardResult = checkHardFilters(currentUser, candidate);
    if (!hardResult.passed) continue;

    // Soft score (in-memory)
    const candidateQuiz = quizMap.get(candidate._id.toString());
    const { score, explanation, breakdown } = calculateCompatibilityScore(
      currentUser, candidate,
      currentQuiz?.hiddenScores, candidateQuiz?.hiddenScores
    );

    newMatches.push({
      user1: currentUser._id,
      user2: candidate._id,
      compatibilityScore: score,
      explanation,
      breakdown,
      hardFilterPassed: true,
    });

    notificationsToCreate.push({
      userId: candidate._id,
      type: 'new_match',
      title: 'New Roommate Match! 🎉',
      content: `You have a new ${score}% compatible roommate match!`,
      metadata: { fromUserId: currentUser._id },
      link: '/matches',
    });
  }

  // ── Batch insert all new matches in ONE query ──
  let createdMatches = [];
  if (newMatches.length > 0) {
    createdMatches = await Match.insertMany(newMatches, { ordered: false });

    // Add matchId to notifications
    createdMatches.forEach((match, i) => {
      if (notificationsToCreate[i]) {
        notificationsToCreate[i].metadata.matchId = match._id;
      }
    });

    // Batch insert notifications in ONE query
    await Notification.insertMany(notificationsToCreate, { ordered: false });

    // Send WhatsApp alerts (async, non-blocking)
    setImmediate(async () => {
      try {
        const { sendWhatsApp } = require('../../shared/utils/whatsapp');
        for (const match of createdMatches) {
          // Find target user from candidates
          const targetCandidate = candidates.find(c => c._id.toString() === match.user2.toString());
          if (targetCandidate && targetCandidate.phoneNumber) {
            const msg = `Hi ${targetCandidate.fullName || 'there'}! You have a new roommate match (${match.compatibilityScore}% compatible) on VibeRoommate 🏠`;
            await sendWhatsApp(targetCandidate.phoneNumber, msg);
          }
        }
      } catch (err) {
        console.error('⚠️ WhatsApp alert triggers failed:', err.message);
      }
    });
  }

  res.status(200).json({
    success: true,
    computed: createdMatches.length,
    message: `${createdMatches.length} new matches found`,
  });
});

// @desc    Get my matches (paginated)
// @route   GET /api/matches?page=1&limit=6
// @access  Private
const getMatches = asyncHandler(async (req, res) => {
  const currentUser = await User.findOne({ authId: req.user._id });
  if (!currentUser) return res.status(404).json({ success: false, message: 'Profile not found' });

  const isPremium = req.user.isPremium;

  // Free users: always max 3. Premium: paginated.
  const page  = parseInt(req.query.page)  || 1;
  const limit = isPremium ? (parseInt(req.query.limit) || 6) : 3;
  const skip  = isPremium ? (page - 1) * limit : 0;

  const total = await Match.countDocuments({
    $or: [{ user1: currentUser._id }, { user2: currentUser._id }],
    hardFilterPassed: true,
  });

  const matches = await Match.find({
    $or: [{ user1: currentUser._id }, { user2: currentUser._id }],
    hardFilterPassed: true,
  })
    .sort({ compatibilityScore: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user1', 'fullName profilePhoto college city personalityTags verificationStatus gender course year')
    .populate('user2', 'fullName profilePhoto college city personalityTags verificationStatus gender course year');

  // Format to show the "other" user
  const formatted = matches.map((m) => {
    const isUser1 = m.user1._id.toString() === currentUser._id.toString();
    const otherUser = isUser1 ? m.user2 : m.user1;
    return {
      matchId:            m._id,
      compatibilityScore: m.compatibilityScore,
      explanation:        m.explanation,
      breakdown:          m.breakdown,
      status:             m.status,
      user:               otherUser,
      createdAt:          m.createdAt,
    };
  });

  const totalAvailable = await Match.countDocuments({
    $or: [{ user1: currentUser._id }, { user2: currentUser._id }],
  });

  res.status(200).json({
    success: true,
    data:           formatted,
    isPremium,
    totalAvailable,
    // Pagination metadata
    total,
    page,
    totalPages:     Math.ceil(total / limit),
    hasMore:        isPremium ? page < Math.ceil(total / limit) : false,
  });
});


// @desc    Get single match
// @route   GET /api/matches/:matchId
// @access  Private
const getMatch = asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.matchId)
    .populate('user1', 'fullName profilePhoto college city personalityTags verificationStatus bio budgetRange')
    .populate('user2', 'fullName profilePhoto college city personalityTags verificationStatus bio budgetRange');

  if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
  res.status(200).json({ success: true, data: match });
});

module.exports = { computeMatches, getMatches, getMatch };
