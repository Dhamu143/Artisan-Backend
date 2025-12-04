const express = require("express");
const router = express.Router();

const {
  // registerAdmin,
  loginAdmin,
  // getAdminProfile,
} = require("../controllers/adminController");

const { protect } = require("../middleware/adminMiddleware");

// router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
// router.get("/me", protect, getAdminProfile);

module.exports = router;
