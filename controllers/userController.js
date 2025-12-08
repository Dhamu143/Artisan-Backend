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
  const targetUserId = req.params.userId;
  const loggedInUserId = req.user?.userId;

  if (!targetUserId) {
    return res.status(400).json({ error: "User ID is required in URL." });
  }

  if (targetUserId !== loggedInUserId) {
    return res
      .status(403)
      .json({ error: "Forbidden: You can only update your own profile." });
  }
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

//   GET USER BY ID
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
    const user = await User.findById(targetUserId).select("-otp -__v");

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(200).json({
      message: "User data retrieved successfully.",
      user,
      userId: loggedInUserId,
      issuccess: true,
    });
  } catch (error) {
    console.error("Error retrieving user:", error);
    return res.status(500).json({
      error: "Internal server error while retrieving user data.",
    });
  }
};

// DELETE USER BY ID (PUBLIC ADMIN DELETE)
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
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();

    const users = await User.find()
      .select("-otp -__v -password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(totalUsers / limit);

    return res.status(200).json({
      message: "All user data retrieved successfully.",
      issuccess: true,
      users,
      totalUsers,
      totalPages,
      page,
    });
  } catch (error) {
    console.error("Error retrieving all users:", error);
    return res.status(500).json({
      error: "Internal server error while retrieving all user data.",
    });
  }
};

module.exports = { getAllUsers };

const getUserCount = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    return res.status(200).json({
      isSuccess: true,
      totalUsers,
    });
  } catch (error) {
    console.error("User count error:", error);
    return res.status(500).json({
      isSuccess: false,
      error: "Internal server error",
    });
  }
};

module.exports = {
  updateUserById,
  getUserById,
  deleteUserById,
  getUserCount,
  getAllUsers,
};
