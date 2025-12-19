const Bookingmodle = require('../Models/Booking');
const Event = require('../Models/Event');
const Theater = require('../Models/Theater');

const BookingController = {
    // Create booking - handles both regular and seat-based bookings
    createBooking: async (req, res) => {
        try {
            const { eventId, numberOfTickets, status, selectedSeats } = req.body;

            // Find the event
            const event = await Event.findById(eventId);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: "Event not found"
                });
            }

            let totalPrice = 0;
            let bookingData = {
                StandardId: req.user.userId,
                eventId,
                status: status || 'confirmed'
            };

            // Handle seat-based booking
            if (event.hasTheaterSeating && selectedSeats && selectedSeats.length > 0) {
                // Validate seats are available
                const unavailableSeats = [];
                for (const seat of selectedSeats) {
                    const isBooked = event.bookedSeats.some(
                        bs => bs.row === seat.row &&
                            bs.seatNumber === seat.seatNumber &&
                            bs.section === seat.section
                    );
                    if (isBooked) {
                        unavailableSeats.push(`${seat.row}${seat.seatNumber}`);
                    }
                }

                if (unavailableSeats.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: `Seats already booked: ${unavailableSeats.join(', ')}`,
                        unavailableSeats
                    });
                }

                // Get theater for seat type info
                const theater = await Theater.findById(event.theater);
                if (!theater) {
                    return res.status(404).json({
                        success: false,
                        message: "Theater not found for this event"
                    });
                }

                // Calculate price and prepare seat data
                const seatsWithPrices = selectedSeats.map(seat => {
                    // Get seat type from theater config
                    const seatConfig = theater.seatConfig.find(
                        s => s.row === seat.row &&
                            s.seatNumber === seat.seatNumber &&
                            s.section === seat.section
                    );
                    const seatType = seatConfig?.seatType || 'standard';

                    // Get price from event seat pricing
                    const pricing = event.seatPricing.find(p => p.seatType === seatType);
                    const price = pricing?.price || event.ticketPrice || 0;

                    return {
                        row: seat.row,
                        seatNumber: seat.seatNumber,
                        section: seat.section || 'main',
                        seatType,
                        price
                    };
                });

                totalPrice = seatsWithPrices.reduce((sum, seat) => sum + seat.price, 0);

                bookingData.hasTheaterSeating = true;
                bookingData.selectedSeats = seatsWithPrices;
                bookingData.numberOfTickets = selectedSeats.length;
                bookingData.totalPrice = totalPrice;

                // Create booking first
                const booking = new Bookingmodle(bookingData);
                await booking.save();

                // Mark seats as booked in the event (atomic update)
                const seatUpdates = seatsWithPrices.map(seat => ({
                    row: seat.row,
                    seatNumber: seat.seatNumber,
                    section: seat.section,
                    bookingId: booking._id
                }));

                await Event.findByIdAndUpdate(
                    eventId,
                    {
                        $push: { bookedSeats: { $each: seatUpdates } },
                        $inc: { remainingTickets: -selectedSeats.length }
                    },
                    { new: true }
                );

                return res.status(201).json({
                    success: true,
                    message: "Booking created successfully",
                    booking
                });

            } else {
                // Regular ticket-based booking (existing logic)
                if (!numberOfTickets || numberOfTickets < 1) {
                    return res.status(400).json({
                        success: false,
                        message: "Number of tickets is required"
                    });
                }

                // Check ticket availability
                if (event.remainingTickets < numberOfTickets) {
                    return res.status(400).json({
                        success: false,
                        message: "Not enough tickets available"
                    });
                }

                totalPrice = numberOfTickets * event.ticketPrice;

                // Reduce available tickets
                event.remainingTickets -= numberOfTickets;
                await Event.findByIdAndUpdate(
                    eventId,
                    { remainingTickets: event.remainingTickets },
                    { new: true }
                );

                bookingData.numberOfTickets = numberOfTickets;
                bookingData.totalPrice = totalPrice;
                bookingData.hasTheaterSeating = false;

                const booking = new Bookingmodle(bookingData);
                await booking.save();

                return res.status(201).json({
                    success: true,
                    message: "Booking created successfully",
                    booking
                });
            }
        } catch (error) {
            console.error("Error creating booking:", error);
            res.status(500).json({
                success: false,
                message: "Error creating booking",
                error: error.message
            });
        }
    },

    // Get single booking
    getBooking: async (req, res) => {
        try {
            const booking = await Bookingmodle.findById(req.params.id)
                .populate('eventId');

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found"
                });
            }
            res.status(200).json(booking);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error fetching booking",
                error: error.message
            });
        }
    },

    // Get all bookings for current user
    getUserBookings: async (req, res) => {
        try {
            const bookings = await Bookingmodle.find({ StandardId: req.user.userId })
                .populate('eventId')
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                count: bookings.length,
                data: bookings
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error fetching bookings",
                error: error.message
            });
        }
    },

    // Delete booking and release seats
    deleteBooking: async (req, res) => {
        try {
            const booking = await Bookingmodle.findById(req.params.id);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found"
                });
            }

            const event = await Event.findById(booking.eventId);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: "Event not found"
                });
            }

            // If seat-based booking, release the seats
            if (booking.hasTheaterSeating && booking.selectedSeats?.length > 0) {
                // Remove booked seats from event
                await Event.findByIdAndUpdate(
                    booking.eventId,
                    {
                        $pull: {
                            bookedSeats: { bookingId: booking._id }
                        },
                        $inc: { remainingTickets: booking.numberOfTickets }
                    }
                );
            } else {
                // Regular booking - just restore ticket count
                event.remainingTickets += booking.numberOfTickets;
                await event.save();
            }

            // Delete the booking
            await Bookingmodle.findByIdAndDelete(req.params.id);

            res.status(200).json({
                success: true,
                message: "Booking deleted successfully"
            });
        } catch (error) {
            console.error("Error deleting booking:", error);
            res.status(500).json({
                success: false,
                message: "Error deleting booking",
                error: error.message
            });
        }
    },

    // Get available seats for an event
    getAvailableSeats: async (req, res) => {
        try {
            const { eventId } = req.params;

            const event = await Event.findById(eventId)
                .populate('theater');

            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: "Event not found"
                });
            }

            if (!event.hasTheaterSeating || !event.theater) {
                return res.status(400).json({
                    success: false,
                    message: "This event does not have theater seating"
                });
            }

            const theater = event.theater;

            // Create booked seats map for quick lookup
            const bookedSeatsSet = new Set(
                event.bookedSeats.map(s => `${s.section}-${s.row}-${s.seatNumber}`)
            );

            // Merge seatConfig: event.seatConfig takes priority over theater.seatConfig
            const mergedSeatConfig = [...(theater.seatConfig || [])];
            if (event.seatConfig && event.seatConfig.length > 0) {
                // Event seatConfig overrides theater seatConfig for matching seats
                event.seatConfig.forEach(eventSeat => {
                    const existingIdx = mergedSeatConfig.findIndex(
                        ts => ts.row === eventSeat.row &&
                            ts.seatNumber === eventSeat.seatNumber &&
                            ts.section === eventSeat.section
                    );
                    if (existingIdx >= 0) {
                        mergedSeatConfig[existingIdx] = eventSeat;
                    } else {
                        mergedSeatConfig.push(eventSeat);
                    }
                });
            }

            // Generate all seats with availability status
            const allSeats = [];
            const removedSeatsSet = new Set(theater.layout.removedSeats || []);
            const disabledSeatsSet = new Set(theater.layout.disabledSeats || []);

            // Main floor seats
            const mainRowLabels = theater.layout.mainFloor.rowLabels ||
                generateRowLabels(theater.layout.mainFloor.rows);

            for (let r = 0; r < theater.layout.mainFloor.rows; r++) {
                const rowLabel = mainRowLabels[r] || String.fromCharCode(65 + r);
                for (let s = 1; s <= theater.layout.mainFloor.seatsPerRow; s++) {
                    // Check if this is an aisle position
                    if (theater.layout.mainFloor.aislePositions?.includes(s)) {
                        continue; // Skip aisle positions
                    }

                    const seatKey = `main-${rowLabel}-${s}`;

                    // Skip removed seats
                    if (removedSeatsSet.has(seatKey)) {
                        continue;
                    }

                    const seatConfig = mergedSeatConfig.find(
                        sc => sc.row === rowLabel && sc.seatNumber === s && sc.section === 'main'
                    );

                    // Seat is inactive if in disabledSeats array OR seatConfig.isActive is false
                    const isDisabled = disabledSeatsSet.has(seatKey);
                    const isActive = !isDisabled && seatConfig?.isActive !== false;

                    allSeats.push({
                        row: rowLabel,
                        seatNumber: s,
                        section: 'main',
                        seatType: seatConfig?.seatType || 'standard',
                        isActive: isActive,
                        isBooked: bookedSeatsSet.has(seatKey),
                        price: event.seatPricing.find(p => p.seatType === (seatConfig?.seatType || 'standard'))?.price || event.ticketPrice
                    });
                }
            }

            // Balcony seats
            if (theater.layout.hasBalcony && theater.layout.balcony.rows > 0) {
                const balcRowLabels = theater.layout.balcony.rowLabels ||
                    generateRowLabels(theater.layout.balcony.rows, 'BALC-');

                for (let r = 0; r < theater.layout.balcony.rows; r++) {
                    const rowLabel = balcRowLabels[r] || `BALC-${String.fromCharCode(65 + r)}`;
                    for (let s = 1; s <= theater.layout.balcony.seatsPerRow; s++) {
                        if (theater.layout.balcony.aislePositions?.includes(s)) {
                            continue;
                        }

                        const seatKey = `balcony-${rowLabel}-${s}`;

                        // Skip removed seats
                        if (removedSeatsSet.has(seatKey)) {
                            continue;
                        }

                        const seatConfig = mergedSeatConfig.find(
                            sc => sc.row === rowLabel && sc.seatNumber === s && sc.section === 'balcony'
                        );

                        // Seat is inactive if in disabledSeats array OR seatConfig.isActive is false
                        const isDisabled = disabledSeatsSet.has(seatKey);
                        const isActive = !isDisabled && seatConfig?.isActive !== false;

                        allSeats.push({
                            row: rowLabel,
                            seatNumber: s,
                            section: 'balcony',
                            seatType: seatConfig?.seatType || 'standard',
                            isActive: isActive,
                            isBooked: bookedSeatsSet.has(seatKey),
                            price: event.seatPricing.find(p => p.seatType === (seatConfig?.seatType || 'standard'))?.price || event.ticketPrice
                        });
                    }
                }
            }

            res.status(200).json({
                success: true,
                data: {
                    theater: {
                        _id: theater._id,
                        name: theater.name,
                        layout: theater.layout,
                        seatConfig: theater.seatConfig,
                        totalSeats: theater.totalSeats
                    },
                    seatPricing: event.seatPricing,
                    seats: allSeats,
                    bookedCount: event.bookedSeats.length,
                    availableCount: allSeats.filter(s => !s.isBooked && s.isActive).length
                }
            });
        } catch (error) {
            console.error("Error fetching available seats:", error);
            res.status(500).json({
                success: false,
                message: "Error fetching seat availability",
                error: error.message
            });
        }
    }
};

// Helper function
function generateRowLabels(count, prefix = '') {
    const labels = [];
    for (let i = 0; i < count; i++) {
        if (i < 26) {
            labels.push(prefix + String.fromCharCode(65 + i));
        } else {
            labels.push(prefix + 'R' + (i + 1));
        }
    }
    return labels;
}

module.exports = BookingController;