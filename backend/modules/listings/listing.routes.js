const express = require('express');
const router = express.Router();
const { getListings, getListing, createListing, updateListing, deleteListing, uploadListingImages, getMyListings } = require('./listing.controller');
const { protect, authorize } = require('../../middleware/auth');
const { upload } = require('../../middleware/upload');

router.get('/', getListings);
router.get('/my', protect, getMyListings);
router.get('/:id', getListing);
router.post('/', protect, createListing);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);
router.post('/:id/images', protect, upload.array('images', 8), uploadListingImages);

module.exports = router;
