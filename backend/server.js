const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// ✅ THIS LINE IS MANDATORY
app.use(express.json());

app.use(cors());

connectDB();

// routes
app.use("/api/auth", require("./routes/authRoutes"));

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});