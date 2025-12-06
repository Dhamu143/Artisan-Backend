const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  updateUserById,
  getUserById,
  getMyProfile,
  deleteUserById,
  getAllUsers,
} = require("../controllers/userController");
const router = express.Router();

router.get("/all-users", getAllUsers);

router.put("/:userId", authMiddleware, updateUserById);


router.get("/:userId", authMiddleware, getMyProfile);

router.get("/:userId", authMiddleware, getUserById);

router.delete("/:userId", deleteUserById);

module.exports = router;
