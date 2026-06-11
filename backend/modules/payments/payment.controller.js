const asyncHandler = require('../../shared/utils/asyncHandler');
const Auth = require('../auth/auth.model');
const crypto = require('crypto');

/**
 * @desc    Create a Razorpay order for Premium subscription
 * @route   POST /api/payments/create-order
 * @access  Private
 *
 * NOTE: Razorpay SDK is loaded dynamically so the app doesn't crash
 * if RAZORPAY_KEY_ID is not set yet. Install with: npm install razorpay
 */
const createOrder = asyncHandler(async (req, res) => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({
      success: false,
      message: 'Payment gateway not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env',
    });
  }

  let Razorpay;
  try {
    Razorpay = require('razorpay');
  } catch {
    return res.status(503).json({
      success: false,
      message: 'Razorpay package not installed. Run: npm install razorpay in the backend directory',
    });
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const options = {
    amount: 29900, // ₹299 in paise (100 paise = ₹1)
    currency: 'INR',
    receipt: `vr_premium_${req.user._id}_${Date.now()}`,
    notes: {
      userId: req.user._id.toString(),
      plan: 'premium_monthly',
    },
  };

  const order = await razorpay.orders.create(options);

  res.status(200).json({
    success: true,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

/**
 * @desc    Verify Razorpay payment signature and activate Premium
 * @route   POST /api/payments/verify
 * @access  Private
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Payment details missing' });
  }

  // Verify HMAC signature (Razorpay's security mechanism)
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Payment verification failed — invalid signature' });
  }

  // Signature valid — activate Premium for 30 days
  const auth = await Auth.findById(req.user._id);
  auth.isPremium = true;
  auth.premiumExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  auth.premiumActivatedAt = new Date();
  await auth.save();

  res.status(200).json({
    success: true,
    message: '🎉 Premium activated successfully! You now have unlimited matches.',
    isPremium: true,
    expiresAt: auth.premiumExpiresAt,
  });
});

/**
 * @desc    Get payment status / subscription info
 * @route   GET /api/payments/status
 * @access  Private
 */
const getPaymentStatus = asyncHandler(async (req, res) => {
  const auth = await Auth.findById(req.user._id).select('isPremium premiumExpiresAt premiumActivatedAt');
  res.status(200).json({
    success: true,
    data: {
      isPremium: auth.isPremium,
      premiumExpiresAt: auth.premiumExpiresAt,
      premiumActivatedAt: auth.premiumActivatedAt,
    },
  });
});

module.exports = { createOrder, verifyPayment, getPaymentStatus };
