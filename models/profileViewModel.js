const mongoose = require("mongoose");

const profileViewSchema = new mongoose.Schema(
  {
    profileUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    viewerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// One viewer → one profile → one record
profileViewSchema.index(
  { profileUserId: 1, viewerUserId: 1 },
  { unique: true }
);

module.exports = mongoose.model("ProfileView", profileViewSchema);
