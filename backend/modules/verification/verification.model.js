const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    method: { type: String, enum: ['college-email', 'manual'], default: 'college-email' },
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    collegeEmail: { type: String, default: '' },
    token: { type: String, default: null },
    tokenExpiry: { type: Date, default: null },
    submittedAt: { type: Date, default: Date.now },
    verifiedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Verification', verificationSchema);
