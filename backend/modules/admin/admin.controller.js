const Auth = require('../auth/auth.model');
const User = require('../users/user.model');
const Listing = require('../listings/listing.model');
const Report = require('../reports/report.model');
const asyncHandler = require('../../shared/utils/asyncHandler');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalListings = await Listing.countDocuments();
  const pendingReports = await Report.countDocuments({ status: 'pending' });
  const premiumUsers = await Auth.countDocuments({ isPremium: true });

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalListings,
      pendingReports,
      premiumUsers,
    },
  });
});

// @desc    Get users list (paginated, with search)
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const search = req.query.search || '';

  const query = {};
  if (search) {
    query.fullName = { $regex: search, $options: 'i' };
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('authId', 'email role isActive isPremium')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: users,
  });
});

// @desc    Toggle user active/inactive
// @route   PUT /api/admin/users/:id/toggle-active
// @access  Private (Admin)
const toggleActiveUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ success: false, message: 'User profile not found' });

  const auth = await Auth.findById(user.authId);
  if (!auth) return res.status(404).json({ success: false, message: 'Auth account not found' });

  auth.isActive = !auth.isActive;
  await auth.save();

  res.status(200).json({
    success: true,
    message: `User status changed to ${auth.isActive ? 'Active' : 'Inactive'}`,
    data: auth,
  });
});

// @desc    Toggle user premium status
// @route   PUT /api/admin/users/:id/make-premium
// @access  Private (Admin)
const makePremiumUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ success: false, message: 'User profile not found' });

  const auth = await Auth.findById(user.authId);
  if (!auth) return res.status(404).json({ success: false, message: 'Auth account not found' });

  auth.isPremium = !auth.isPremium;
  if (auth.isPremium) {
    auth.premiumActivatedAt = new Date();
    auth.premiumExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  } else {
    auth.premiumActivatedAt = null;
    auth.premiumExpiresAt = null;
  }
  await auth.save();

  res.status(200).json({
    success: true,
    message: `Premium status updated successfully`,
    data: auth,
  });
});

// @desc    Get list of reports
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getReports = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const status = req.query.status || 'pending';

  const total = await Report.countDocuments({ status });
  const reports = await Report.find({ status })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('reportedBy', 'fullName profilePhoto')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: reports,
  });
});

// @desc    Resolve a report
// @route   PUT /api/admin/reports/:id/resolve
// @access  Private (Admin)
const resolveReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  const report = await Report.findById(id);
  if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

  report.status = status || 'resolved';
  if (adminNotes) report.adminNotes = adminNotes;
  await report.save();

  res.status(200).json({
    success: true,
    message: `Report status updated to ${report.status}`,
    data: report,
  });
});

// @desc    Delete a listing by admin
// @route   DELETE /api/admin/listings/:id
// @access  Private (Admin)
const deleteListing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

  await listing.deleteOne();
  res.status(200).json({
    success: true,
    message: 'Listing successfully deleted by administrator',
  });
});

module.exports = {
  getStats,
  getUsers,
  toggleActiveUser,
  makePremiumUser,
  getReports,
  resolveReport,
  deleteListing,
};
