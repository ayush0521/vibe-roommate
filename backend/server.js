require("dotenv").config();

const express = require("express");
const cors = require("cors");

// 🔹 DB
const connectDB = require("./config/db");

// 🔹 Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const matchRoutes = require("./routes/matchRoutes");
const listingRoutes = require("./routes/listingRoutes");
const quizRoutes = require("./routes/quizRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();


// ========================
// 🔧 MIDDLEWARE
// ========================
app.use(cors());
app.use(express.json()); // ✅ only once

// ========================
// 🗄️ DATABASE CONNECTION
// ========================
connectDB();

// ========================
// 🧪 TEST ROUTE (debugging)
// ========================
app.get("/", (req, res) => {
  res.send("🚀 Vibe Roommate API is running...");
});

// ========================
// 🔗 API ROUTES
// ========================
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/message", messageRoutes);

// ========================
// ❌ ERROR HANDLER (IMPORTANT)
// ========================
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err.message);
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message,
  });
});

// ========================
// 🚀 SERVER START
// ========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("✅ All routes loaded");
});