const mongoose = require("mongoose");
require("./userModel"); // <-- IMPORTANT FIX

const ratingSchema = new mongoose.Schema(
  {
    rated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rated_to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating: Number,
    review: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rating", ratingSchema);
