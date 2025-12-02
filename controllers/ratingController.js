const mongoose = require("mongoose");
const Rating = require("../models/ratingModel");
const User = require("../models/userModel");

// ---------------- Add Rating ----------------
const addRating = async (req, res) => {
  try {
    const { rated_by, rated_to, rating, review } = req.body;

    if (!rated_by || !rated_to || !rating) {
      return res.status(400).json({
        error: "rated_by, rated_to and rating are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(rated_by) ||
      !mongoose.Types.ObjectId.isValid(rated_to)
    ) {
      return res.status(400).json({ error: "Invalid User ID format" });
    }

    const fromUser = await User.findById(rated_by).lean();
    const toUser = await User.findById(rated_to).lean();

    if (!fromUser || !toUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // snapshot data
    const ratedByInfo = { ...fromUser };
    const ratedToInfo = { ...toUser };

    const newRating = await Rating.create({
      rated_by,
      rated_to,
      rated_by_info: ratedByInfo,
      rated_to_info: ratedToInfo,
      rating,
      review,
    });

    res.status(201).json({
      message: "Rating submitted successfully",
      rating: newRating,
    });
  } catch (error) {
    console.error("Error adding rating:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


const getRatingsForUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid User ID" });
    }

    const ratings = await Rating.find({ rated_to: userId });

    res.status(200).json({
      success: true,
      count: ratings.length,
      ratings
    });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



module.exports = {
  addRating,
  getRatingsForUser,
};
