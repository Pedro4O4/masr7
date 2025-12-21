"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiCalendar, FiMapPin, FiTag, FiMinus, FiPlus,
    FiShoppingCart, FiArrowLeft, FiCheckCircle, FiAlertCircle,
    FiCreditCard, FiUsers, FiGrid
} from 'react-icons/fi';
import { getImageUrl } from '@/utils/imageHelper';
import SeatSelector from '@/components/Booking component/SeatSelector';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { Event } from '@/types/event';
import { Seat } from '@/types/booking';
import { toast } from 'react-toastify';
import '@/components/Booking component/BookingTicketForm.css';

const BookTicketPage = () => {
    const params = useParams();
    const eventId = params.eventId as string;
    const router = useRouter();
    const [event, setEvent] = useState<Event | null>(null);
    const [numberOfTickets, setNumberOfTickets] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isEventLoading, setIsEventLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Seat selection state
    const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
    const [seatTotalPrice, setSeatTotalPrice] = useState(0);

    useEffect(() => {
        if (!eventId) return;
        const fetchEvent = async () => {
            try {
                setIsEventLoading(true);
                const response = await api.get<any>(`/event/${eventId}`);
                const data = response.data.success ? response.data.data : response.data;
                setEvent(data);
            } catch (err: any) {
                console.error("Error fetching event details:", err);
                setError(err.response?.data?.message || "Failed to load event details");
            } finally {
                setIsEventLoading(false);
            }
        };
        fetchEvent();
    }, [eventId]);

    const handleTicketChange = (delta: number) => {
        if (!event) return;
        const max = event.remainingTickets || event.totalTickets || 0;
        const newVal = numberOfTickets + delta;
        if (newVal >= 1 && newVal <= Math.min(max, 10)) {
            setNumberOfTickets(newVal);
        }
    };

    const handleSeatsSelected = useCallback((seats: Seat[], totalPrice: number) => {
        setSelectedSeats(seats);
        setSeatTotalPrice(totalPrice);
    }, []);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!event) {
            toast.error("Please select an event before booking");
            return;
        }

        // Validate seat selection for theater events
        if (event.hasTheaterSeating && selectedSeats.length === 0) {
            toast.error("Please select at least one seat");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Build request payload based on booking type
            const payload: any = {
                eventId: event._id,
                status: 'confirmed'
            };

            if (event.hasTheaterSeating) {
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

            const response = await api.post('/booking', payload);

            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/bookings');
                }, 2000);
            }
        } catch (err: any) {
            console.error("Booking error:", err);
            const msg = err.response?.data?.message || "Failed to book tickets. Please try again.";
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString?: string) => {
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

    if (!event) {
        return (
            <motion.div className="booking-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="booking-error-state">
                    <FiAlertCircle size={60} />
                    <h2>Event Not Found</h2>
                    <p>The event you're looking for doesn't exist or has been removed.</p>
                    <motion.button onClick={() => router.push('/events')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <FiArrowLeft /> Browse Events
                    </motion.button>
                </div>
            </motion.div>
        );
    }

    if (success) {
        const ticketCount = event.hasTheaterSeating ? selectedSeats.length : numberOfTickets;
        const totalPaid = event.hasTheaterSeating ? seatTotalPrice : numberOfTickets * (event.ticketPrice || 0);

        return (
            <motion.div className="booking-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <motion.div className="booking-success-state" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 20 }}>
                    <motion.div className="success-icon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
                        <FiCheckCircle size={80} />
                    </motion.div>
                    <h2>Booking Confirmed!</h2>
                    <p>You have successfully booked {ticketCount} {event.hasTheaterSeating ? 'seat' : 'ticket'}{ticketCount > 1 ? 's' : ''} for {event.title}</p>
                    <div className="success-details"><span>Total Paid: ${totalPaid.toFixed(2)}</span></div>
                    <p className="redirect-text">Redirecting to your bookings...</p>
                </motion.div>
            </motion.div>
        );
    }

    const maxTickets = event.remainingTickets || event.totalTickets || 0;
    const ticketPrice = event.ticketPrice || 0;
    const totalDisplayPrice = event.hasTheaterSeating ? seatTotalPrice : numberOfTickets * ticketPrice;

    return (
        <ProtectedRoute requiredRole="Standard User">
            <motion.div className={`booking-page ${event.hasTheaterSeating ? 'fullpage-theater' : ''}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="booking-bg-effect"></div>

                {event.hasTheaterSeating ? (
                    <div className="theater-fullpage-container">
                        {/* Compact Header Bar */}
                        <motion.div className="theater-header-bar" initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                            <motion.button className="back-btn-compact" onClick={() => router.back()} whileHover={{ x: -3 }}>
                                <FiArrowLeft size={18} /><span>Back</span>
                            </motion.button>
                            <div className="event-info-compact">
                                <img src={getImageUrl(event.image)} alt="" className="event-thumb" />
                                <div>
                                    <h2>{event.title}</h2>
                                    <div className="event-meta-compact">
                                        <span><FiCalendar /> {formatDate(event.date)}</span>
                                        <span><FiMapPin /> {event.location || 'TBA'}</span>
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
                            <SeatSelector eventId={event._id} onSeatsSelected={handleSeatsSelected} maxSeats={10} />
                        </div>

                        {/* Fixed Bottom Action Bar */}
                        <motion.div className="theater-action-bar" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                            {error && <div className="error-inline"><FiAlertCircle /> {error}</div>}
                            <motion.button type="button" className="confirm-booking-btn" onClick={() => handleSubmit()} disabled={isLoading || selectedSeats.length === 0} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                {isLoading ? <><span className="btn-spinner"></span>Processing...</> : (
                                    <>{selectedSeats.length > 0 ? `Confirm ${selectedSeats.length} Seat${selectedSeats.length !== 1 ? 's' : ''} - $${seatTotalPrice.toFixed(2)}` : 'Select Seats to Continue'}</>
                                )}
                            </motion.button>
                        </motion.div>
                    </div>
                ) : (
                    <div className="booking-container">
                        <motion.button className="back-to-events" onClick={() => router.back()} initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} whileHover={{ x: -5 }}>
                            <FiArrowLeft size={18} /><span>Back</span>
                        </motion.button>
                        <motion.div className="booking-card" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                            <div className="booking-header"><FiShoppingCart className="header-icon" /><div><h1>Book Tickets</h1><p>Complete your reservation</p></div></div>
                            <form onSubmit={handleSubmit}>
                                <div className="event-preview">
                                    <div className="preview-image"><img src={getImageUrl(event.image)} alt={event.title} /></div>
                                    <div className="preview-info">
                                        <h3>{event.title}</h3>
                                        <div className="preview-meta">
                                            <span><FiCalendar /> {formatDate(event.date)}</span>
                                            <span><FiMapPin /> {event.location || 'TBA'}</span>
                                            <span><FiTag /> {event.category || 'General'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="ticket-selector-section">
                                    <div className="section-header"><FiUsers className="section-icon" /><div><h3>Number of Tickets</h3><span className="available-count">{maxTickets} available</span></div></div>
                                    <div className="ticket-counter">
                                        <button type="button" className="counter-btn" onClick={() => handleTicketChange(-1)} disabled={numberOfTickets <= 1}><FiMinus /></button>
                                        <span className="ticket-count">{numberOfTickets}</span>
                                        <button type="button" className="counter-btn" onClick={() => handleTicketChange(1)} disabled={numberOfTickets >= Math.min(maxTickets, 10)}><FiPlus /></button>
                                    </div>
                                </div>
                                <div className="price-summary-section">
                                    <div className="price-row"><span>Price per ticket</span><span>${ticketPrice.toFixed(2)}</span></div>
                                    <div className="price-row"><span>Quantity</span><span>× {numberOfTickets}</span></div>
                                    <div className="price-divider"></div>
                                    <div className="price-row total"><span>Total</span><span className="total-price">${totalDisplayPrice.toFixed(2)}</span></div>
                                </div>
                                <div className="booking-actions">
                                    <button type="button" className="cancel-btn" onClick={() => router.push('/events')}>Cancel</button>
                                    <button type="submit" className="confirm-btn" disabled={isLoading || maxTickets === 0}>{isLoading ? 'Processing...' : 'Confirm Booking'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </motion.div>
        </ProtectedRoute>
    );
};

export default BookTicketPage;

