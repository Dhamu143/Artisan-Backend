const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  trackProfileView,
  getProfileViewCount,
  getProfileViewers,
} = require("../controllers/profileController");

// Track view
router.post(
  "/profile-view/:profileUserId",
  authMiddleware,
  trackProfileView
);

// Get view count
router.get(
  "/profile-view/count/:profileUserId",
  getProfileViewCount
);

// Get viewers list
router.get(
  "/profile-view/viewers/:profileUserId",
  authMiddleware,
  getProfileViewers
);

module.exports = router;
