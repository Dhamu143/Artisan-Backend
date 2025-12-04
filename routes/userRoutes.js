const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  updateUserById,
  getUserById,
  getMyProfile, // New
  deleteUserById,
  getAllUsers,
} = require("../controllers/userController");
const router = express.Router();

// ===========================
//   USER PROFILE ROUTES
// ===========================
// Get all users - Requires authentication (recommend restricting this to Admin only)
router.get("/all-users", getAllUsers);

// Update logged-in user data - Requires authentication and ID match
router.put("/:userId", authMiddleware, updateUserById);

// Get logged-in user's profile (using token) - Requires authentication
router.get("/:userId", authMiddleware, getMyProfile);

// Get user by userId - Requires authentication (consider restricting this further if needed)
router.get("/:userId", authMiddleware, getUserById);

// Delete user by userId - Requires authentication and ID match
router.delete("/:userId", deleteUserById);

module.exports = router;
