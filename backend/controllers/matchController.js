const {
  calculateMatchScore,
  getUserBadges,
  getMatchType
} = require("../services/matchService");

const User = require("../models/User");

exports.getMatches = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);

    // 🔴 User check
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔴 Quiz must exist
    if (!currentUser.quiz) {
      return res.status(400).json({
        message: "Please complete quiz first"
      });
    }

    // 🔴 Fetch all other users
    const users = await User.find({
      _id: { $ne: currentUserId }
    }).select("-password");

    // ✅ ONLY users with quiz
    const validUsers = users.filter(user => user.quiz);

    // 🔥 Build matches
    const matches = validUsers
      .map((user) => {
        const result = calculateMatchScore(currentUser, user);

        const explanation = `${user.name} is a ${
          result.label.replace("🔥 ", "").replace("👍 ", "")
        } because of ${result.highlights.join(", ").toLowerCase()}.`;

        return {
          id: user._id,
          name: user.name,

          compatibility: {
            score: result.score,
            percentage: result.percentage || 0,
            label: result.label,
            type: getMatchType(currentUser, user)
          },

          // ✅ FIXED (correct data source)
          traits: {
            cleanliness: user.quiz?.cleanliness,
            socialLevel: user.quiz?.socialLevel,
            budget: user.budget
          },

          badges: getUserBadges(user),

          highlights: result.highlights,
          concerns: result.concerns,

          explanation
        };
      })
      // 🔴 REMOVE useless / negative matches
      .filter(match => match.compatibility.score > 0);

    // ✅ Sort best → worst
    matches.sort((a, b) => b.compatibility.score - a.compatibility.score);

    // ✅ Top 3 only
    const topMatches = matches.slice(0, 3);

    // 🔍 DEBUG (keep for now)
    console.log("MATCH DEBUG:");
    console.log("Total users:", users.length);
    console.log("Valid users:", validUsers.length);
    console.log("Final matches:", topMatches);

    res.json({
      currentUser: currentUser.name,
      matches: topMatches
    });

  } catch (error) {
    console.error("Match Error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};