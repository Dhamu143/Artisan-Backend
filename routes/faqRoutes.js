const express = require("express");
const router = express.Router();

const {
  createFAQ,
  getAllFAQs,
  updateFAQ,
  deleteFAQ,
} = require("../controllers/faqController");

// CRUD Routes
router.post("/create", createFAQ);
router.get("/", getAllFAQs);
router.put("/update/:id", updateFAQ);
router.delete("/delete/:id", deleteFAQ);

module.exports = router;
