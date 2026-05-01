const User = require("../models/User");

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { cleanliness, socialLevel, budget } = req.body || {};

    // =========================
    // ✅ VALIDATIONS
    // =========================

    // Cleanliness
    if (cleanliness !== undefined) {
      if (typeof cleanliness !== "number") {
        return res.status(400).json({ message: "Cleanliness must be a number" });
      }
      if (cleanliness < 1 || cleanliness > 5) {
        return res.status(400).json({ message: "Cleanliness must be 1-5" });
      }
    }

    // Social Level
    if (socialLevel !== undefined) {
      if (typeof socialLevel !== "number") {
        return res.status(400).json({ message: "Social level must be a number" });
      }
      if (socialLevel < 1 || socialLevel > 5) {
        return res.status(400).json({ message: "Social level must be 1-5" });
      }
    }

    // Budget
    if (budget !== undefined) {
      if (typeof budget !== "number") {
        return res.status(400).json({ message: "Budget must be a number" });
      }
      if (budget < 0) {
        return res.status(400).json({ message: "Budget must be positive" });
      }
    }

    // =========================
    // ✅ ALLOWED FIELDS (SECURITY)
    // =========================

    const allowedFields = [
      "sleepTime",
      "wakeUpTime",
      "cleanliness",
      "socialLevel",
      "studyStyle",
      "smoking",
      "drinking",
      "budget",
      "foodType",
      "roomSharing"
    ];

    const updateData = {};

    Object.keys(req.body || {}).forEach((key) => {
      if (allowedFields.includes(key) && req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    });

    // Optional: handle empty update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided for update"
      });
    }

    // =========================
    // ✅ UPDATE USER
    // =========================

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      {
        returnDocument: "after", // ✅ updated (no warning)
        runValidators: true
      }
    ).select("-password");

    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};