const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    category: {
      type: String,
      enum: ['cleanliness', 'lifestyle', 'study', 'social', 'food', 'conflict', 'sleep', 'financial'],
      required: true,
    },
    type: { type: String, enum: ['slider', 'mcq', 'behavioural'], required: true },
    options: [
      {
        text: String,
        value: Number, // 1-10 scale for scoring
      },
    ],
    sliderMin: { type: Number, default: 1 },
    sliderMax: { type: Number, default: 10 },
    sliderLabels: {
      min: String,
      max: String,
    },
    weightage: { type: Number, default: 1 }, // multiplier for scoring
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
