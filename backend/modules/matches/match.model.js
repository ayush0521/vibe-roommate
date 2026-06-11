const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    compatibilityScore: { type: Number, default: 0, min: 0, max: 100 },
    explanation: [
      {
        factor: String,
        status: { type: String, enum: ['match', 'mismatch', 'neutral'] },
        label: String,
      },
    ],
    hardFilterPassed: { type: Boolean, default: false },
    breakdown: {
      foodPreference: Number,
      foodArrangement: Number,
      sleepSchedule: Number,
      studyStyle: Number,
      socialLevel: Number,
      cleanliness: Number,
      guestPreference: Number,
      noisePreference: Number,
    },
    status: {
      type: String,
      enum: ['pending', 'viewed', 'connected', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Ensure unique pair (unordered)
matchSchema.index({ user1: 1, user2: 1 }, { unique: true });

module.exports = mongoose.model('Match', matchSchema);
