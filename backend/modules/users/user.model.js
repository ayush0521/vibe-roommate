const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    authId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auth',
      required: true,
      unique: true,
    },
    profilePhoto: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    fullName: { type: String, trim: true, default: '' },
    gender: { type: String, enum: ['male', 'female', 'other'], default: null },
    college: { type: String, trim: true, default: '' },
    course: { type: String, trim: true, default: '' },
    year: { type: Number, min: 1, max: 6, default: null },
    city: { type: String, trim: true, default: '' },
    district: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    area: { type: String, trim: true, default: '' },
    budgetRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    foodPreference: {
      type: String,
      enum: ['veg', 'non-veg', 'eggetarian', 'jain'],
      default: null,
    },
    foodArrangement: {
      type: String,
      enum: ['mess', 'tiffin', 'self-cooking', 'online-ordering', 'mixed'],
      default: null,
    },
    smokingHabit: {
      type: String,
      enum: ['no', 'yes', 'occasionally', 'flexible'],
      default: null,
    },
    drinkingHabit: {
      type: String,
      enum: ['no', 'yes', 'occasionally', 'flexible'],
      default: null,
    },
    sleepSchedule: {
      type: String,
      enum: ['early-bird', 'night-owl', 'flexible'],
      default: null,
    },
    guestPreference: {
      type: String,
      enum: ['no-guests', 'occasional', 'frequent', 'flexible'],
      default: null,
    },
    noisePreference: {
      type: String,
      enum: ['quiet', 'moderate', 'loud-ok', 'flexible'],
      default: null,
    },
    bio: { type: String, maxlength: 500, default: '' },
    phoneNumber: { type: String, default: '' },

    // Personality from quiz
    personalityTags: [{ type: String }],
    compatibilityScores: {
      cleanliness: { type: Number, default: 0 },
      study: { type: Number, default: 0 },
      social: { type: Number, default: 0 },
      sleep: { type: Number, default: 0 },
      financial: { type: Number, default: 0 },
      conflict: { type: Number, default: 0 },
    },

    // Status
    isProfileComplete: { type: Boolean, default: false },
    hasCompletedQuiz: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
    },

    // Saved listings
    savedListings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],

    // Blocked users
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Safety check-in — trusted contact notified before meetups
    trustedContact: {
      name:  { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
