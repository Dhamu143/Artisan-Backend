// jobRoutes.js - Improved and consolidated routing
const express = require("express");
const router = express.Router();

const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} = require("../controllers/jobController");

// Use router.route() to group methods for the same path (/)
router.route("/")
    .get(getAllJobs)    // Handles GET /api/jobs
    .post(createJob);   // Handles POST /api/jobs

// Use router.route() to group methods for the same path (/:id)
router.route("/:id")
    .get(getJobById)    // Handles GET /api/jobs/:id
    .put(updateJob)     // Handles PUT /api/jobs/:id
    .delete(deleteJob); // Handles DELETE /api/jobs/:id

module.exports = router;