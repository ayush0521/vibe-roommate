// services/matchService.js

// 🔥 CONFIG (weights)
const WEIGHTS = {
  cleanliness: 25,
  social: 20,
  budget: 15,
  habits: 20,
  lifestyle: 20,
};

// 🔹 Utility
const diffScore = (a, b, maxWeight) => {
  if (a === undefined || b === undefined) return 0;

  const diff = Math.abs(a - b);

  if (diff === 0) return maxWeight;
  if (diff === 1) return maxWeight * 0.75;
  if (diff === 2) return maxWeight * 0.4;
  return -maxWeight * 0.3; // penalty
};

// 🔹 Budget comparison
const budgetScore = (a, b) => {
  if (!a || !b) return 0;

  const diffPercent = Math.abs(a - b) / Math.max(a, b);

  if (diffPercent <= 0.1) return WEIGHTS.budget;
  if (diffPercent <= 0.3) return WEIGHTS.budget * 0.6;
  return -WEIGHTS.budget * 0.5; // strong penalty
};

// 🔹 Boolean habits
const habitScore = (a, b) => {
  if (a === undefined || b === undefined) return 0;
  return a === b ? 10 : -10;
};

// 🔹 String match
const stringScore = (a, b) => {
  if (!a || !b) return 0;
  return a === b ? 10 : -5;
};

// 🔥 Label
const getCompatibilityLabel = (score) => {
  if (score >= 75) return "🔥 Perfect Match";
  if (score >= 60) return "🔥 Highly Compatible";
  if (score >= 45) return "👍 Good Match";
  if (score >= 25) return "⚠️ Moderate Match";
  return "❌ Risky Match";
};

// 🔥 Match Type (improved)
const getMatchType = (userA, userB) => {
  if (
    userA.quiz?.cleanliness === userB.quiz?.cleanliness &&
    userA.quiz?.socialLevel === userB.quiz?.socialLevel
  ) return "Peaceful Living Match";

  if (
    Math.abs((userA.budget || 0) - (userB.budget || 0)) < 2000
  ) return "Budget Friendly Match";

  if (
    userA.quiz?.socialLevel >= 4 &&
    userB.quiz?.socialLevel >= 4
  ) return "High Energy Match";

  return "Balanced Lifestyle Match";
};

// 🔥 Badges
const getUserBadges = (user) => {
  const badges = [];

  if (user.quiz?.cleanliness >= 4) badges.push("🧼 Clean Freak");
  if (user.quiz?.socialLevel >= 4) badges.push("🎉 Social Butterfly");
  if (user.quiz?.studyStyle === "focused") badges.push("📚 Study Focused");
  if (user.budget && user.budget <= 8000) badges.push("💸 Budget Saver");

  if (badges.length === 0) badges.push("🙂 Easy Going");

  return badges;
};

// 🔥 MAIN ENGINE
const calculateMatchScore = (userA, userB) => {
  let score = 0;
  let positives = [];
  let negatives = [];

  // 🔹 Cleanliness
  const clean = diffScore(
    userA.quiz?.cleanliness,
    userB.quiz?.cleanliness,
    WEIGHTS.cleanliness
  );
  score += clean;
  clean > 0
    ? positives.push("Similar cleanliness habits")
    : negatives.push("Different cleanliness levels");

  // 🔹 Social
  const social = diffScore(
    userA.quiz?.socialLevel,
    userB.quiz?.socialLevel,
    WEIGHTS.social
  );
  score += social;
  social > 0
    ? positives.push("Compatible social lifestyle")
    : negatives.push("Different social energy");

  // 🔹 Budget
  const budget = budgetScore(userA.budget, userB.budget);
  score += budget;
  budget > 0
    ? positives.push("Budget alignment")
    : negatives.push("Budget mismatch");

  // 🔹 Habits
  const smoking = habitScore(userA.quiz?.smoking, userB.quiz?.smoking);
  const drinking = habitScore(userA.quiz?.drinking, userB.quiz?.drinking);
  score += smoking + drinking;

  if (smoking > 0 && drinking > 0) {
    positives.push("Same lifestyle habits");
  } else {
    negatives.push("Lifestyle habit differences");
  }

  // 🔹 Lifestyle
  const study = stringScore(userA.quiz?.studyStyle, userB.quiz?.studyStyle);
  const food = stringScore(userA.quiz?.foodType, userB.quiz?.foodType);
  score += study + food;

  if (study > 0 && food > 0) {
    positives.push("Same lifestyle preferences");
  } else {
    negatives.push("Different lifestyle choices");
  }

  // 🔥 Normalize score → percentage
  const maxScore = 100;
  const percentage = Math.max(0, Math.min(100, Math.round((score / maxScore) * 100)));

  // 🔥 Smart explanation
  const explanation = `You and ${userB.name} are a ${getCompatibilityLabel(
    percentage
  ).replace("🔥 ", "").replace("👍 ", "")} because of ${
    positives.slice(0, 2).join(", ").toLowerCase()
  }.`;

  return {
    score,
    percentage,
    label: getCompatibilityLabel(percentage),
    highlights: positives.slice(0, 3),
    concerns: negatives.slice(0, 2),
    explanation,
  };
};

module.exports = {
  calculateMatchScore,
  getUserBadges,
  getMatchType,
};