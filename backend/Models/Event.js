const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    organizerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    date: {
        type: Date,
        required: true,
    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: "default-image.jpg",
    },
    ticketPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    totalTickets: {
        type: Number,
        required: true,
        min: 1,
    },
    remainingTickets: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        required: true,
        enum: ["approved", "pending", "declined"],
        default: "pending",
    },
    // Add these fields for OTP functionality
    otp: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;