const Theater = require('../Models/Theater');

const TheaterController = {
    // Create a new theater
    createTheater: async (req, res) => {
        try {
            const { name, description, layout, seatConfig, image } = req.body;

            // Validate required fields
            if (!name || !layout?.mainFloor?.rows || !layout?.mainFloor?.seatsPerRow) {
                return res.status(400).json({
                    success: false,
                    message: "Name, rows, and seatsPerRow are required"
                });
            }

            // Generate default row labels if not provided
            const mainRowLabels = layout.mainFloor.rowLabels ||
                generateRowLabels(layout.mainFloor.rows, '');

            const balconyRowLabels = layout.hasBalcony && layout.balcony?.rows
                ? (layout.balcony.rowLabels || generateRowLabels(layout.balcony.rows, 'BALC-'))
                : [];

            const theater = new Theater({
                name,
                description,
                createdBy: req.user.userId,
                layout: {
                    stage: layout.stage || { position: 'top', width: 80, height: 15 },
                    mainFloor: {
                        rows: layout.mainFloor.rows,
                        seatsPerRow: layout.mainFloor.seatsPerRow,
                        aislePositions: layout.mainFloor.aislePositions || [],
                        rowLabels: mainRowLabels
                    },
                    hasBalcony: layout.hasBalcony || false,
                    balcony: layout.hasBalcony ? {
                        rows: layout.balcony?.rows || 0,
                        seatsPerRow: layout.balcony?.seatsPerRow || 0,
                        aislePositions: layout.balcony?.aislePositions || [],
                        rowLabels: balconyRowLabels
                    } : { rows: 0, seatsPerRow: 0, aislePositions: [], rowLabels: [] },
                    // Persistent designer elements
                    removedSeats: layout.removedSeats || [],
                    disabledSeats: layout.disabledSeats || [],
                    hCorridors: layout.hCorridors || {},
                    vCorridors: layout.vCorridors || {},
                    labels: layout.labels || []
                },
                seatConfig: seatConfig || [],
                image
            });

            await theater.save();

            res.status(201).json({
                success: true,
                message: "Theater created successfully",
                data: theater
            });
        } catch (error) {
            console.error("Error creating theater:", error);
            res.status(500).json({
                success: false,
                message: "Error creating theater",
                error: error.message
            });
        }
    },

    // Get all theaters
    getAllTheaters: async (req, res) => {
        try {
            const { active } = req.query;
            const filter = {};

            if (active === 'true') {
                filter.isActive = true;
            }

            const theaters = await Theater.find(filter)
                .populate('createdBy', 'name email')
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                count: theaters.length,
                data: theaters
            });
        } catch (error) {
            console.error("Error fetching theaters:", error);
            res.status(500).json({
                success: false,
                message: "Error fetching theaters",
                error: error.message
            });
        }
    },

    // Get single theater by ID
    getTheaterById: async (req, res) => {
        try {
            const theater = await Theater.findById(req.params.id)
                .populate('createdBy', 'name email');

            if (!theater) {
                return res.status(404).json({
                    success: false,
                    message: "Theater not found"
                });
            }

            res.status(200).json({
                success: true,
                data: theater
            });
        } catch (error) {
            console.error("Error fetching theater:", error);
            res.status(500).json({
                success: false,
                message: "Error fetching theater",
                error: error.message
            });
        }
    },

    // Update theater
    updateTheater: async (req, res) => {
        try {
            const { name, description, layout, seatConfig, isActive, image } = req.body;

            const theater = await Theater.findById(req.params.id);

            if (!theater) {
                return res.status(404).json({
                    success: false,
                    message: "Theater not found"
                });
            }

            // Update fields
            if (name) theater.name = name;
            if (description !== undefined) theater.description = description;
            if (isActive !== undefined) theater.isActive = isActive;
            if (image !== undefined) theater.image = image;

            // Update layout if provided
            if (layout) {
                if (layout.stage) {
                    theater.layout.stage = { ...theater.layout.stage, ...layout.stage };
                }
                if (layout.mainFloor) {
                    theater.layout.mainFloor = {
                        ...theater.layout.mainFloor,
                        ...layout.mainFloor,
                        rowLabels: layout.mainFloor.rowLabels ||
                            generateRowLabels(layout.mainFloor.rows || theater.layout.mainFloor.rows, '')
                    };
                }
                if (layout.hasBalcony !== undefined) {
                    theater.layout.hasBalcony = layout.hasBalcony;
                }
                if (layout.balcony) {
                    theater.layout.balcony = {
                        ...theater.layout.balcony,
                        ...layout.balcony,
                        rowLabels: layout.balcony.rowLabels ||
                            generateRowLabels(layout.balcony.rows || theater.layout.balcony.rows, 'BALC-')
                    };
                }

                // Update designer elements
                if (layout.removedSeats !== undefined) theater.layout.removedSeats = layout.removedSeats;
                if (layout.disabledSeats !== undefined) theater.layout.disabledSeats = layout.disabledSeats;
                if (layout.hCorridors !== undefined) theater.layout.hCorridors = layout.hCorridors;
                if (layout.vCorridors !== undefined) theater.layout.vCorridors = layout.vCorridors;
                if (layout.labels !== undefined) theater.layout.labels = layout.labels;

                // Mark layout as modified for Mixed types
                theater.markModified('layout.hCorridors');
                theater.markModified('layout.vCorridors');
            }

            // Update seat config if provided
            if (seatConfig) {
                theater.seatConfig = seatConfig;
            }

            await theater.save();

            res.status(200).json({
                success: true,
                message: "Theater updated successfully",
                data: theater
            });
        } catch (error) {
            console.error("Error updating theater:", error);
            res.status(500).json({
                success: false,
                message: "Error updating theater",
                error: error.message
            });
        }
    },

    // Delete theater (soft delete)
    deleteTheater: async (req, res) => {
        try {
            const theater = await Theater.findById(req.params.id);

            if (!theater) {
                return res.status(404).json({
                    success: false,
                    message: "Theater not found"
                });
            }

            // Soft delete - just mark as inactive
            theater.isActive = false;
            await theater.save();

            res.status(200).json({
                success: true,
                message: "Theater deleted successfully"
            });
        } catch (error) {
            console.error("Error deleting theater:", error);
            res.status(500).json({
                success: false,
                message: "Error deleting theater",
                error: error.message
            });
        }
    },

    // Update seat configuration (bulk update for marking VIP seats, etc.)
    updateSeatConfig: async (req, res) => {
        try {
            const { seatConfig } = req.body;

            if (!seatConfig || !Array.isArray(seatConfig)) {
                return res.status(400).json({
                    success: false,
                    message: "seatConfig array is required"
                });
            }

            const theater = await Theater.findById(req.params.id);

            if (!theater) {
                return res.status(404).json({
                    success: false,
                    message: "Theater not found"
                });
            }

            // Merge or replace seat configs
            seatConfig.forEach(newSeat => {
                const existingIndex = theater.seatConfig.findIndex(
                    s => s.row === newSeat.row &&
                        s.seatNumber === newSeat.seatNumber &&
                        s.section === newSeat.section
                );

                if (existingIndex >= 0) {
                    theater.seatConfig[existingIndex] = {
                        ...theater.seatConfig[existingIndex].toObject(),
                        ...newSeat
                    };
                } else {
                    theater.seatConfig.push(newSeat);
                }
            });

            await theater.save();

            res.status(200).json({
                success: true,
                message: "Seat configuration updated successfully",
                data: theater
            });
        } catch (error) {
            console.error("Error updating seat config:", error);
            res.status(500).json({
                success: false,
                message: "Error updating seat configuration",
                error: error.message
            });
        }
    },

    // Get theater layout with seat availability for an event
    getTheaterForEvent: async (req, res) => {
        try {
            const { theaterId, eventId } = req.params;
            const Event = require('../Models/Event');

            const theater = await Theater.findById(theaterId);
            if (!theater) {
                return res.status(404).json({
                    success: false,
                    message: "Theater not found"
                });
            }

            // Get booked seats for this event
            const event = await Event.findById(eventId).select('bookedSeats seatPricing hasTheaterSeating');
            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: "Event not found"
                });
            }

            // Create a map of booked seats for quick lookup
            const bookedSeatsMap = new Map();
            event.bookedSeats.forEach(seat => {
                const key = `${seat.section}-${seat.row}-${seat.seatNumber}`;
                bookedSeatsMap.set(key, seat.bookingId);
            });

            res.status(200).json({
                success: true,
                data: {
                    theater,
                    bookedSeats: event.bookedSeats,
                    seatPricing: event.seatPricing,
                    bookedSeatsMap: Object.fromEntries(bookedSeatsMap)
                }
            });
        } catch (error) {
            console.error("Error fetching theater for event:", error);
            res.status(500).json({
                success: false,
                message: "Error fetching theater data",
                error: error.message
            });
        }
    }
};

// Helper function to generate row labels
function generateRowLabels(count, prefix = '') {
    const labels = [];
    for (let i = 0; i < count; i++) {
        if (i < 26) {
            labels.push(prefix + String.fromCharCode(65 + i)); // A-Z
        } else {
            labels.push(prefix + 'R' + (i + 1)); // R27, R28, etc.
        }
    }
    return labels;
}

module.exports = TheaterController;
