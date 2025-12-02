// utils/smsService.js

const sendSMSToMobile = async (mobileNumber, otpCode) => {
    console.log(`[SMS Service] Simulating sending OTP ${otpCode} to ${mobileNumber}...`);

    await new Promise(resolve => setTimeout(resolve, 500)); 
    return true; 
};

module.exports = {
    sendSMSToMobile
};