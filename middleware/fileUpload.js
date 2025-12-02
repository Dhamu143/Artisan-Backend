const multer = require("multer");
const path = require("path");

// Standard limits (in bytes)
const MAX_SIZE_IMAGE = 5 * 1024 * 1024; // 5MB
const MAX_SIZE_DOC = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES = {
  image: [
    "image/jpeg", // Matches .jpeg and .jpg
    "image/png", // Matches .png
    "image/webp",
    "image/gif",
    "image/heic", // iPhone High Efficiency Image
    "image/heif", // iPhone High Efficiency Image Format
  ],
  pdf: ["application/pdf"],
  doc: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/pdf",
  ],
};
/**
 * Reusable Uploader Middleware Factory
 * @param {string} type - 'image' | 'pdf' | 'doc'
 * @param {number} maxSize - Max file size in bytes (optional)
 */
const createUploader = (type, maxSize) => {
  // 1. Setup Storage (Memory is best for serverless/cloud uploads to avoid disk I/O)
  const storage = multer.memoryStorage();

  // 2. Define Filter
  const fileFilter = (req, file, cb) => {
    const allowedMimes = ALLOWED_TYPES[type] || [];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      // Create a descriptive error
      const error = new Error(
        `Invalid file type. Allowed: ${allowedMimes.join(", ")}`
      );
      error.code = "INVALID_FILE_TYPE";
      cb(error, false);
    }
  };

  // 3. Define Limits
  const limits = {
    fileSize: maxSize || (type === "image" ? MAX_SIZE_IMAGE : MAX_SIZE_DOC),
  };

  // Return the configured multer instance
  return multer({ storage, fileFilter, limits });
};

module.exports = { createUploader };
