'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import ConfirmationDialog from '@/components/AdminComponent/ConfirmationDialog';
import './BookingDetails.css';

interface Seat {
    row: string;
    seatNumber: number;
    seatType: string;
    price: number;
}

interface Booking {
    _id: string;
    eventId?: string;
    event?: any;
    numberOfTickets?: number;
    quantity?: number;
    totalPrice?: number;
    status?: string;
    createdAt?: string;
    hasTheaterSeating?: boolean;
    selectedSeats?: Seat[];
}

interface Event {
    _id?: string;
    title?: string;
    date?: string;
    location?: string;
    category?: string;
    description?: string;
    image?: string;
    ticketPrice?: number;
}

interface BookingDetailsProps {
    id: string;
}

const BookingDetails = ({ id }: BookingDetailsProps) => {
    const [booking, setBooking] = useState<Booking | null>(null);
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showCancelConfirm, setShowCancelConfirm] = useState<boolean>(false);

    useEffect(() => {
        fetchBookingDetails();
    }, [id]);

    const fetchBookingDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/booking/${id}`);

            if (response.data) {
                setBooking(response.data);

                if (response.data.eventId) {
                    try {
                        const eventResponse = await api.get(`/event/${response.data.eventId}`);

                        if (eventResponse.data.success && eventResponse.data.data) {
                            setEvent(eventResponse.data.data);
                        }
                    } catch (eventErr) {
                        console.error("Error fetching event details:", eventErr);
                    }
                }
            } else {
                setError("Booking not found");
            }
        } catch (err: any) {
            console.error("Error fetching booking details:", err);
            setError(err.response?.data?.message || "Failed to load booking details");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async () => {
        try {
            await api.delete(`/booking/${id}`);
            setBooking(booking ? { ...booking, status: 'Cancelled' } : null);
            setShowCancelConfirm(false);
        } catch (err: any) {
            console.error("Error canceling booking:", err);
            alert(`Error: ${err.response?.data?.message || err.message}`);
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return <div className="loading">Loading booking details...</div>;
    if (error) return (
        <div className="error-container">
            <div className="error">Error: {error}</div>
            <Link href="/bookings" className="back-button">Back to My Bookings</Link>
        </div>
    );
    if (!booking) return (
        <div className="not-found">
            <h2>Booking not found</h2>
            <Link href="/bookings" className="back-button">Back to My Bookings</Link>
        </div>
    );

    const eventData = event || booking.event || {};

    const bookingDate = booking.createdAt
        ? new Date(booking.createdAt).toLocaleDateString()
        : 'Date not available';

    return (
        <div className="booking-details-container">
            <div className="booking-details-card">
                <div className="booking-header">
                    <h2>Event & Booking Details</h2>
                    <span className={`booking-status ${booking.status?.toLowerCase() || 'confirmed'}`}>
                        {booking.status || 'Confirmed'}
                    </span>
                </div>

                <div className="event-details-content">
                    <div className="event-image-container">
                        {eventData.image ? (
                            <img src={eventData.image} alt={eventData.title} className="event-image" />
                        ) : (
                            <div className="event-no-image">No image available</div>
                        )}
                    </div>

                    <div className="event-info">
                        <h3>{eventData.title || 'Event Title Unavailable'}</h3>

                        <div className="event-info-item">
                            <h4>📅 Date & Time</h4>
                            <p>{eventData.date ? formatDate(eventData.date) : 'Date not available'}</p>
                        </div>

                        <div className="event-info-item">
                            <h4>📍 Location</h4>
                            <p>{eventData.location || 'Location not specified'}</p>
                        </div>

                        <div className="event-info-item">
                            <h4>🏷️ Category</h4>
                            <p>{eventData.category || 'Uncategorized'}</p>
                        </div>

                        <div className="event-info-item full-width">
                            <h4>📝 Description</h4>
                            <p className="event-description">{eventData.description || 'No description available'}</p>
                        </div>
                    </div>
                </div>

                <div className="booking-info-section">
                    <h3>Booking Information</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Booking ID:</span>
                            <span className="info-value">{booking._id}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Booked on:</span>
                            <span className="info-value">{bookingDate}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Number of Tickets:</span>
                            <span className="info-value">{booking.numberOfTickets || booking.quantity}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Price per Ticket:</span>
                            <span className="info-value">${eventData.ticketPrice?.toFixed(2) || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Total Price:</span>
                            <span className="info-value">${booking.totalPrice?.toFixed(2) || 'N/A'}</span>
                        </div>
                    </div>

                    {booking.hasTheaterSeating && booking.selectedSeats && booking.selectedSeats.length > 0 && (
                        <div className="selected-seats-section" style={{
                            marginTop: '20px',
                            padding: '15px',
                            background: 'rgba(139, 92, 246, 0.1)',
                            borderRadius: '12px',
                            border: '1px solid rgba(139, 92, 246, 0.2)'
                        }}>
                            <h4 style={{
                                color: '#8b5cf6',
                                margin: '0 0 12px 0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                🪑 Your Seats
                            </h4>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '8px'
                            }}>
                                {booking.selectedSeats.map((seat, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            padding: '8px 14px',
                                            background: seat.seatType === 'vip'
                                                ? 'rgba(245, 158, 11, 0.2)'
                                                : seat.seatType === 'premium'
                                                    ? 'rgba(139, 92, 246, 0.2)'
                                                    : 'rgba(107, 114, 128, 0.2)',
                                            border: `1px solid ${seat.seatType === 'vip'
                                                ? 'rgba(245, 158, 11, 0.4)'
                                                : seat.seatType === 'premium'
                                                    ? 'rgba(139, 92, 246, 0.4)'
                                                    : 'rgba(107, 114, 128, 0.4)'
                                                }`,
                                            borderRadius: '8px',
                                            color: '#f8fafc'
                                        }}
                                    >
                                        <strong>{seat.row}{seat.seatNumber}</strong>
                                        <span style={{
                                            marginLeft: '8px',
                                            fontSize: '0.8rem',
                                            opacity: 0.8,
                                            textTransform: 'capitalize'
                                        }}>
                                            {seat.seatType}
                                        </span>
                                        <span style={{
                                            marginLeft: '8px',
                                            color: '#22d3ee',
                                            fontWeight: 600
                                        }}>
                                            ${seat.price?.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="booking-actions">
                    <Link href="/bookings" className="back-button">Back to My Bookings</Link>
                    {eventData._id && (
                        <Link href={`/events/${eventData._id}`} className="view-event-btn">View Event Page</Link>
                    )}
                    {booking.status !== 'Cancelled' && (
                        <button
                            onClick={() => setShowCancelConfirm(true)}
                            className="cancel-booking-btn"
                        >
                            Cancel Booking
                        </button>
                    )}
                </div>
            </div>

            <ConfirmationDialog
                isOpen={showCancelConfirm}
                title="Confirm Cancellation"
                message="Are you sure you want to cancel this booking? This action cannot be undone."
                confirmText="Yes, Cancel Booking"
                cancelText="Keep Booking"
                onConfirm={handleCancelBooking}
                onCancel={() => setShowCancelConfirm(false)}
            />
        </div>
    );
};

export default BookingDetails;
