const Meeting = require('./meeting.model');
const User = require('../users/user.model');
const Notification = require('../notifications/notification.model');
const asyncHandler = require('../../shared/utils/asyncHandler');
const { sendEmail, emailTemplates } = require('../../shared/utils/email');

const generateMeetLink = () => {
  const roomId = Math.random().toString(36).substring(2, 10);
  return `https://meet.google.com/${roomId}-viber-meet`;
};

// @desc    Mark self as ready for meet
// @route   POST /api/meetings/ready/:conversationId
// @access  Private
const markReady = asyncHandler(async (req, res) => {
  const user = await User.findOne({ authId: req.user._id });
  const { conversationId } = req.params;

  let meeting = await Meeting.findOne({ conversationId, status: { $in: ['pending', 'both-ready'] } });

  if (!meeting) {
    // Find other participant from conversation
    const Conversation = require('../messages/conversation.model');
    const conv = await Conversation.findById(conversationId);
    if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });

    meeting = await Meeting.create({
      participants: conv.participants,
      conversationId,
      readyStatus: { [user._id.toString()]: true },
      meetLink: generateMeetLink(),
    });
  } else {
    meeting.readyStatus.set(user._id.toString(), true);
    const allReady = meeting.participants.every((p) => meeting.readyStatus.get(p.toString()));
    if (allReady) {
      meeting.status = 'both-ready';
      // Notify both
      for (const participantId of meeting.participants) {
        await Notification.create({
          userId: participantId,
          type: 'meet_ready',
          title: 'Both Ready to Meet! 🎥',
          content: 'Both of you are ready. Start your Google Meet now!',
          metadata: { meetingId: meeting._id, conversationId },
          link: `/chat/${conversationId}`,
        });
      }
    }
    await meeting.save();
  }

  res.status(200).json({ success: true, data: meeting });
});

// @desc    Get meeting history
// @route   GET /api/meetings/history
// @access  Private
const getMeetHistory = asyncHandler(async (req, res) => {
  const user = await User.findOne({ authId: req.user._id });
  const meetings = await Meeting.find({ participants: user._id })
    .sort({ createdAt: -1 })
    .populate('participants', 'fullName profilePhoto college');
  res.status(200).json({ success: true, data: meetings });
});

// @desc    Get specific meeting
// @route   GET /api/meetings/:meetingId
// @access  Private
const getMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findById(req.params.meetingId)
    .populate('participants', 'fullName profilePhoto college');
  if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });
  res.status(200).json({ success: true, data: meeting });
});

// @desc    Safety check-in — notify trusted contact before a meetup
// @route   POST /api/meetings/safety-checkin
// @access  Private
const safetyCheckin = asyncHandler(async (req, res) => {
  const { meetingTime, meetingLocation, otherPersonName } = req.body;

  if (!meetingTime || !meetingLocation) {
    return res.status(400).json({ success: false, message: 'Meeting time and location are required' });
  }

  const user = await User.findOne({ authId: req.user._id });
  if (!user) return res.status(404).json({ success: false, message: 'Profile not found' });

  const tc = user.trustedContact;
  if (!tc?.email) {
    return res.status(400).json({
      success: false,
      message: 'No trusted contact email set. Add one in Settings → Safety → Trusted Contact.',
    });
  }

  try {
    await sendEmail({
      to: tc.email,
      subject: `Safety Alert: ${user.fullName || req.user.email} is meeting someone today`,
      html: emailTemplates.safetyCheckin({
        userName:        user.fullName || req.user.email,
        meetingTime:     new Date(meetingTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        meetingLocation,
        otherPersonName: otherPersonName || 'a matched roommate',
      }),
    });
  } catch (e) {
    console.error('Safety checkin email error:', e.message);
    return res.status(500).json({ success: false, message: 'Failed to send email. Check mail settings.' });
  }

  res.status(200).json({
    success: true,
    message: `Safety check-in sent to ${tc.name || tc.email}. Stay safe! 🛡️`,
  });
});

module.exports = { markReady, getMeetHistory, getMeeting, safetyCheckin };
