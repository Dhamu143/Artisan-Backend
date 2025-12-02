// controllers/userController.js

const User = require("../models/userModel");

const addUserData = async (req, res) => {
  const { mobile_number, ...updateFields } = req.body;

  if (!mobile_number || !updateFields.name) {
    return res
      .status(400)
      .json({ error: "Mobile number and Name are required." });
  }

  const restrictedFields = [
    "isVerified",
    "createdAt",
    "updatedAt",
    "_id",
    "__v",
    "otp",
  ];

  try {
    const user = await User.findOne({ mobile_number });

    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found. Please register first." });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error:
          "Mobile number is not verified. Please complete OTP verification first.",
      });
    }

    for (const key in updateFields) {
      if (updateFields.hasOwnProperty(key) && !restrictedFields.includes(key)) {
        user[key] = updateFields[key];
      }
    }

    await user.save();
    const updatedUserResponse = user.toObject();
    delete updatedUserResponse.otp;
    delete updatedUserResponse.__v;

    return res.status(200).json({
      message: "User data updated successfully.",
      user: updatedUserResponse,
    });
  } catch (error) {
    console.error("Error adding user data:", error);
    return res
      .status(500)
      .json({ error: "Internal server error while updating user data." });
  }
};

const getUserData = async (req, res) => {
  const mobile_number = req.params.mobile_number;

  try {
    const user = await User.findOne({ mobile_number });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const userResponse = user.toObject();
    delete userResponse.otp;
    delete userResponse.__v;

    return res.status(200).json({
      message: "User data retrieved successfully.",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error retrieving user data:", error);
    return res
      .status(500)
      .json({ error: "Internal server error while retrieving user data." });
  }
};
const getAllUsers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const totalItems = await User.countDocuments();
    const totalPages = Math.ceil(totalItems / limit);

    const users = await User.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      users,
      pagination: {
        page,
        totalPages,
        totalItems,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
const deleteUser = async (req, res) => {
  const mobile_number = req.params.mobile_number;

  if (!mobile_number) {
    return res
      .status(400)
      .json({ error: "Mobile number is required for deletion." });
  }

  try {
    const result = await User.findOneAndDelete({ mobile_number });

    if (!result) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(200).json({
      message: `User with mobile number ${mobile_number} successfully deleted.`,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res
      .status(500)
      .json({ error: "Internal server error while deleting user data." });
  }
};

module.exports = {
  addUserData,
  getUserData,
  deleteUser,
  getAllUsers,
};
