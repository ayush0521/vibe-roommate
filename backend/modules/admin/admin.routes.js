const express = require('express');
const router = express.Router();
const {
  getStats,
  getUsers,
  toggleActiveUser,
  makePremiumUser,
  getReports,
  resolveReport,
  deleteListing,
} = require('./admin.controller');
const { protect, authorize } = require('../../middleware/auth');

// Apply protection and admin authorization to all sub-routes
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/toggle-active', toggleActiveUser);
router.put('/users/:id/make-premium', makePremiumUser);
router.get('/reports', getReports);
router.put('/reports/:id/resolve', resolveReport);
router.delete('/listings/:id', deleteListing);

module.exports = router;
