// routes/authRoutes.js (UPDATED - ADDED resendOtp route)

const express = require('express');
const router = express.Router();
// IMPORTANT: Ensure the path and function names here match the exports in authController.js
const { generateOtp, verifyOtp, resendOtp } = require('../controllers/authController'); 

// Route 1: GENERATE OTP
// POST /api/v1/auth/generate-otp
router.post('/generate-otp', generateOtp);

// Route 2: VERIFY OTP
// POST /api/v1/auth/verify-otp
router.post('/verify-otp', verifyOtp);

// Route 3: RESEND OTP ⬅️ NEW ROUTE
// POST /api/v1/auth/resend-otp
router.post('/resend-otp', resendOtp);

module.exports = router;