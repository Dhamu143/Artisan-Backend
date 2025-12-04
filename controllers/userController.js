const User = require("../models/userModel");

// restricted fields
const restrictedFields = [
  "_id",
  "mobile_number",
  "isVerified",
  "createdAt",
  "updatedAt",
  "__v",
  "otp",
];

// deep merge function
const deepMerge = (target, source) => {
  for (const key in source) {
    if (restrictedFields.includes(key)) continue;

    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
};

// ===========================
//   UPDATE USER BY ID
// ===========================
const updateUserById = async (req, res) => {
  const targetUserId = req.params.userId; // From URL
  const loggedInUserId = req.user?.userId; // From authMiddleware

  if (!targetUserId) {
    return res.status(400).json({ error: "User ID is required in URL." });
  } // --- 🔑 SCOPE CHECK: Only update your own data ---

  if (targetUserId !== loggedInUserId) {
    return res
      .status(403)
      .json({ error: "Forbidden: You can only update your own profile." });
  } // ------------------------------------------------
  const updates = req.body;

  try {
    const user = await User.findById(targetUserId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    deepMerge(user, updates);

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.otp;
    delete updatedUser.__v;

    return res.status(200).json({
      message: "User data updated successfully.",
      issuccess: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user data:", error);
    return res.status(500).json({
      error: "Internal server error while updating user data.",
    });
  }
};

// ===========================
//   GET LOGGED-IN USER PROFILE (ME) - UPDATED
// ===========================
const getMyProfile = async (req, res) => {
  const targetUserId = req.params.userId;
  const loggedInUserId = req.user?.userId;

  if (!targetUserId) {
    return res.status(400).json({ error: "User ID is required in URL path." });
  } // 2. Authorization Check: Check if the token is present/valid

  if (!loggedInUserId) {
    // This check usually happens in authMiddleware, but it's a good fail-safe
    return res
      .status(401)
      .json({ error: "Unauthorized: Token is missing or invalid." });
  } // 3. 🔑 SCOPE CHECK: Ensure the URL ID matches the token ID

  if (targetUserId !== loggedInUserId) {
    // If the user attempts to view another user's profile, deny access
    return res.status(404).json({
      error: "The requested user ID does not match the authenticated user ID.",
      issuccess: false,
    });
  }

  try {
    // Fetch user data based on the validated ID
    const user = await User.findById(targetUserId).select("-otp -__v");

    if (!user) {
      return res.status(404).json({ error: "User profile not found." });
    } // Extract the token from headers for response

    const token = req.headers.authorization?.split(" ")[1] || null;

    return res.status(200).json({
      message: "User data retrieved successfully.",
      user,
      token,
      issuccess: true,
    });
  } catch (error) {
    console.error("Error retrieving user:", error);
    return res.status(500).json({
      error: "Internal server error while retrieving user data.",
    });
  }
};
// ===========================
//   GET USER BY ID
// ===========================
const getUserById = async (req, res) => {
  const targetUserId = req.params.userId;
  const loggedInUserId = req.user?.userId || null;

  if (!targetUserId) {
    return res.status(400).json({ error: "User ID is required in URL." });
  }
  if (targetUserId !== loggedInUserId) {
    return res.status(403).json({
      error: "Forbidden: You are only authorized to view your own profile.",
      issuccess: false,
    });
  }

  try {
    // Fetch user data based on the validated ID
    const user = await User.findById(targetUserId).select("-otp -__v");

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    } // Extract the token from headers for response (optional, as the token is for authentication)

    const token = req.headers.authorization?.split(" ")[1] || null;

    return res.status(200).json({
      message: "User data retrieved successfully.",
      user,
      token, // returning the token received in request
      userId: loggedInUserId, // The ID extracted from the authenticated token
      issuccess: true,
    });
  } catch (error) {
    console.error("Error retrieving user:", error);
    return res.status(500).json({
      error: "Internal server error while retrieving user data.",
    });
  }
};

// ===========================
// DELETE USER BY ID (PUBLIC ADMIN DELETE)
// ===========================
const deleteUserById = async (req, res) => {
  const targetUserId = req.params.userId;

  try {
    const deleted = await User.findByIdAndDelete(targetUserId);

    if (!deleted) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(200).json({
      message: "User deleted successfully.",
      deletedUserId: targetUserId,
      issuccess: true,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      error: "Internal server error while deleting user.",
    });
  }
};

module.exports = { deleteUserById };

// ===========================
// GET ALL USERS
// ===========================
const getAllUsers = async (req, res) => {
  try {
    // Fetch all users, excluding sensitive fields
    const users = await User.find().select("-otp -__v -password");

    return res.status(200).json({
      message: "All user data retrieved successfully.",
      issuccess: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error retrieving all users:", error);
    return res.status(500).json({
      error: "Internal server error while retrieving all user data.",
    });
  }
};

module.exports = { getAllUsers };

module.exports = {
  updateUserById,
  getUserById,
  getMyProfile,
  deleteUserById,
  getAllUsers,
};
