const Listing = require('./listing.model');
const User = require('../users/user.model');
const asyncHandler = require('../../shared/utils/asyncHandler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../../middleware/upload');

// @desc    Browse listings with filters
// @route   GET /api/listings
// @access  Public
const getListings = asyncHandler(async (req, res) => {
  const { city, area, type, genderAllowed, minRent, maxRent, facilities, page = 1, limit = 12 } = req.query;
  const query = { isActive: true };

  if (city) query.city = { $regex: city, $options: 'i' };
  if (area) query.area = { $regex: area, $options: 'i' };
  if (type) query.type = type;
  if (genderAllowed && genderAllowed !== 'any') query.genderAllowed = { $in: [genderAllowed, 'any'] };
  if (minRent || maxRent) {
    query.rent = {};
    if (minRent) query.rent.$gte = parseInt(minRent);
    if (maxRent) query.rent.$lte = parseInt(maxRent);
  }
  if (facilities) {
    const fList = Array.isArray(facilities) ? facilities : facilities.split(',');
    query.facilities = { $all: fList };
  }

  const total = await Listing.countDocuments(query);
  const listings = await Listing.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('ownerId', 'fullName profilePhoto verificationStatus');

  const totalPages = Math.ceil(total / parseInt(limit));
  res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    totalPages,
    hasMore: parseInt(page) < totalPages,
    data: listings,
  });
});

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Public
const getListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate('ownerId', 'fullName profilePhoto verificationStatus college city');
  if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
  listing.views += 1;
  await listing.save({ validateBeforeSave: false });
  res.status(200).json({ success: true, data: listing });
});

// @desc    Create listing
// @route   POST /api/listings
// @access  Private (owner)
const createListing = asyncHandler(async (req, res) => {
  const user = await User.findOne({ authId: req.user._id });
  const listing = await Listing.create({ ...req.body, ownerId: user._id, ownerAuthId: req.user._id });
  res.status(201).json({ success: true, data: listing });
});

// @desc    Update listing
// @route   PUT /api/listings/:id
// @access  Private (owner)
const updateListing = asyncHandler(async (req, res) => {
  const user = await User.findOne({ authId: req.user._id });
  const listing = await Listing.findOne({ _id: req.params.id, ownerId: user._id });
  if (!listing) return res.status(404).json({ success: false, message: 'Listing not found or unauthorized' });

  Object.assign(listing, req.body);
  await listing.save();
  res.status(200).json({ success: true, data: listing });
});

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private (owner)
const deleteListing = asyncHandler(async (req, res) => {
  const user = await User.findOne({ authId: req.user._id });
  const listing = await Listing.findOne({ _id: req.params.id, ownerId: user._id });
  if (!listing) return res.status(404).json({ success: false, message: 'Listing not found or unauthorized' });
  await listing.deleteOne();
  res.status(200).json({ success: true, message: 'Listing deleted' });
});

// @desc    Upload listing images
// @route   POST /api/listings/:id/images
// @access  Private (owner)
const uploadListingImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }
  const user = await User.findOne({ authId: req.user._id });
  const listing = await Listing.findOne({ _id: req.params.id, ownerId: user._id });
  if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

  const uploaded = [];
  for (const file of req.files) {
    const result = await uploadToCloudinary(file.buffer, 'vibeRoommate/listings');
    uploaded.push({ url: result.secure_url, publicId: result.public_id });
  }

  listing.images.push(...uploaded);
  await listing.save();
  res.status(200).json({ success: true, images: listing.images });
});

// @desc    Get my listings
// @route   GET /api/listings/my
// @access  Private
const getMyListings = asyncHandler(async (req, res) => {
  const user = await User.findOne({ authId: req.user._id });
  const listings = await Listing.find({ ownerId: user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: listings });
});

module.exports = { getListings, getListing, createListing, updateListing, deleteListing, uploadListingImages, getMyListings };
