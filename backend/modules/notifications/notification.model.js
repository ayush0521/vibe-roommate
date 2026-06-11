const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['new_match', 'new_message', 'meet_request', 'meet_ready', 'listing_update', 'verification', 'system'],
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    metadata: {
      matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
      conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
      listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
      meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' },
      fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    link: { type: String, default: '' }, // frontend route to navigate to
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
