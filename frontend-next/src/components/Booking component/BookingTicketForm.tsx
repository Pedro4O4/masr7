'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiCalendar, FiMapPin, FiTag, FiMinus, FiPlus,
    FiShoppingCart, FiArrowLeft, FiCheckCircle, FiAlertCircle,
    FiCreditCard, FiUsers, FiGrid
} from 'react-icons/fi';
import api from '@/services/api';
import { getImageUrl } from '@/utils/imageHelper';
import SeatSelector from './SeatSelector';
import './BookingTicketForm.css';

interface Seat {
    row: string;
    seatNumber: number;
    section?: string;
}

interface Event {
    _id: string;
    title: string;
    date?: string;
    location?: string;
    category?: string;
    image?: string;
    ticketPrice?: number;
    totalTickets?: number;
    remainingTickets?: number;
    hasTheaterSeating?: boolean;
}

interface BookTicketFormProps {
    event?: Event;
    eventId?: string;
    onBookingComplete?: (data: any) => void;
}

const BookTicketForm = ({ event: preSelectedEvent, eventId, onBookingComplete }: BookTicketFormProps) => {
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [numberOfTickets, setNumberOfTickets] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isEventLoading, setIsEventLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const router = useRouter();

    const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
    const [seatTotalPrice, setSeatTotalPrice] = useState<number>(0);

    useEffect(() => {
        if (preSelectedEvent) {
            setSelectedEvent(preSelectedEvent);
            return;
        }

        if (eventId) {
            fetchEventById(eventId);
        }
    }, [preSelectedEvent, eventId]);

    const fetchEventById = async (id: string) => {
        try {
            setIsEventLoading(true);
            const response = await api.get(`/event/${id}`);

            if (response.data && response.data.data) {
                setSelectedEvent(response.data.data);
            } else {
                throw new Error('Invalid event data received');
            }
        } catch (err: any) {
            console.error("Error fetching event details:", err);
            setError("Failed to load event details: " + (err.response?.data?.message || err.message));
        } finally {
            setIsEventLoading(false);
        }
    };

    const handleTicketChange = (delta: number) => {
        const maxTickets = selectedEvent?.remainingTickets || selectedEvent?.totalTickets || 0;
        const newValue = numberOfTickets + delta;

        if (newValue >= 1 && newValue <= Math.min(maxTickets, 10)) {
            setNumberOfTickets(newValue);
        }
    };

    const handleSeatsSelected = useCallback((seats: Seat[], totalPrice: number) => {
        setSelectedSeats(seats);
        setSeatTotalPrice(totalPrice);
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!selectedEvent) {
            setError("Please select an event before booking");
            return;
        }

        if (selectedEvent.hasTheaterSeating && selectedSeats.length === 0) {
            setError("Please select at least one seat");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const payload: any = {
                eventId: selectedEvent._id,
                status: 'confirmed'
            };

            if (selectedEvent.hasTheaterSeating) {
                payload.selectedSeats = selectedSeats.map(seat => ({
                    row: seat.row,
                    seatNumber: seat.seatNumber,
                    section: seat.section
                }));
            } else {
                payload.numberOfTickets = numberOfTickets;
            }

            const response = await api.post('/booking', payload);

            setSuccess(true);

            setTimeout(() => {
                if (onBookingComplete) {
                    onBookingComplete(response.data);
                } else {
                    router.push('/bookings');
                }
            }, 2000);

        } catch (err: any) {
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

    const formatDate = (dateString: string | undefined): string => {
        if (!dateString) return 'TBA';
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

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
                    <p>The event you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                    <motion.button
                        onClick={() => router.push('/events')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <FiArrowLeft /> Browse Events
                    </motion.button>
                </div>
            </motion.div>
        );
    }

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
                        You have successfully booked {ticketCount} {selectedEvent?.hasTheaterSeating ? 'seat' : 'ticket'}{ticketCount > 1 ? 's' : ''} for {selectedEvent?.title}
                    </p>
                    {selectedEvent?.hasTheaterSeating && selectedSeats.length > 0 && (
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
            className={`booking-page ${selectedEvent?.hasTheaterSeating ? 'fullpage-theater' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="booking-bg-effect"></div>

            {selectedEvent?.hasTheaterSeating ? (
                <div className="theater-fullpage-container">
                    <motion.div
                        className="theater-header-bar"
                        initial={{ y: -30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                    >
                        <motion.button
                            className="back-btn-compact"
                            onClick={() => router.back()}
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

                    <div className="theater-seat-area">
                        <SeatSelector
                            eventId={selectedEvent._id}
                            onSeatsSelected={handleSeatsSelected}
                            maxSeats={10}
                        />
                    </div>

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
                <div className="booking-container">
                    <motion.button
                        className="back-to-events"
                        onClick={() => router.back()}
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
                        <div className="booking-header">
                            <FiShoppingCart className="header-icon" />
                            <div>
                                <h1>Book Tickets</h1>
                                <p>Complete your reservation</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <motion.div
                                className="event-preview"
                                whileHover={{ scale: 1.01 }}
                            >
                                <div className="preview-image">
                                    <img
                                        src={getImageUrl(selectedEvent?.image)}
                                        alt={selectedEvent?.title}
                                    />
                                </div>
                                <div className="preview-info">
                                    <h3>{selectedEvent?.title}</h3>
                                    <div className="preview-meta">
                                        <span><FiCalendar /> {formatDate(selectedEvent?.date)}</span>
                                        <span><FiMapPin /> {selectedEvent?.location || 'TBA'}</span>
                                        <span><FiTag /> {selectedEvent?.category || 'General'}</span>
                                    </div>
                                </div>
                            </motion.div>

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

                            <div className="booking-actions">
                                <motion.button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => router.push('/events')}
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
            )}
        </motion.div>
    );
};

export default BookTicketForm;
