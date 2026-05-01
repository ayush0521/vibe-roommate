const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");

const app = express();

// middleware
app.use(express.json());
app.use(cors());

app.use(express.json());

// DB
connectDB();

// routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/listings", require("./routes/listingRoutes")); // 🔥 THIS LINE
app.use("/api/user", userRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("User routes loaded");
});