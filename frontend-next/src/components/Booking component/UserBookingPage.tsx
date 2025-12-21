'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import ConfirmationDialog from '@/components/AdminComponent/ConfirmationDialog';
import './UserBookingPage.css';

interface Booking {
    _id: string;
    eventId?: string;
    event?: any;
    quantity?: number;
    numberOfTickets?: number;
    totalPrice?: number;
    status?: string;
    createdAt?: string;
}

interface EventDetails {
    [key: string]: {
        title?: string;
        ticketPrice?: number;
        [key: string]: any;
    };
}

const UserBookingsPage = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [eventDetails, setEventDetails] = useState<EventDetails>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteBookingId, setDeleteBookingId] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
    const [cancellationLoading, setCancellationLoading] = useState<boolean>(false);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/user/bookings');

            let bookingsData: Booking[] = [];
            if (response.data && Array.isArray(response.data)) {
                bookingsData = response.data;
            } else if (response.data && response.data.userId && Array.isArray(response.data.userId)) {
                bookingsData = response.data.userId;
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                bookingsData = response.data.data;
            } else {
                setError("Unexpected data format from API");
                setLoading(false);
                return;
            }

            setBookings(bookingsData);

            // Fetch event details for each booking
            const events: EventDetails = {};
            await Promise.all(
                bookingsData.map(async (booking) => {
                    if (booking.eventId) {
                        try {
                            const eventResponse = await api.get(`/event/${booking.eventId}`);

                            if (eventResponse.data.success && eventResponse.data.data) {
                                events[booking.eventId] = eventResponse.data.data;
                            }
                        } catch (err) {
                            console.error(`Error fetching event for booking ${booking._id}:`, err);
                        }
                    }
                })
            );

            setEventDetails(events);
        } catch (err: any) {
            console.error("Error fetching bookings:", err);
            setError(err.response?.data?.message || "Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelClick = (bookingId: string) => {
        setDeleteBookingId(bookingId);
        setShowDeleteConfirm(true);
    };

    const confirmCancel = async () => {
        try {
            setCancellationLoading(true);
            await api.delete(`/booking/${deleteBookingId}`);
            setBookings(bookings.filter(booking => booking._id !== deleteBookingId));
            setShowDeleteConfirm(false);
        } catch (err: any) {
            console.error("Error canceling booking:", err);
            alert(`Error: ${err.response?.data?.message || err.message}`);
        } finally {
            setCancellationLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading your bookings...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="bookings-container">
            <div className="bookings-header">
                <h1>My Bookings</h1>
                <Link href="/events" className="browse-events-btn">Events</Link>
            </div>

            {bookings.length === 0 ? (
                <div className="no-bookings">
                    <p>You haven&apos;t made any bookings yet.</p>
                    <Link href="/events" className="browse-events-link">Events</Link>
                </div>
            ) : (
                <div className="bookings-list">
                    {bookings.map((booking) => {
                        const event = booking.eventId && eventDetails[booking.eventId]
                            ? eventDetails[booking.eventId]
                            : booking.event || {};

                        return (
                            <div key={booking._id} className="booking-card">
                                <div className="booking-info">
                                    <h3>{event.title || 'Event Title Unavailable'}</h3>
                                    <span className="booking-date">
                                        {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : ''}
                                    </span>

                                    <div className="booking-details">
                                        <p>Tickets: <strong>{booking.quantity || booking.numberOfTickets}</strong></p>
                                        <p>Total: <strong>${booking.totalPrice?.toFixed(2) || ((booking.quantity || 0) * (event?.ticketPrice || 0)).toFixed(2) || 'N/A'}</strong></p>
                                        <p>Status: <span className={`status ${(booking.status || 'confirmed').toLowerCase()}`}>
                                            {booking.status || 'Confirmed'}
                                        </span></p>
                                    </div>

                                    <div className="bookings-actions">
                                        <Link href={`/bookings/${booking._id}`} className="view-details-btn">View Details</Link>
                                        {booking.status !== 'Cancelled' && (
                                            <button
                                                onClick={() => handleCancelClick(booking._id)}
                                                className="cancel-btn"
                                                disabled={cancellationLoading}
                                            >
                                                Cancel Booking
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <ConfirmationDialog
                isOpen={showDeleteConfirm}
                title="Confirm Cancellation"
                message="Are you sure you want to cancel this booking? This action cannot be undone."
                confirmText={cancellationLoading ? "Cancelling..." : "Yes, Cancel Booking"}
                cancelText="Keep Booking"
                onConfirm={confirmCancel}
                onCancel={() => setShowDeleteConfirm(false)}
                isLoading={cancellationLoading}
            />
        </div>
    );
};

export default UserBookingsPage;
