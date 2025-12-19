// BookingTicketForm.jsx - Enhanced with Framer Motion, Modern Design & Seat Selection
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiCalendar, FiMapPin, FiTag, FiMinus, FiPlus,
    FiShoppingCart, FiArrowLeft, FiCheckCircle, FiAlertCircle,
    FiCreditCard, FiUsers, FiGrid
} from 'react-icons/fi';
import './BookingTicketForm.css';
import { getImageUrl } from '../../utils/imageHelper';
import SeatSelector from './SeatSelector';

const BookTicketForm = ({ event: preSelectedEvent, onBookingComplete }) => {
    const { eventId } = useParams();
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [numberOfTickets, setNumberOfTickets] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isEventLoading, setIsEventLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    // Seat selection state
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [seatTotalPrice, setSeatTotalPrice] = useState(0);

    useEffect(() => {
        if (preSelectedEvent) {
            setSelectedEvent(preSelectedEvent);
            return;
        }

        if (eventId) {
            fetchEventById(eventId);
        }
    }, [preSelectedEvent, eventId]);

    const fetchEventById = async (id) => {
        try {
            setIsEventLoading(true);
            const response = await axios.get(`http://localhost:3000/api/v1/event/${id}`, {
                withCredentials: true
            });

            if (response.data && response.data.data) {
                setSelectedEvent(response.data.data);
            } else {
                throw new Error('Invalid event data received');
            }
        } catch (err) {
            console.error("Error fetching event details:", err);
            setError("Failed to load event details: " + (err.response?.data?.message || err.message));
        } finally {
            setIsEventLoading(false);
        }
    };

    const handleTicketChange = (delta) => {
        const maxTickets = selectedEvent?.remainingTickets || selectedEvent?.totalTickets || 0;
        const newValue = numberOfTickets + delta;

        if (newValue >= 1 && newValue <= Math.min(maxTickets, 10)) {
            setNumberOfTickets(newValue);
        }
    };

    // Handle seat selection from SeatSelector
    const handleSeatsSelected = useCallback((seats, totalPrice) => {
        setSelectedSeats(seats);
        setSeatTotalPrice(totalPrice);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedEvent) {
            setError("Please select an event before booking");
            return;
        }

        // Validate seat selection for theater events
        if (selectedEvent.hasTheaterSeating && selectedSeats.length === 0) {
            setError("Please select at least one seat");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Build request payload based on booking type
            const payload = {
                eventId: selectedEvent._id,
                status: 'confirmed'
            };

            if (selectedEvent.hasTheaterSeating) {
                // Seat-based booking
                payload.selectedSeats = selectedSeats.map(seat => ({
                    row: seat.row,
                    seatNumber: seat.seatNumber,
                    section: seat.section
                }));
            } else {
                // Regular ticket booking
                payload.numberOfTickets = numberOfTickets;
            }

            const response = await axios.post(
                'http://localhost:3000/api/v1/booking',
                payload,
                { withCredentials: true }
            );

            setSuccess(true);

            setTimeout(() => {
                if (onBookingComplete) {
                    onBookingComplete(response.data);
                } else {
                    navigate('/bookings');
                }
            }, 2000);

        } catch (err) {
            console.error("Booking error:", err);
            setError(err.response?.data?.message || "Failed to book tickets. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const maxTickets = selectedEvent?.remainingTickets || selectedEvent?.totalTickets || 0;
    const ticketPrice = selectedEvent?.ticketPrice || 0;
    const totalPrice = selectedEvent?.hasTheaterSeating ? seatTotalPrice : numberOfTickets * ticketPrice;
    const ticketCount = selectedEvent?.hasTheaterSeating ? selectedSeats.length : numberOfTickets;

    const formatDate = (dateString) => {
        if (!dateString) return 'TBA';
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Loading State
    if (isEventLoading) {
        return (
            <div className="booking-page">
                <div className="booking-loading">
                    <div className="loading-spinner-booking">
                        <div className="spinner-ring"></div>
                    </div>
                    <p>Loading event details...</p>
                </div>
            </div>
        );
    }

    // Not Found State
    if (!selectedEvent && !isEventLoading) {
        return (
            <motion.div
                className="booking-page"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="booking-error-state">
                    <FiAlertCircle size={60} />
                    <h2>Event Not Found</h2>
                    <p>The event you're looking for doesn't exist or has been removed.</p>
                    <motion.button
                        onClick={() => navigate('/events')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <FiArrowLeft /> Browse Events
                    </motion.button>
                </div>
            </motion.div>
        );
    }

    // Success State
    if (success) {
        return (
            <motion.div
                className="booking-page"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <motion.div
                    className="booking-success-state"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 20 }}
                >
                    <motion.div
                        className="success-icon"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                    >
                        <FiCheckCircle size={80} />
                    </motion.div>
                    <h2>Booking Confirmed!</h2>
                    <p>
                        You have successfully booked {ticketCount} {selectedEvent.hasTheaterSeating ? 'seat' : 'ticket'}{ticketCount > 1 ? 's' : ''} for {selectedEvent.title}
                    </p>
                    {selectedEvent.hasTheaterSeating && selectedSeats.length > 0 && (
                        <div className="success-seats">
                            {selectedSeats.map(seat => (
                                <span key={`${seat.section}-${seat.row}-${seat.seatNumber}`} className="seat-chip">
                                    {seat.row}{seat.seatNumber}
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="success-details">
                        <span>Total Paid: ${totalPrice.toFixed(2)}</span>
                    </div>
                    <p className="redirect-text">Redirecting to your bookings...</p>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className={`booking-page ${selectedEvent.hasTheaterSeating ? 'fullpage-theater' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Background Effect */}
            <div className="booking-bg-effect"></div>

            {/* Theater Full Page Mode */}
            {selectedEvent.hasTheaterSeating ? (
                <div className="theater-fullpage-container">
                    {/* Compact Header Bar */}
                    <motion.div
                        className="theater-header-bar"
                        initial={{ y: -30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                    >
                        <motion.button
                            className="back-btn-compact"
                            onClick={() => navigate(-1)}
                            whileHover={{ x: -3 }}
                        >
                            <FiArrowLeft size={18} />
                            <span>Back</span>
                        </motion.button>

                        <div className="event-info-compact">
                            <img src={getImageUrl(selectedEvent.image)} alt="" className="event-thumb" />
                            <div>
                                <h2>{selectedEvent.title}</h2>
                                <div className="event-meta-compact">
                                    <span><FiCalendar /> {formatDate(selectedEvent.date)}</span>
                                    <span><FiMapPin /> {selectedEvent.location || 'TBA'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="booking-summary-compact">
                            {selectedSeats.length > 0 && (
                                <>
                                    <span className="seats-count">{selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''}</span>
                                    <span className="total-amount">${seatTotalPrice.toFixed(2)}</span>
                                </>
                            )}
                        </div>
                    </motion.div>

                    {/* Full Page Seat Selector */}
                    <div className="theater-seat-area">
                        <SeatSelector
                            eventId={selectedEvent._id}
                            onSeatsSelected={handleSeatsSelected}
                            maxSeats={10}
                        />
                    </div>

                    {/* Fixed Bottom Action Bar */}
                    <motion.div
                        className="theater-action-bar"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                    >
                        {error && (
                            <div className="error-inline">
                                <FiAlertCircle /> {error}
                            </div>
                        )}

                        <motion.button
                            type="button"
                            className="confirm-booking-btn"
                            onClick={handleSubmit}
                            disabled={isLoading || selectedSeats.length === 0}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isLoading ? (
                                <>
                                    <span className="btn-spinner"></span>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <FiCreditCard />
                                    {selectedSeats.length > 0
                                        ? `Confirm ${selectedSeats.length} Seat${selectedSeats.length !== 1 ? 's' : ''} - $${seatTotalPrice.toFixed(2)}`
                                        : 'Select Seats to Continue'
                                    }
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                </div>
            ) : (
                /* Regular Ticket Booking - Keep Card Layout */
                <div className="booking-container">
                    {/* Back Button */}
                    <motion.button
                        className="back-to-events"
                        onClick={() => navigate(-1)}
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        whileHover={{ x: -5 }}
                    >
                        <FiArrowLeft size={18} />
                        <span>Back</span>
                    </motion.button>

                    <motion.div
                        className="booking-card"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        {/* Header */}
                        <div className="booking-header">
                            <FiShoppingCart className="header-icon" />
                            <div>
                                <h1>Book Tickets</h1>
                                <p>Complete your reservation</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Event Preview */}
                            <motion.div
                                className="event-preview"
                                whileHover={{ scale: 1.01 }}
                            >
                                <div className="preview-image">
                                    <img
                                        src={getImageUrl(selectedEvent.image)}
                                        alt={selectedEvent.title}
                                    />
                                </div>
                                <div className="preview-info">
                                    <h3>{selectedEvent.title}</h3>
                                    <div className="preview-meta">
                                        <span><FiCalendar /> {formatDate(selectedEvent.date)}</span>
                                        <span><FiMapPin /> {selectedEvent.location || 'TBA'}</span>
                                        <span><FiTag /> {selectedEvent.category || 'General'}</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Ticket Selector */}
                            <div className="ticket-selector-section">
                                <div className="section-header">
                                    <FiUsers className="section-icon" />
                                    <div>
                                        <h3>Number of Tickets</h3>
                                        <span className="available-count">{maxTickets} available</span>
                                    </div>
                                </div>

                                <div className="ticket-counter">
                                    <motion.button
                                        type="button"
                                        className="counter-btn"
                                        onClick={() => handleTicketChange(-1)}
                                        disabled={numberOfTickets <= 1}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <FiMinus />
                                    </motion.button>

                                    <motion.span
                                        className="ticket-count"
                                        key={numberOfTickets}
                                        initial={{ scale: 1.2 }}
                                        animate={{ scale: 1 }}
                                    >
                                        {numberOfTickets}
                                    </motion.span>

                                    <motion.button
                                        type="button"
                                        className="counter-btn"
                                        onClick={() => handleTicketChange(1)}
                                        disabled={numberOfTickets >= Math.min(maxTickets, 10)}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <FiPlus />
                                    </motion.button>
                                </div>
                            </div>

                            {/* Price Summary (for regular tickets) */}
                            <motion.div
                                className="price-summary-section"
                                layout
                            >
                                <div className="price-row">
                                    <span>Price per ticket</span>
                                    <span>${ticketPrice.toFixed(2)}</span>
                                </div>
                                <div className="price-row">
                                    <span>Quantity</span>
                                    <span>× {numberOfTickets}</span>
                                </div>
                                <div className="price-divider"></div>
                                <motion.div
                                    className="price-row total"
                                    key={totalPrice}
                                    initial={{ scale: 1.02 }}
                                    animate={{ scale: 1 }}
                                >
                                    <span>Total</span>
                                    <span className="total-price">${totalPrice.toFixed(2)}</span>
                                </motion.div>
                            </motion.div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        className="booking-error"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <FiAlertCircle />
                                        <div>
                                            <p>{error}</p>
                                            <span>Please try again or contact support.</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Action Buttons */}
                            <div className="booking-actions">
                                <motion.button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => navigate('/events')}
                                    disabled={isLoading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Cancel
                                </motion.button>

                                <motion.button
                                    type="submit"
                                    className="confirm-btn"
                                    disabled={isLoading || maxTickets === 0}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="btn-spinner"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <FiCreditCard />
                                            Confirm Booking
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )
            }
        </motion.div >
    );
};

export default BookTicketForm;