const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // 🔐 Basic Auth Info
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

    // 🧍 Profile Attributes (for matching)
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

    smoking: {
      type: Boolean
    },

    drinking: {
      type: Boolean
    },

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

    // 🏷 Verification Badges (future-ready)
    badges: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);