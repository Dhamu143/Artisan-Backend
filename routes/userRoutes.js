const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  updateUserById,
  getUserById,
  deleteUserById,
  getAllUsers,
  getUserCount,
} = require("../controllers/userController");
const router = express.Router();

router.get("/all-users", getAllUsers);

router.get("/count", getUserCount);

router.put("/:userId", authMiddleware, updateUserById);

router.get("/:userId", authMiddleware, getUserById);

router.delete("/:userId", deleteUserById);

module.exports = router;
