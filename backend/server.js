require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { initializeSockets } = require('./sockets');
const { generalLimiter } = require('./middleware/rateLimiter');
const { loadBlocklistFromDB, startCacheCleanup } = require('./shared/utils/tokenBlocklist');

// Route imports
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const quizRoutes = require('./modules/quiz/quiz.routes');
const matchRoutes = require('./modules/matches/match.routes');
const messageRoutes = require('./modules/messages/message.routes');
const meetingRoutes = require('./modules/meetings/meeting.routes');
const listingRoutes = require('./modules/listings/listing.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');
const verificationRoutes = require('./modules/verification/verification.routes');
const reportRoutes = require('./modules/reports/report.routes');
const paymentRoutes = require('./modules/payments/payment.routes');
const adminRoutes = require('./modules/admin/admin.routes');

const app = express();
const server = http.createServer(app);

// ── Socket.IO ──────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ── Database ───────────────────────────────────────────────────────────────
const startServer = async () => {
  if (process.env.NODE_ENV === 'test') return;
  await connectDB();

  // Restore blocked tokens from DB so they survive restarts
  await loadBlocklistFromDB();

  // ── Auto-seed Empty Database (Development only) ──────────────────────────
  if (process.env.NODE_ENV === 'development') {
    try {
      const Listing = require('./modules/listings/listing.model');
      const Question = require('./modules/quiz/quiz.model');
      const listingCount = await Listing.countDocuments();
      const questionCount = await Question.countDocuments();

      if (listingCount === 0 || questionCount === 0) {
        console.log('🔄 Development mode: Empty database detected. Auto-seeding questions, listings, and demo profiles...');
        
        if (questionCount === 0) {
          const { seedQuestions } = require('./shared/seed/questions.seed');
          await seedQuestions(false);
        }
        
        if (listingCount === 0) {
          const { seedDatabase } = require('./shared/seed/users.seed');
          await seedDatabase(false);
        }
      }
    } catch (seedErr) {
      console.warn('⚠️ Auto-seeding failed:', seedErr.message);
    }
  }

  // Clean up expired tokens from in-memory cache every 31 minutes
  startCacheCleanup();

  // ── Daily Premium Expiry Cron ──────────────────────────────────────────────
  // Runs at midnight every day. Expires premium accounts whose time is up.
  const runPremiumExpiry = async () => {
    try {
      const Auth = require('./modules/auth/auth.model');
      const result = await Auth.updateMany(
        { isPremium: true, premiumExpiresAt: { $lte: new Date() } },
        { $set: { isPremium: false, premiumExpiresAt: null } }
      );
      if (result.modifiedCount > 0) {
        console.log(`👑 Premium expiry: ${result.modifiedCount} account(s) downgraded`);
      }
    } catch (err) {
      console.warn('⚠️  Premium expiry cron error:', err.message);
    }
  };

  // Run once on startup + every 24 hours
  await runPremiumExpiry();
  setInterval(runPremiumExpiry, 24 * 60 * 60 * 1000);
};

startServer();

// ── Security Middleware ────────────────────────────────────────────────────
// Helmet sets secure HTTP headers (X-Frame-Options, X-Content-Type-Options,
// Referrer-Policy, X-XSS-Protection, HSTS, etc.)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow Cloudinary images to load
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "'unsafe-inline'", 'accounts.google.com', 'checkout.razorpay.com'],
      styleSrc:    ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      fontSrc:     ["'self'", 'fonts.gstatic.com'],
      imgSrc:      ["'self'", 'data:', 'blob:', 'res.cloudinary.com', 'lh3.googleusercontent.com'],
      connectSrc:  ["'self'", 'ws:', 'wss:', process.env.FRONTEND_URL || 'http://localhost:5173'],
      frameSrc:    ["'none'"],
      objectSrc:   ["'none'"],
    },
  },
}));

// ── CORS ───────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // Required for httpOnly cookies to be sent cross-origin
}));

// ── Cookie Parser ──────────────────────────────────────────────────────────
app.use(cookieParser());

// ── Body Parsers ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Rate Limiting ──────────────────────────────────────────────────────────
app.use(generalLimiter);

// ── Health Check ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'VibeRoommate API is running 🚀',
    timestamp: new Date(),
    env: process.env.NODE_ENV,
  });
});

// ── Seeding (Dev Only) ─────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.get('/api/auth/seed', async (req, res, next) => {
    try {
      const { seedDatabase } = require('./shared/seed/users.seed');
      await seedDatabase(false);
      res.status(200).json({ success: true, message: 'Database seeded successfully! 🚀' });
    } catch (err) {
      next(err);
    }
  });
}

// ── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/quiz',          quizRoutes);
app.use('/api/matches',       matchRoutes);
app.use('/api/messages',      messageRoutes);
app.use('/api/meetings',      meetingRoutes);
app.use('/api/listings',      listingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/verification',  verificationRoutes);
app.use('/api/reports',       reportRoutes);
app.use('/api/payments',      paymentRoutes);
app.use('/api/admin',         adminRoutes);

// ── 404 Handler ────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Sockets ────────────────────────────────────────────────────────────────
initializeSockets(io);

// ── Start Server ───────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 VibeRoommate Server running on port ${PORT} [${process.env.NODE_ENV}]`);
    console.log(`🔐 Security: Helmet ✅ | httpOnly Cookies ✅ | Rate Limiting ✅ | Token Blocklist ✅ | Premium Cron ✅`);
  });
}

module.exports = { app, io };
