// utils/otpStore.js

// --- MOCK DATABASE/CACHE STORAGE (In-Memory Map) ---
const otpCache = new Map();
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Saves the OTP and its expiry time to the cache/database.
 */
const saveOTP = (mobileNumber, otp) => {
    const expiryTime = Date.now() + OTP_EXPIRY_MS;
    otpCache.set(String(mobileNumber), { otp: String(otp), expiry: expiryTime }); 
    console.log(`[Cache] Saved OTP ${otp} for ${mobileNumber}.`);
};

/**
 * Checks if the submitted OTP matches the stored OTP and is not expired.
 */
const verifyStoredOTP = async (mobileNumber, submittedOtp) => {
    const storedData = otpCache.get(String(mobileNumber)); 

    if (!storedData) {
        return false;
    }

    if (Date.now() > storedData.expiry) {
        otpCache.delete(String(mobileNumber));
        return false; 
    }

    if (storedData.otp === String(submittedOtp)) { 
        otpCache.delete(String(mobileNumber));
        return true; 
    }

    return false; 
};

module.exports = {
    saveOTP,
    verifyStoredOTP
};