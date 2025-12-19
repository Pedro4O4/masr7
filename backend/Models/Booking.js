const mongoose = require("mongoose");
const bookingSchema = new mongoose.Schema({
    StandardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true,
    },
    numberOfTickets: {
        type: Number,
        required: true,
        min: 1,
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "canceled"],
        default: "pending",
    },

    // Seat-based booking fields (optional - for theater events)
    hasTheaterSeating: {
        type: Boolean,
        default: false
    },
    selectedSeats: [{
        row: { type: String, required: true },
        seatNumber: { type: Number, required: true },
        section: { type: String, enum: ['main', 'balcony'], default: 'main' },
        seatType: { type: String, enum: ['standard', 'vip', 'premium', 'wheelchair'], default: 'standard' },
        price: { type: Number, min: 0, required: true }
    }],
}, { timestamps: true }); // Automatically adds 'createdAt' and 'updatedAt' fields

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;