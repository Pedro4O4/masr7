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
        default: 0,
        min: 0,
    },
    totalTickets: {
        type: Number,
        default: 0,
        min: 0,
    },
    remainingTickets: {
        type: Number,
        default: 0,
        min: 0,
    },
    status: {
        type: String,
        required: true,
        enum: ["approved", "pending", "declined"],
        default: "pending",
    },

    // Theater integration (optional - for seat-based events)
    theater: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theater',
        default: null
    },
    hasTheaterSeating: {
        type: Boolean,
        default: false
    },

    // Pricing per seat type (used when hasTheaterSeating is true)
    seatPricing: [{
        seatType: {
            type: String,
            enum: ['standard', 'vip', 'premium', 'wheelchair']
        },
        price: {
            type: Number,
            min: 0,
            default: 0
        }
    }],

    // Track booked seats for this event
    bookedSeats: [{
        row: { type: String, required: true },
        seatNumber: { type: Number, required: true },
        section: { type: String, enum: ['main', 'balcony'], default: 'main' },
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
    }],

    // Event-specific seat configuration (overrides theater defaults)
    seatConfig: [{
        row: { type: String },
        seatNumber: { type: Number },
        seatType: {
            type: String,
            enum: ['standard', 'vip', 'premium', 'wheelchair'],
            default: 'standard'
        },
        section: { type: String, default: 'main' }
    }],

    // OTP functionality
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