const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // 🔐 Auth
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    // 🧍 Profile (optional now, quiz will dominate)
    sleepTime: {
      type: String,
      enum: ["early", "late"]
    },

    wakeUpTime: {
      type: String,
      enum: ["early", "late"]
    },

    cleanliness: {
      type: Number,
      min: 1,
      max: 5
    },

    socialLevel: {
      type: Number,
      min: 1,
      max: 5
    },

    studyStyle: {
      type: String,
      enum: ["silent", "music", "group"]
    },

    smoking: Boolean,
    drinking: Boolean,

    budget: {
      type: Number,
      min: 0
    },

    foodType: {
      type: String,
      enum: ["veg", "non-veg", "both"]
    },

    roomSharing: {
      type: String,
      enum: ["single", "double", "triple"]
    },

    // 🏷 Badges
    badges: {
      type: [String],
      default: []
    },

    // 🧠 QUIZ (MAIN DRIVER NOW)
    quiz: {
      cleanliness: { type: Number, min: 1, max: 5 },
      socialLevel: { type: Number, min: 1, max: 5 },
      studyStyle: String,
      foodType: String,
      sleepType: String,
      smoking: Boolean,
      drinking: Boolean
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);