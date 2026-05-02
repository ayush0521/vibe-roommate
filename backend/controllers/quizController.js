const User = require("../models/User");

exports.submitQuiz = async (req, res) => {
  try {
    const userId = req.user.id;

    // 🔍 Extract only required fields (avoid garbage data)
    const {
      cleanliness,
      socialLevel,
      studyStyle,
      foodType,
      sleepType,
      smoking,
      drinking,
    } = req.body;

    // ❌ Basic validation
    if (
      cleanliness === undefined ||
      socialLevel === undefined ||
      !studyStyle ||
      !foodType ||
      !sleepType ||
      smoking === undefined ||
      drinking === undefined
    ) {
      return res.status(400).json({
        message: "All quiz fields are required",
      });
    }

    // ✅ Construct clean quiz object
    const quiz = {
      cleanliness,
      socialLevel,
      studyStyle,
      foodType,
      sleepType,
      smoking,
      drinking,
    };

    // ✅ Save to DB
    const user = await User.findByIdAndUpdate(
      userId,
      { quiz },
      { new: true }
    );

    res.json({
      message: "Quiz saved successfully",
      quiz: user.quiz,
    });

  } catch (err) {
    console.error("Quiz Error:", err);
    res.status(500).json({
      message: "Error saving quiz",
    });
  }
};