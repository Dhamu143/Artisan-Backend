const { generateSixDigitOTP } = require("../utils/otpGenerator");
const { sendSMSToMobile } = require("../utils/smsService");
const { saveOTP, verifyStoredOTP } = require("../utils/otpStore");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "SuperSecretKey";
const TOKEN_EXPIRE_TIME = "365d"; 

// Generate OTP
const generateOtp = async (req, res) => {
  const { mobile_number } = req.body;

  if (!mobile_number) {
    return res.status(400).json({
      success: false,
      error: "Mobile number is required.",
    });
  }

  const otp = generateSixDigitOTP();

  try {
    await User.findOneAndUpdate(
      { mobile_number },
      { $set: { isVerified: false } },
      { new: true, upsert: true }
    );

    saveOTP(mobile_number, otp);

    await sendSMSToMobile(mobile_number, otp);

    return res.status(200).json({
      issuccess: true,
      message: "OTP generated and sent.",
      otp,
      expiresIn: 60,
    });
  } catch (error) {
    console.error("OTP generation error:", error);
    return res.status(500).json({
      issuccess: false,
      error: "Internal server error.",
    });
  }
};

// Resend OTP
const resendOtp = async (req, res) => {
  const { mobile_number } = req.body;

  if (!mobile_number) {
    return res.status(400).json({ error: "Mobile number is required." });
  }

  const otp = generateSixDigitOTP();

  try {
    await User.findOneAndUpdate(
      { mobile_number },
      { $set: { isVerified: false } },
      { new: true, upsert: true }
    );

    saveOTP(mobile_number, otp);

    await sendSMSToMobile(mobile_number, otp);

    return res.status(200).json({
      issuccess: true,
      message: "OTP sent successfully.",
      otp,
      expiresIn: 60,
    });
  } catch (error) {
    console.error("OTP generation error:", error);
    return res.status(500).json({
      issuccess: false,
      error: "Internal server error.",
    });
  }
};

// Verify OTP
// Verify OTP
const verifyOtp = async (req, res) => {
  const { mobile_number, otp } = req.body;

  if (!mobile_number || !otp) {
    return res.status(400).json({
      error: "Mobile number and OTP are required.",
    });
  }

  try {
    const isOtpValid = await verifyStoredOTP(mobile_number, otp);

    if (!isOtpValid) {
      return res.status(401).json({ error: "Invalid or expired OTP." });
    } // Retrieve the user, selecting to hide sensitive fields for now

    const user = await User.findOne({ mobile_number });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    } // Mark verified

    user.isVerified = true;
    await user.save(); // Generate JWT

    const token = jwt.sign(
      {
        userId: user._id,
        mobile: user.mobile_number,
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRE_TIME }
    ); // Prepare user object for response, excluding sensitive/redundant fields

    const userResponse = user.toObject();
    delete userResponse.otp; // Ensure internal OTP field is never sent
    delete userResponse.__v; // Remove Mongoose version key

    return res.status(200).json({
      message: "OTP verified successfully. User logged in.",
      verified: true,
      issuccess: true,
      user: userResponse, // <--- ADDED ALL USER DATA HERE
      token,
      tokenExpiresIn: TOKEN_EXPIRE_TIME,
    });
  } catch (err) {
    console.error("OTP verification error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};
module.exports = {
  generateOtp,
  resendOtp,
  verifyOtp,
};
