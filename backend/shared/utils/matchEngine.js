// Matching Engine – Hard + Soft filters + AI Explanation Generator

// ── Helpers ────────────────────────────────────────────────────────────────

const formatBudget = (b) => b ? `₹${(b.min / 1000).toFixed(0)}k–₹${(b.max / 1000).toFixed(0)}k` : 'similar';

const foodLabel = (pref) => ({
  veg: 'vegetarian 🥗', nonveg: 'non-vegetarian 🍗',
  eggetarian: 'eggetarian 🥚', jain: 'jain 🌿', vegan: 'vegan 🌱',
})[pref] || pref || 'similar food';

const sleepLabel = (s) => ({
  'early-bird': 'early birds 🐦', 'night-owl': 'night owls 🌙', flexible: 'flexible sleepers 😴',
})[s] || s || 'similar schedule';

const foodArrLabel = (f) => ({
  mess: 'mess 🍽️', 'self-cook': 'self-cooking 🍳', mixed: 'mixed arrangement 🤝',
})[f] || f;

const checkHabit = (h1, h2) => {
  if (h1 === 'flexible' || h2 === 'flexible') return true;
  if (h1 === 'no' && h2 === 'yes') return false;
  if (h1 === 'yes' && h2 === 'no') return false;
  return true;
};

const checkBudgetOverlap = (b1, b2) => {
  if (!b1 || !b2) return true;
  const overlapMin = Math.max(b1.min, b2.min);
  const overlapMax = Math.min(b1.max, b2.max);
  const avg = (b1.max + b2.max) / 2;
  return overlapMax >= overlapMin || Math.abs(b1.max - b2.max) <= avg * 0.3;
};

const checkPartialFoodMatch = (f1, f2) => {
  const vegGroup = ['veg', 'jain', 'eggetarian'];
  return vegGroup.includes(f1) && vegGroup.includes(f2);
};

// ── Hard Filters ───────────────────────────────────────────────────────────

/**
 * Check hard filter compatibility between two users.
 * Returns { passed: true } or { passed: false, reason: string }
 */
const checkHardFilters = (user1, user2) => {
  if (user1.gender !== user2.gender) return { passed: false, reason: 'Gender mismatch' };
  if (!checkHabit(user1.smokingHabit, user2.smokingHabit)) return { passed: false, reason: 'Smoking habit incompatible' };
  if (!checkHabit(user1.drinkingHabit, user2.drinkingHabit)) return { passed: false, reason: 'Drinking habit incompatible' };
  if (!checkBudgetOverlap(user1.budgetRange, user2.budgetRange)) return { passed: false, reason: 'Budget mismatch is too extreme' };
  return { passed: true };
};

// ── AI Match Explanation ───────────────────────────────────────────────────

/**
 * Generates human-readable, emoji-rich match highlights.
 * Used to tell users *why* they are a good match.
 *
 * @param {object} user1   - Full user profile object
 * @param {object} user2   - Full user profile object
 * @param {object} scores1 - Quiz score object for user1 { sleep, study, social, cleanliness, ... }
 * @param {object} scores2 - Quiz score object for user2
 * @returns {string[]} Array of 3-5 human-readable highlight strings
 */
const generateExplanation = (user1, user2, scores1 = {}, scores2 = {}) => {
  const highlights = [];

  // Food preference
  if (user1.foodPreference && user1.foodPreference === user2.foodPreference) {
    highlights.push(`Both prefer ${foodLabel(user1.foodPreference)}`);
  } else if (user1.foodPreference && user2.foodPreference && checkPartialFoodMatch(user1.foodPreference, user2.foodPreference)) {
    highlights.push(`Compatible diet — ${foodLabel(user1.foodPreference)} & ${foodLabel(user2.foodPreference)}`);
  }

  // Sleep schedule
  if (user1.sleepSchedule && user1.sleepSchedule === user2.sleepSchedule) {
    highlights.push(`Sleep schedules align — you're both ${sleepLabel(user1.sleepSchedule)}`);
  } else if (user1.sleepSchedule === 'flexible' || user2.sleepSchedule === 'flexible') {
    highlights.push('Sleep schedule compatibility — one is flexible ⏰');
  }

  // Budget overlap
  if (user1.budgetRange && user2.budgetRange) {
    const b1 = user1.budgetRange, b2 = user2.budgetRange;
    const overlapMin = Math.max(b1.min, b2.min);
    const overlapMax = Math.min(b1.max, b2.max);
    if (overlapMax >= overlapMin) {
      highlights.push(`Budget overlap: ${formatBudget({ min: overlapMin, max: overlapMax })} per month 💰`);
    } else {
      highlights.push(`Similar budget goals: ${formatBudget(b1)} & ${formatBudget(b2)}`);
    }
  }

  // Cleanliness
  const cleanDiff = Math.abs((scores1.cleanliness || 5) - (scores2.cleanliness || 5));
  if (cleanDiff <= 1) highlights.push('Similar cleanliness standards ✨');
  else if (cleanDiff <= 2) highlights.push('Reasonably compatible cleanliness habits 🧹');

  // Study habits
  const studyDiff = Math.abs((scores1.study || 5) - (scores2.study || 5));
  if (studyDiff <= 1) {
    const lv = ((scores1.study || 5) + (scores2.study || 5)) / 2;
    highlights.push(lv >= 7 ? 'Both are study-focused 📚' : lv <= 3 ? 'Both are laid-back studiers 😎' : 'Compatible study environments 📖');
  }

  // Social level
  const socialDiff = Math.abs((scores1.social || 5) - (scores2.social || 5));
  if (socialDiff <= 1) {
    const lv = ((scores1.social || 5) + (scores2.social || 5)) / 2;
    highlights.push(lv >= 7 ? 'Both are social and love hanging out 🎉' : lv <= 3 ? 'Both prefer a quiet home environment 🏠' : 'Balanced social lifestyle 🤝');
  }

  // Food arrangement
  if (user1.foodArrangement && user1.foodArrangement === user2.foodArrangement) {
    highlights.push(`Both prefer ${foodArrLabel(user1.foodArrangement)}`);
  }

  // Guest preference
  if (user1.guestPreference && user1.guestPreference === user2.guestPreference) {
    const g = user1.guestPreference;
    if (g === 'no') highlights.push('Both prefer no guests at home 🚫');
    else if (g === 'flexible') highlights.push('Both are flexible about guests 👋');
    else if (g === 'occasionally') highlights.push('Both are okay with occasional guests 🎊');
  }

  // Smoking-free
  if (user1.smokingHabit === 'no' && user2.smokingHabit === 'no') {
    highlights.push('Non-smoking home preference 🚭');
  }

  return highlights.slice(0, 5); // Top 5 highlights
};

