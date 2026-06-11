const express = require('express');
const router = express.Router();
const { getConversations, getMessages, startConversation, sendMessage, uploadChatFile } = require('./message.controller');
const { protect } = require('../../middleware/auth');
const { upload } = require('../../middleware/upload');

router.get('/conversations', protect, getConversations);
router.post('/conversations/start/:userId', protect, startConversation);
router.get('/conversations/:id', protect, getMessages);
router.post('/conversations/:id', protect, upload.single('image'), sendMessage);
router.post('/conversations/:id/upload', protect, upload.single('file'), uploadChatFile);

module.exports = router;

