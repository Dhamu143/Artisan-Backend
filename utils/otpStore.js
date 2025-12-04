// In-memory OTP cache
const otpCache = new Map();
const OTP_EXPIRY_MS = 60000; // 60 seconds

// Save OTP
const saveOTP = (userId, mobileNumber, otp) => {
  const key = `${userId}_${mobileNumber}`;
  const expiryTime = Date.now() + OTP_EXPIRY_MS;

  otpCache.set(key, {
    otp: String(otp),
    expiry: expiryTime,
  });
};

// Verify OTP
const verifyStoredOTP = async (userId, mobileNumber, submittedOtp) => {
  const key = `${userId}_${mobileNumber}`;
  const stored = otpCache.get(key);

  if (!stored) return false;

  if (Date.now() > stored.expiry) {
    otpCache.delete(key);
    return false;
  }

  if (stored.otp === String(submittedOtp)) {
    otpCache.delete(key);
    return true;
  }

  return false;
};

module.exports = {
  saveOTP,
  verifyStoredOTP,
};
