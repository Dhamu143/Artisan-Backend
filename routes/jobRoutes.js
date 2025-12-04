// jobRoutes.js - Improved and consolidated routing
const express = require("express");
const router = express.Router();

const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  createBulkJobs,
} = require("../controllers/jobController");

// Use router.route() to group methods for the same path (/)
router
  .route("/")
  .get(getJobs) 
  .post(createJob); 

// Use router.route() to group methods for the same path (/:id)
router
  .route("/:id")
  .get(getJobById)
  .put(updateJob) 
   .delete(deleteJob); 
router.post("/bulk", createBulkJobs);

module.exports = router;
