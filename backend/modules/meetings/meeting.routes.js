const express = require('express');
const router = express.Router();
const { markReady, getMeetHistory, getMeeting, safetyCheckin } = require('./meeting.controller');
const { protect } = require('../../middleware/auth');

router.get('/history',                protect, getMeetHistory);
router.post('/ready/:conversationId', protect, markReady);
router.post('/safety-checkin',        protect, safetyCheckin);
router.get('/:meetingId',             protect, getMeeting);

module.exports = router;
