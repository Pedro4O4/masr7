import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ConfirmationDialog from '../AdminComponent/ConfirmationDialog';
import './BookingDetails.css';

const BookingDetails = () => {
    const { id } = useParams();
    const [booking, setBooking] = useState(null);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    useEffect(() => {
        fetchBookingDetails();
    }, [id]);

    const fetchBookingDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:3000/api/v1/booking/${id}`, {
                withCredentials: true
            });

            if (response.data) {
                setBooking(response.data);

                // If we have an eventId, fetch the event details
                if (response.data.eventId) {
                    try {
                        // Use the correct endpoint (singular 'event', not plural 'events')
                        const eventResponse = await axios.get(`http://localhost:3000/api/v1/event/${response.data.eventId}`, {
                            withCredentials: true
                        });

                        // Handle the response structure correctly
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
        } catch (err) {
            console.error("Error fetching booking details:", err);
            setError(err.response?.data?.message || "Failed to load booking details");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async () => {
        try {
            await axios.delete(`http://localhost:3000/api/v1/booking/${id}`, {
                withCredentials: true
            });
            setBooking({...booking, status: 'Cancelled'});
            setShowCancelConfirm(false);
        } catch (err) {
            console.error("Error canceling booking:", err);
            alert(`Error: ${err.response?.data?.message || err.message}`);
        }
    };

    const formatDate = (dateString) => {
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
            <Link to="/bookings" className="back-button">Back to My Bookings</Link>
        </div>
    );
    if (!booking) return (
        <div className="not-found">
            <h2>Booking not found</h2>
            <Link to="/bookings" className="back-button">Back to My Bookings</Link>
        </div>
    );

    // Use event state if available, fallback to booking.event
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

                {/* Event Information Section */}
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

                {/* Booking Information Section */}
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
                </div>

                <div className="booking-actions">
                    <Link to="/bookings" className="back-button">Back to My Bookings</Link>
                    {eventData._id && (
                        <Link to={`/events/${eventData._id}`} className="view-event-btn">View Event Page</Link>
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