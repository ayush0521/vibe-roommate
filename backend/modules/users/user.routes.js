const express = require('express');
const router = express.Router();
const {
  getProfile, getOwnProfile, updateProfile, uploadProfilePhoto,
  toggleSavedListing, searchUsers, deleteAccount, blockUser, unblockUser,
  enhanceBio
} = require('./user.controller');
const { protect } = require('../../middleware/auth');
const { upload } = require('../../middleware/upload');

router.get('/me', protect, getOwnProfile);
router.delete('/me', protect, deleteAccount);
router.get('/search', protect, searchUsers);
router.get('/profile/:id', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/profile/photo', protect, upload.single('photo'), uploadProfilePhoto);
router.post('/profile/enhance-bio', protect, enhanceBio);
router.put('/saved-listings/:listingId', protect, toggleSavedListing);

// Block / Unblock
router.post('/block/:userId', protect, blockUser);
router.delete('/block/:userId', protect, unblockUser);

module.exports = router;
