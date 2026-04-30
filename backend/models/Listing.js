const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: String,
  description: String,
  location: String,
  rent: Number,
  preferences: String,
}, { timestamps: true });

module.exports = mongoose.model("Listing", listingSchema);