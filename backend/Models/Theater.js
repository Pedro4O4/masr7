const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    description: {
        type: String,
        trim: true,
        maxLength: 500
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Theater layout configuration
    layout: {
        stage: {
            position: {
                type: String,
                enum: ['top', 'bottom', 'left', 'right'],
                default: 'top'
            },
            width: { type: Number, default: 80, min: 20, max: 100 }, // percentage
            height: { type: Number, default: 15, min: 5, max: 40 }
        },
        mainFloor: {
            rows: { type: Number, required: true, min: 1, max: 50 },
            seatsPerRow: { type: Number, required: true, min: 1, max: 50 },
            aislePositions: [Number], // seat positions where aisles exist (gaps)
            rowLabels: [String] // custom row labels like A, B, C or 1, 2, 3
        },
        hasBalcony: { type: Boolean, default: false },
        balcony: {
            rows: { type: Number, default: 0, min: 0, max: 20 },
            seatsPerRow: { type: Number, default: 0, min: 0, max: 50 },
            aislePositions: [Number],
            rowLabels: [String]
        },
        // Persistent designer elements
        removedSeats: [String], // Array of seat keys "section-row-num"
        disabledSeats: [String], // Array of seat keys "section-row-num"
        hCorridors: { type: mongoose.Schema.Types.Mixed, default: {} }, // { "key": count }
        vCorridors: { type: mongoose.Schema.Types.Mixed, default: {} }, // { "key": count }
        labels: [{
            id: Number,
            text: String,
            icon: String,
            position: {
                x: Number,
                y: Number
            },
            width: Number,
            height: Number
        }]
    },

    // Individual seat configurations (for VIP, disabled seats, etc.)
    seatConfig: [{
        row: { type: String, required: true }, // e.g., "A", "B", "BALC-1"
        seatNumber: { type: Number, required: true },
        seatType: {
            type: String,
            enum: ['standard', 'vip', 'premium', 'wheelchair', 'disabled'],
            default: 'standard'
        },
        section: {
            type: String,
            enum: ['main', 'balcony'],
            default: 'main'
        },
        isActive: { type: Boolean, default: true } // can disable specific seats
    }],

    totalSeats: { type: Number, default: 0 },
    vipSeats: { type: Number, default: 0 },
    premiumSeats: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
    image: { type: String, default: null }

}, { timestamps: true });

// Pre-save middleware to calculate total seats
theaterSchema.pre('save', function (next) {
    const mainSeats = this.layout.mainFloor.rows * this.layout.mainFloor.seatsPerRow;
    const balconySeats = this.layout.hasBalcony
        ? (this.layout.balcony.rows * this.layout.balcony.seatsPerRow)
        : 0;

    // Subtract disabled seats
    const disabledCount = this.seatConfig.filter(s => !s.isActive || s.seatType === 'disabled').length;

    this.totalSeats = mainSeats + balconySeats - disabledCount;

    // Count VIP and Premium seats
    this.vipSeats = this.seatConfig.filter(s => s.seatType === 'vip' && s.isActive).length;
    this.premiumSeats = this.seatConfig.filter(s => s.seatType === 'premium' && s.isActive).length;

    next();
});

// Generate default row labels (A, B, C, ...)  
theaterSchema.methods.generateRowLabels = function (count, prefix = '') {
    const labels = [];
    for (let i = 0; i < count; i++) {
        if (i < 26) {
            labels.push(prefix + String.fromCharCode(65 + i)); // A-Z
        } else {
            labels.push(prefix + 'R' + (i + 1)); // R27, R28, etc.
        }
    }
    return labels;
};

// Get seat info method
theaterSchema.methods.getSeatInfo = function (row, seatNumber, section = 'main') {
    const seatConfig = this.seatConfig.find(
        s => s.row === row && s.seatNumber === seatNumber && s.section === section
    );

    return seatConfig || {
        row,
        seatNumber,
        section,
        seatType: 'standard',
        isActive: true
    };
};

// Virtual for formatted capacity
theaterSchema.virtual('formattedCapacity').get(function () {
    const parts = [`${this.totalSeats} total`];
    if (this.vipSeats > 0) parts.push(`${this.vipSeats} VIP`);
    if (this.premiumSeats > 0) parts.push(`${this.premiumSeats} Premium`);
    return parts.join(', ');
});

// Ensure virtuals are included in JSON
theaterSchema.set('toJSON', { virtuals: true });
theaterSchema.set('toObject', { virtuals: true });

const Theater = mongoose.model('Theater', theaterSchema);

module.exports = Theater;
