const express = require("express");
const router = express.Router();
const { createUploader } = require("../middleware/fileUpload");
const { uploadToImageKit } = require("../services/storageService");

const uploadAvatar = createUploader("image", 20 * 1024 * 1024); 
const uploadDocument = createUploader("doc", 30 * 1024 * 1024);
router.post("/avatar", uploadAvatar.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Call Service
    const result = await uploadToImageKit(req.file, "users/avatars");

    res.status(200).json({
      issuccess: true,
      message: "Avatar uploaded successfully",
      data: {
        url: result.url,
        thumbnail: result.thumbnailUrl,
        fileId: result.fileId,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", uploadDocument.single("upload"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const result = await uploadToImageKit(req.file, "users/documents", true);

    res.status(200).json({
      issuccess: true,
      message: "Document uploaded",
      data: {
        url: result.url,
        name: result.name,
        fileId: result.fileId,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
