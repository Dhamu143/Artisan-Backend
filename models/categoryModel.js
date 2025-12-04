// models/categoryModel.js
const mongoose = require("mongoose");

const ProfessionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true }, // e.g. "T001"
    display_name: { type: String, required: true },
    image_url: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const SubcategorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true }, // e.g. "SC001"
    Subcategory_Name: { type: String, required: true },
    Professions: [ProfessionSchema],
  },
  { _id: false }
);

const CategorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true }, // e.g. "CAT001"
    Category_Name: { type: String, required: true },
    image_url: { type: String },
    Subcategories: [SubcategorySchema],
    // optional: professions directly under category (no subcategory)
    Professions: [ProfessionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", CategorySchema);
