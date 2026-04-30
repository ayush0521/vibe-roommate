const Listing = require("../models/Listing");

// CREATE LISTING
exports.createListing = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);
    console.log("REQ USER:", req.user);

    const { title, description, location, rent, preferences } = req.body;

    if (!title || !description || !location || !rent) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "User not authenticated properly",
      });
    }

    const listing = new Listing({
      user: req.user.id,
      title,
      description,
      location,
      rent,
      preferences,
    });

    await listing.save();

    res.status(201).json({
      message: "Listing created successfully",
      listing,
    });
  } catch (error) {
    console.error("CREATE LISTING ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get Single Listing
exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      "user",
      "name email",
    );

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    res.status(200).json(listing);
  } catch (error) {
    console.error("GET SINGLE LISTING ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Listing (owner only)
exports.updateListing = async (req, res) => {
  try {
    const { title, description, location, rent, preferences } = req.body;

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // 🔒 ownership check
    if (listing.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // update fields (only if provided)
    if (title !== undefined) listing.title = title;
    if (description !== undefined) listing.description = description;
    if (location !== undefined) listing.location = location;
    if (rent !== undefined) listing.rent = rent;
    if (preferences !== undefined) listing.preferences = preferences;

    const updated = await listing.save();

    res.status(200).json({
      message: "Listing updated successfully",
      listing: updated,
    });
  } catch (error) {
    console.error("UPDATE LISTING ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET ALL LISTINGS (separate function!)
exports.getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find().populate("user", "name email");

    res.status(200).json(listings);
  } catch (error) {
    console.error("GET LISTINGS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete listings
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // ownership check
    if (listing.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await listing.deleteOne();

    await listing.deleteOne();

    res.status(200).json({
      message: "Listing deleted successfully",
      id: req.params.id,
    });
  } catch (error) {
    console.error("DELETE LISTING ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
