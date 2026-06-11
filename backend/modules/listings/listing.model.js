const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ownerAuthId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auth',
    },
    type: {
      type: String,
      enum: ['pg', 'hostel', 'shared-room', 'flat'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', maxlength: 2000 },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    rent: { type: Number, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    approximateLocation: { type: String, default: '' },
    distanceFromCollege: { type: String, default: '' }, // e.g. "500m", "2km"
    occupancy: {
      type: String,
      enum: ['single', 'double', 'triple', 'dormitory'],
      default: 'single',
    },
    genderAllowed: {
      type: String,
      enum: ['male', 'female', 'any'],
      required: true,
    },
    facilities: [
      {
        type: String,
        enum: ['wifi', 'parking', 'laundry', 'mess', 'water', 'security', 'ac', 'gym', 'cctv', 'power-backup'],
      },
    ],
    contactNumber: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified'],
      default: 'unverified',
    },
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

listingSchema.index({ city: 1, area: 1, type: 1, genderAllowed: 1 });

module.exports = mongoose.model('Listing', listingSchema);
