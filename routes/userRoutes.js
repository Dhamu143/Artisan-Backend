// routes/userRoutes.js

const express = require("express");
const router = express.Router();
const {
  registerUser,
  addUserData,
  getUserData,
  deleteUser,
  getAllUsers,
} = require("../controllers/userController");

router.post("/add-data", addUserData);

router.get("/get-data/:mobile_number", getUserData);

router.delete("/delete-user/:mobile_number", deleteUser);
// NEW: list ALL users
router.get("/all", getAllUsers);

module.exports = router;
