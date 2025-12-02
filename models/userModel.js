// models/userModel.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    mobile_number: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true, 
    },
    isVerified: {
        type: Boolean,
        default: false,
    },

    otp: Object, 

    name: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
    },
    country: {
        type: String,
        trim: true,
    },
    city: {
        type: String,
        trim: true,
    },
    address: {
        type: String,
        trim: true,
    },
    pinCode: {
        type: String,
        trim: true,
    },

}, { 
    timestamps: true,
    strict: false 
});

const User = mongoose.model('User', userSchema);

module.exports = User;