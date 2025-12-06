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

router
  .route("/")
  .get(getJobs) 
  .post(createJob); 

router
  .route("/:id")
  .get(getJobById)
  .put(updateJob) 
   .delete(deleteJob); 
router.post("/bulk", createBulkJobs);

module.exports = router;
