const FAQ = require("../models/faqModel");

// Create FAQ
const createFAQ = async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ issuccess: false, error: "Question and answer are required" });
    }

    const faq = await FAQ.create({ question, answer });

    res.status(201).json({
      issuccess: true,
      message: "FAQ created successfully",
      data: faq,
    });
  } catch (error) {
    console.error("Create FAQ error:", error);
    res.status(500).json({ issuccess: false, error: "Internal Server Error" });
  }
};

// Get all FAQs
const getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({ isActive: true }).sort({ createdAt: -1 });

    res.status(200).json({
      issuccess: true,
      data: faqs,
    });
  } catch (error) {
    console.error("Fetch FAQs error:", error);
    res.status(500).json({ issuccess: false, error: "Internal Server Error" });
  }
};

// Update FAQ
const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findByIdAndUpdate(id, req.body, { new: true });

    if (!faq) {
      return res.status(404).json({ issuccess: false, error: "FAQ not found" });
    }

    res.status(200).json({
      issuccess: true,
      message: "FAQ updated successfully",
      data: faq,
    });
  } catch (error) {
    console.error("Update FAQ error:", error);
    res.status(500).json({ issuccess: false, error: "Internal Server Error" });
  }
};

// Delete FAQ
const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findByIdAndDelete(id);

    if (!faq) {
      return res.status(404).json({ issuccess: false, error: "FAQ not found" });
    }

    res.status(200).json({
      issuccess: true,
      message: "FAQ deleted successfully",
    });
  } catch (error) {
    console.error("Delete FAQ error:", error);
    res.status(500).json({ issuccess: false, error: "Internal Server Error" });
  }
};

module.exports = {
  createFAQ,
  getAllFAQs,
  updateFAQ,
  deleteFAQ,
};
