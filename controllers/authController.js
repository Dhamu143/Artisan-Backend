// controllers/authController.js (UPDATED - OTP Cleanup)

const { generateSixDigitOTP } = require("../utils/otpGenerator");
const { sendSMSToMobile } = require("../utils/smsService");
const { saveOTP, verifyStoredOTP } = require("../utils/otpStore");
const User = require("../models/userModel");

const generateOtp = async (req, res) => {
  const { mobile_number } = req.body;
  if (!mobile_number) {
    return res.status(400).json({ error: "Mobile number is required." });
  }
  const otp = generateSixDigitOTP();

  try {
    const user = await User.findOneAndUpdate(
      { mobile_number },
      { $set: { isVerified: false } },
      { new: true, upsert: true, runValidators: true }
    );
    saveOTP(mobile_number, otp);

    console.log(`[Cache] Saved OTP for user ID: ${user._id}`);

    await sendSMSToMobile(mobile_number, otp);

    return res.status(200).json({
      message: "OTP generated successfully and sent to mobile number.",
      otp: otp,
    });
  } catch (error) {
    console.error("Error during OTP generation/DB operation:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

const resendOtp = async (req, res) => {
  const { mobile_number } = req.body;

  if (!mobile_number) {
    return res.status(400).json({ error: "Mobile number is required." });
  }

  const otp = generateSixDigitOTP();

  try {
    const user = await User.findOneAndUpdate(
      { mobile_number },
      { $set: { isVerified: false } },
      { new: true, upsert: true, runValidators: true }
    );

    saveOTP(mobile_number, otp);

    console.log(`[Cache] Resent OTP for user ID: ${user._id}`);

    // 4. Send the SMS
    await sendSMSToMobile(mobile_number, otp);

    return res.status(200).json({
      message: "New OTP generated and sent successfully.",
      otp: otp,
    });
  } catch (error) {
    console.error("Error during OTP resend:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

const verifyOtp = async (req, res) => {
  const { mobile_number, otp } = req.body;

  if (!mobile_number || !otp) {
    return res
      .status(400)
      .json({ error: "Mobile number and OTP are required." });
  }

  try {

    const isOtpValid = await verifyStoredOTP(mobile_number, otp);

    if (!isOtpValid) {
      return res.status(401).json({ error: "Invalid or expired OTP." });
    }

    const user = await User.findOne({ mobile_number });

    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found after verification." });
    }

    user.isVerified = true;

    user.otp = undefined;

    await user.save();

    return res.status(200).json({
      message: "Mobile number successfully verified.",
      verified: true,
      userId: user._id,
    });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = {
  generateOtp,
  verifyOtp,
  resendOtp
};
