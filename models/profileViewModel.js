const mongoose = require("mongoose");

const profileViewSchema = new mongoose.Schema(
  {
    profileUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    viewerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

// ✅ ONE VIEW PER PERSON
profileViewSchema.index(
  { profileUserId: 1, viewerUserId: 1 },
  { unique: true }
);

module.exports = mongoose.model("ProfileView", profileViewSchema);