// ── Soft Compatibility Score ───────────────────────────────────────────────

/**
 * Calculate soft compatibility score (0–100) between two users.
 * Also returns emoji-rich explanation strings via generateExplanation.
 */
const calculateCompatibilityScore = (user1, user2, scores1, scores2) => {
  const weights = {
    foodPreference: 15,
    foodArrangement: 10,
    sleepSchedule: 15,
    studyStyle: 15,
    socialLevel: 10,
    cleanliness: 15,
    guestPreference: 10,
    noisePreference: 10,
  };

  let totalScore = 0;
  const breakdown = {};

  // Food Preference
  const foodScore = user1.foodPreference === user2.foodPreference ? 100
    : checkPartialFoodMatch(user1.foodPreference, user2.foodPreference) ? 60 : 20;
  totalScore += (foodScore * weights.foodPreference) / 100;
  breakdown.foodPreference = foodScore;

  // Food Arrangement
  const foodArrScore = user1.foodArrangement === user2.foodArrangement ? 100
    : (user1.foodArrangement === 'mixed' || user2.foodArrangement === 'mixed') ? 70 : 30;
  totalScore += (foodArrScore * weights.foodArrangement) / 100;
  breakdown.foodArrangement = foodArrScore;

  // Sleep Schedule
  const sleepScore = user1.sleepSchedule === user2.sleepSchedule ? 100
    : (user1.sleepSchedule === 'flexible' || user2.sleepSchedule === 'flexible') ? 70 : 20;
  totalScore += (sleepScore * weights.sleepSchedule) / 100;
  breakdown.sleepSchedule = sleepScore;

  // Study Style
  const studyDiff = Math.abs((scores1?.study || 5) - (scores2?.study || 5));
  const studyScore = Math.max(0, 100 - studyDiff * 15);
  totalScore += (studyScore * weights.studyStyle) / 100;
  breakdown.studyStyle = studyScore;

  // Social Level
  const socialDiff = Math.abs((scores1?.social || 5) - (scores2?.social || 5));
  const socialScore = Math.max(0, 100 - socialDiff * 15);
  totalScore += (socialScore * weights.socialLevel) / 100;
  breakdown.socialLevel = socialScore;

  // Cleanliness
  const cleanDiff = Math.abs((scores1?.cleanliness || 5) - (scores2?.cleanliness || 5));
  const cleanScore = Math.max(0, 100 - cleanDiff * 15);
  totalScore += (cleanScore * weights.cleanliness) / 100;
  breakdown.cleanliness = cleanScore;

  // Guest Preference
  const guestScore = user1.guestPreference === user2.guestPreference ? 100
    : (user1.guestPreference === 'flexible' || user2.guestPreference === 'flexible') ? 70 : 40;
  totalScore += (guestScore * weights.guestPreference) / 100;
  breakdown.guestPreference = guestScore;

  // Noise Preference
  const noiseScore = user1.noisePreference === user2.noisePreference ? 100
    : (user1.noisePreference === 'flexible' || user2.noisePreference === 'flexible') ? 70 : 30;
  totalScore += (noiseScore * weights.noisePreference) / 100;
  breakdown.noisePreference = noiseScore;

  return {
    score: Math.round(totalScore),
    explanation: generateExplanation(user1, user2, scores1, scores2),
    breakdown,
  };
};

// ── Personality Tags ───────────────────────────────────────────────────────

/**
 * Assign personality tags based on quiz scores
 */
const assignPersonalityTags = (scores) => {
  const tags = [];
  if (scores.sleep >= 7) tags.push('Night Owl');
  else if (scores.sleep <= 3) tags.push('Early Bird');
  if (scores.cleanliness >= 7) tags.push('Clean Planner');
  if (scores.social >= 7) tags.push('Social Explorer');
  else if (scores.social <= 3) tags.push('Homebody');
  if (scores.study >= 7) tags.push('Study Focused');
  if (scores.financial <= 3) tags.push('Budget Saver');
  if (scores.conflict >= 7) tags.push('Easy Going');
  if (scores.lifestyle >= 7) tags.push('Active Lifestyle');
  if (tags.length === 0) tags.push('Balanced');
  return tags;
};

module.exports = {
  checkHardFilters,
  calculateCompatibilityScore,
  generateExplanation,
  assignPersonalityTags,
};
