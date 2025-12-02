const Job = require("../models/jobModel");

// GET JOB BY ID
exports.getJobById = async (req, res) => {
  console.log("BODY RECEIVED:", req.body);
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.status(200).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// GET ALL JOBS
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE JOB
exports.createJob = async (req, res) => {
  try {
    const newJob = new Job(req.body);
    const saved = await newJob.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// UPDATE JOB
exports.updateJob = async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body);
    console.log("ID RECEIVED:", req.params.id);

    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) return res.status(404).json({ message: "Job not found" });

    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE JOB
exports.deleteJob = async (req, res) => {
  try {
    const deleted = await Job.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Job not found" });

    res.status(200).json({ message: "Job deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
