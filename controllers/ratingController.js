const mongoose = require("mongoose");
const Rating = require("../models/ratingModel");
const User = require("../models/userModel");

// ---------------- Add Rating ----------------
const addRating = async (req, res) => {
  try {
    const { rated_by, rated_to, rating, review } = req.body;
    console.log("rated_by", req.body);
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
    // const ratedByInfo = { ...fromUser };
    const ratedToInfo = { ...toUser };

    const newRating = await Rating.create({
      rated_by,
      rated_to,
      // rated_by_info: ratedByInfo,
      rated_to_info: ratedToInfo,
      rating,
      review,
    });

    res.status(201).json({
      message: "Rating submitted successfully",
      rating: newRating,
      issuccess: true,
    });
  } catch (error) {
    console.error("Error adding rating:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getRatingsForUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("data", req.params.userId);
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid User ID" });
    }

    const ratings = await Rating.find({ rated_to: userId });

    let averageRating = 0;
    const count = ratings.length;

    if (count > 0) {
      const sumOfRatings = ratings.reduce(
        (acc, rating) => acc + rating.rating,
        0
      );

      const rawAverage = sumOfRatings / count;
      averageRating = rawAverage;
    }
    await User.findByIdAndUpdate(userId, {
      averageRating: averageRating,
      totalRatings: count,
    });

    const populatedRatings = await Rating.find({ rated_to: userId }).populate(
      "rated_by"
    );

    res.status(200).json({
      issuccess: true,
      count: count,
      averageRating: averageRating,
      ratings: populatedRatings,
    });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ---------------- Delete Rating ----------------
const deleteRating = async (req, res) => {
  try {
    const { ratingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(ratingId)) {
      return res.status(400).json({ error: "Invalid Rating ID" });
    }

    const deletedRating = await Rating.findByIdAndDelete(ratingId);

    if (!deletedRating) {
      return res.status(404).json({
        error: "Rating not found",
        issuccess: false,
      });
    }

    const ratedTo = deletedRating.rated_to;

    // ✅ Recalculate after delete
    const remainingRatings = await Rating.find({ rated_to: ratedTo });

    let avg = 0;
    const total = remainingRatings.length;

    if (total > 0) {
      const sum = remainingRatings.reduce((acc, r) => acc + r.rating, 0);
      avg = Math.round(sum / total);
    }

    await User.findByIdAndUpdate(ratedTo, {
      averageRating: avg,
      totalRatings: total,
    });

    res.status(200).json({
      message: "Rating deleted successfully",
      issuccess: true,
      deletedRatingId: ratingId,
      newAverageRating: avg,
    });
  } catch (error) {
    console.error("Error deleting rating:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addRating,
  getRatingsForUser,
  deleteRating,
};
