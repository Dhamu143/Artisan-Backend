const imagekit = require("../config/imagekit");
const path = require("path");

/**
 * Upload a file to ImageKit
 * @param {Object} file - The file object from Multer (req.file)
 * @param {string} folder - Target folder in ImageKit (e.g., 'users/avatars')
 * @param {boolean} isPrivate - If true, file is not publicly accessible via URL (good for docs)
 */
const uploadToImageKit = async (file, folder = "general", isPrivate = false) => {
  try {
    // Convert clean file name (remove spaces, special chars)
    const cleanFileName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;

    const response = await imagekit.upload({
      file: file.buffer, // Multer memory storage gives us this buffer
      fileName: cleanFileName,
      folder: folder,
      isPrivateFile: isPrivate, // Important for sensitive PDFs/Docs
      useUniqueFileName: true,  // Let ImageKit append a suffix if needed
      // Optional: Add tags for better searching later
      tags: [folder, file.mimetype.split("/")[1]], 
    });

    return response;
  } catch (error) {
    console.error("ImageKit Upload Error:", error);
    throw new Error("File upload failed. Please try again.");
  }
};

/**
 * Delete a file (Essential for a real-world CRUD app)
 */
const deleteFromImageKit = async (fileId) => {
  try {
    await imagekit.deleteFile(fileId);
    return true;
  } catch (error) {
    console.error("ImageKit Delete Error:", error);
    throw error;
  }
};

module.exports = { uploadToImageKit, deleteFromImageKit };