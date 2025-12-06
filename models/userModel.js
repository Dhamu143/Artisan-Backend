const mongoose = require("mongoose");

const WorkingHoursSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },
    time: {
      type: String,
      default: "",
      trim: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false, 
  }
);

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

    token: { type: String },
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true }, 

    businessEmail: { type: String, trim: true, lowercase: true },
    businessName: { type: String, trim: true }, 

    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    postalCode: { type: String, trim: true }, 

    selectedCallingCode: { type: String, trim: true },
    selectedCountryName: { type: String, trim: true }, 

    teamSize: { type: String, trim: true },
    artisanImage: { type: String, trim: true },
    artisanBio: { type: String, trim: true },
    findArtisan: { type: Boolean },
    categoryId: { type: String },
    subCategoryId: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    resumeUrl: { type: String, trim: true },

    profileImage: { type: String, trim: true },

    workingHours: [WorkingHoursSchema],
    isAvailable: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    strict: true,
    minimize: false,
  }
);

module.exports = mongoose.model("User", userSchema);
