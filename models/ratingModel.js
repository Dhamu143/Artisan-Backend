const mongoose = require("mongoose");
require("../models/userModel");

const ratingSchema = new mongoose.Schema(
  {
    rated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rated_to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    rated_by_info: { type: Object },
    rated_to_info: { type: Object },

    rating: Number,
    review: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rating", ratingSchema);
