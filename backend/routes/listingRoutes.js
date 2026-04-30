const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing
} = require("../controllers/listingController");

// GET all listings
router.get("/", getAllListings);

// GET single listing
router.get("/:id", getListingById);

// CREATE listing
router.post("/create", authMiddleware, createListing);

// UPDATE listing
router.put("/:id", authMiddleware, updateListing);

// DELETE listing
router.delete("/:id", authMiddleware, deleteListing);

console.log("Listing routes loaded");

module.exports = router;