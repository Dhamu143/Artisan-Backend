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

exports.getJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      Job.countDocuments(),
    ]);

    res.json({
      jobs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch jobs" });
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
exports.createBulkJobs = async (req, res) => {
  try {
    const jobs = req.body; // should be an array
    const saved = await Job.insertMany(jobs);
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
