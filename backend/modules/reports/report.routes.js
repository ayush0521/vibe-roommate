const express = require('express');
const router = express.Router();
const { createReport } = require('./report.controller');
const { protect } = require('../../middleware/auth');

router.post('/', protect, createReport);

module.exports = router;
