const express = require('express');
const router = express.Router();
const { submitCollegeEmail, verifyToken, submitManual } = require('./verification.controller');
const { protect } = require('../../middleware/auth');

router.post('/college-email', protect, submitCollegeEmail);
router.get('/verify/:token', verifyToken);
router.post('/manual', protect, submitManual);

module.exports = router;
