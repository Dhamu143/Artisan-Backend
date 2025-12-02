const express = require("express");
const router = express.Router();
const {
  addRating,
  getRatingsForUser,
} = require("../controllers/ratingController");

router.post("/add", addRating);
router.get("/user/:userId", getRatingsForUser);

module.exports = router;
