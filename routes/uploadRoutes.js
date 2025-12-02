const express = require("express");
const router = express.Router();
const { createUploader } = require("../middleware/fileUpload");
const { uploadToImageKit } = require("../services/storageService");

// 1. Setup specific uploaders for different routes
const uploadAvatar = createUploader("image", 2 * 1024 * 1024); // Max 2MB
const uploadDocument = createUploader("doc", 15 * 1024 * 1024); // Max 15MB

// ROUTE: Upload Profile Picture
router.post("/avatar", uploadAvatar.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Call Service
    const result = await uploadToImageKit(req.file, "users/avatars");

    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        url: result.url,         // Public URL
        thumbnail: result.thumbnailUrl, 
        fileId: result.fileId    // Save this to your DB!
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ROUTE: Upload User Resume (PDF/Doc)
router.post("/resume", uploadDocument.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Upload as Private file (secure)
    const result = await uploadToImageKit(req.file, "users/documents", true);

    res.status(200).json({
      success: true,
      message: "Document uploaded",
      data: {
        name: result.name,
        fileId: result.fileId // Private files might not have a public URL immediately usable
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error Handling for Multer (File too large, etc.)
router.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "File is too large." });
  }
  if (err.code === "INVALID_FILE_TYPE") {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;