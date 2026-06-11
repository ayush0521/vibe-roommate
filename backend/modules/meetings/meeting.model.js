const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    ],
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    meetLink: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'both-ready', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    readyStatus: {
      type: Map,
      of: Boolean,
      default: {},
    },
    scheduledAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    duration: { type: Number, default: 0 }, // in minutes
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Meeting', meetingSchema);
