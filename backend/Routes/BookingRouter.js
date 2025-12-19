const express = require("express");
const BookingController = require("../Controllers/BookingController");
const authorizationMiddleware = require('../Middleware/authorizationMiddleware')
const authenticationMiddleware = require("../Middleware/authenticationMiddleware");
const router = express.Router();

// Middleware to check if the user is authenticated
router.use(authenticationMiddleware);

// Route to create a new booking
router.post("/", authorizationMiddleware('Standard User'), BookingController.createBooking);

// Get current user's bookings
router.get("/", authorizationMiddleware('Standard User'), BookingController.getUserBookings);

// Get available seats for an event (for seat selection UI)
router.get("/event/:eventId/seats", BookingController.getAvailableSeats);

// Get single booking by ID
router.get("/:id", authorizationMiddleware('Standard User'), BookingController.getBooking);

// Delete booking
router.delete("/:id", authorizationMiddleware('Standard User'), BookingController.deleteBooking);

module.exports = router;