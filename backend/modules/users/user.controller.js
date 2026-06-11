const User = require('./user.model');
const Auth = require('../auth/auth.model');
const asyncHandler = require('../../shared/utils/asyncHandler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../../middleware/upload');

// @desc    Get user profile by ID
// @route   GET /api/users/profile/:id
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const auth = await Auth.findById(user.authId).select('email role isPremium isEmailVerified');
  res.status(200).json({ success: true, data: { ...user.toObject(), auth } });
});

// @desc    Get own profile
// @route   GET /api/users/me
// @access  Private
const getOwnProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ authId: req.user._id });
  if (!user) return res.status(404).json({ success: false, message: 'Profile not found' });
  res.status(200).json({ success: true, data: user });
});

// @desc    Update profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ authId: req.user._id });
  if (!user) return res.status(404).json({ success: false, message: 'Profile not found' });

  const allowedFields = [
    'fullName', 'gender', 'college', 'course', 'year', 'city', 'district', 'state', 'area',
    'budgetRange', 'foodPreference', 'foodArrangement', 'smokingHabit',
    'drinkingHabit', 'sleepSchedule', 'guestPreference', 'noisePreference', 'bio',
    'trustedContact',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  });

  // Check if profile is complete
  const requiredFields = ['fullName','gender','college','city','budgetRange'];
  const isComplete = requiredFields.every((f) => {
    if (f === 'budgetRange') return user.budgetRange?.max > 0;
    return !!user[f];
  });
  user.isProfileComplete = isComplete;

  await user.save();
  res.status(200).json({ success: true, data: user });
});

// @desc    Upload profile photo
// @route   POST /api/users/profile/photo
// @access  Private
const uploadProfilePhoto = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  const user = await User.findOne({ authId: req.user._id });
  if (!user) return res.status(404).json({ success: false, message: 'Profile not found' });

  // Delete old photo if exists
  if (user.profilePhoto?.publicId) {
    await deleteFromCloudinary(user.profilePhoto.publicId).catch(() => {});
  }

  const result = await uploadToCloudinary(req.file.buffer, 'vibeRoommate/profiles', `profile_${user._id}`);
  user.profilePhoto = { url: result.secure_url, publicId: result.public_id };
  await user.save();

  res.status(200).json({ success: true, data: { url: result.secure_url } });
});

// @desc    Save/unsave a listing
// @route   PUT /api/users/saved-listings/:listingId
// @access  Private
const toggleSavedListing = asyncHandler(async (req, res) => {
  const user = await User.findOne({ authId: req.user._id });
  const idx = user.savedListings.indexOf(req.params.listingId);
  if (idx === -1) {
    user.savedListings.push(req.params.listingId);
  } else {
    user.savedListings.splice(idx, 1);
  }
  await user.save();
  res.status(200).json({ success: true, savedListings: user.savedListings });
});

// @desc    Search users by city/college
// @route   GET /api/users/search
// @access  Private
const searchUsers = asyncHandler(async (req, res) => {
  const { city, college, gender } = req.query;
  const query = { isProfileComplete: true };
  if (city) query.city = { $regex: city, $options: 'i' };
  if (college) query.college = { $regex: college, $options: 'i' };
  if (gender) query.gender = gender;

  const users = await User.find(query)
    .select('fullName profilePhoto college city personalityTags verificationStatus')
    .limit(20);
  res.status(200).json({ success: true, count: users.length, data: users });
});

// @desc    Delete own account
// @route   DELETE /api/users/me
// @access  Private
const deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findOne({ authId: req.user._id });
  if (!user) return res.status(404).json({ success: false, message: 'Profile not found' });

  // Delete profile photo from Cloudinary if exists
  if (user.profilePhoto?.publicId) {
    await deleteFromCloudinary(user.profilePhoto.publicId).catch(() => {});
  }

  // Delete User profile document
  await User.deleteOne({ _id: user._id });

  // Delete Auth (login) document
  await Auth.deleteOne({ _id: req.user._id });

  res.status(200).json({ success: true, message: 'Account deleted successfully' });
});

// @desc    Block a user
// @route   POST /api/users/block/:userId
// @access  Private
const blockUser = asyncHandler(async (req, res) => {
  const me = await User.findOne({ authId: req.user._id });
  if (!me) return res.status(404).json({ success: false, message: 'Profile not found' });

  const targetId = req.params.userId;
  if (targetId === me._id.toString()) {
    return res.status(400).json({ success: false, message: 'You cannot block yourself' });
  }

  if (!me.blockedUsers.map(String).includes(targetId)) {
    me.blockedUsers.push(targetId);
    await me.save();
  }

  res.status(200).json({ success: true, message: 'User blocked successfully' });
});

// @desc    Unblock a user
// @route   DELETE /api/users/block/:userId
// @access  Private
const unblockUser = asyncHandler(async (req, res) => {
  const me = await User.findOne({ authId: req.user._id });
  if (!me) return res.status(404).json({ success: false, message: 'Profile not found' });

  me.blockedUsers = me.blockedUsers.filter((id) => id.toString() !== req.params.userId);
  await me.save();

  res.status(200).json({ success: true, message: 'User unblocked successfully' });
});

// @desc    Enhance profile bio using Gemini AI
// @route   POST /api/users/enhance-bio
// @access  Private
const enhanceBio = asyncHandler(async (req, res) => {
  const { bio } = req.body;
  if (!bio || bio.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Bio content is required for enhancement' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key') {
    const mockPolished = fallbackEnhance(bio);
    return res.status(200).json({
      success: true,
      enhanced: true,
      data: mockPolished,
      message: 'Enhanced locally (mock fallback). Add GEMINI_API_KEY to your .env for real Gemini AI polishing!'
    });
  }

  try {
    const { request } = require('gaxios');
    const prompt = `Rewrite this roommate finder profile bio to sound polite, highly engaging, and friendly. Highlight their personality and habits clearly if mentioned. Keep it concise, natural, and under 250 characters. Do not use quotes or introductory text, output ONLY the polished bio. Bio: "${bio}"`;

    const response = await request({
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      data: {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      }
    });

    const enhancedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!enhancedText) {
      throw new Error('Invalid response layout from Gemini API');
    }

    res.status(200).json({
      success: true,
      enhanced: true,
      data: enhancedText.trim()
    });

  } catch (err) {
    console.warn('⚠️ Gemini API failed, falling back to local enhancement helper:', err.message);
    const mockPolished = fallbackEnhance(bio);
    res.status(200).json({
      success: true,
      enhanced: true,
      data: mockPolished,
      message: 'Fallback local enhancement triggered due to API error'
    });
  }
});

const fallbackEnhance = (bio) => {
  let clean = bio.trim();
  clean = clean.replace(/🏡✨$/, '');
  
  if (!clean.match(/^(Hi|Hello|Hey)/i)) {
    clean = "Hey there! " + clean;
  }
  if (!clean.endsWith('.') && !clean.endsWith('!') && !clean.endsWith(')')) {
    clean += '.';
  }
  clean = clean.replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());
  return clean + " Looking forward to finding a compatible roommate who shares similar vibes! 🏡✨";
};

module.exports = {
  getProfile,
  getOwnProfile,
  updateProfile,
  uploadProfilePhoto,
  toggleSavedListing,
  searchUsers,
  deleteAccount,
  blockUser,
  unblockUser,
  enhanceBio
};
