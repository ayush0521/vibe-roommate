const express = require('express');
const router = express.Router();
const { computeMatches, getMatches, getMatch } = require('./match.controller');
const { protect } = require('../../middleware/auth');

router.get('/', protect, getMatches);
router.post('/compute', protect, computeMatches);
router.get('/:matchId', protect, getMatch);

module.exports = router;
