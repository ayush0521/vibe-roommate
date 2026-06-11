const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    answers: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        category: String,
        value: Number, // 1-10
      },
    ],
    personalityTags: [String],
    hiddenScores: {
      cleanliness: { type: Number, default: 0 },
      study: { type: Number, default: 0 },
      social: { type: Number, default: 0 },
      sleep: { type: Number, default: 0 },
      financial: { type: Number, default: 0 },
      conflict: { type: Number, default: 0 },
    },
    completedAt: { type: Date, default: Date.now },
    retakeCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('QuizResult', quizResultSchema);
