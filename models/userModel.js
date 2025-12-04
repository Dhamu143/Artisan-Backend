const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    mobile_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    isVerified: { type: Boolean, default: false },
    otp: Object,

    // basic personal details
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },

    // business details
    businessEmail: { type: String, trim: true, lowercase: true },
    businessName: { type: String, trim: true },

    // contact + location
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    postalCode: { type: String, trim: true },

    // country details
    selectedCallingCode: { type: String, trim: true },
    selectedCountryName: { type: String, trim: true },

    // artisan info
    teamSize: { type: String, trim: true },

    // user type
    findArtisan: { type: Boolean },
    categoryId: { type: String },
    subcategoryId: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  {
    timestamps: true,
    strict: false,
    minimize: false,
  }
);

module.exports = mongoose.model("User", userSchema);
