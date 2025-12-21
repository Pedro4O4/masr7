"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import ConfirmationDialog from '@/components/AdminComponent/ConfirmationDialog';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { Booking, Event } from '@/types/event';
import { toast } from 'react-toastify';
import { FiAlertCircle, FiArrowRight, FiTrash2 } from 'react-icons/fi';
import '@/components/Booking component/BookingDetails.css';

import { getImageUrl } from '@/utils/imageHelper';
import SeatSelector from '@/components/Booking component/SeatSelector';

const BookingDetailsPage = () => {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    useEffect(() => {
        if (!id) return;
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const bResp = await api.get<any>(`/booking/${id}`);
                const bData = bResp.data.success ? bResp.data.data : bResp.data;
                setBooking(bData);

                // If eventId is an object (populated), use it, otherwise fetch
                if (bData.eventId && typeof bData.eventId === 'object') {
                    setEvent(bData.eventId);
                } else if (bData.eventId) {
                    const eResp = await api.get<any>(`/event/${bData.eventId}`);
                    const eData = eResp.data.success ? eResp.data.data : eResp.data;
                    setEvent(eData);
                }
            } catch (err: any) {
                console.error("Error fetching details:", err);
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleCancel = async () => {
        try {
            await api.delete(`/booking/${id}`);
            if (booking) setBooking({ ...booking, status: 'Cancelled' });
            setShowCancelConfirm(false);
            toast.success("Booking cancelled");
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message);
        }
    };

    if (loading) return (
        <div className="booking-details-loading">
            <div className="spinner"></div>
            <p>Loading details...</p>
        </div>
    );

    if (error || !booking) return (
        <div className="booking-details-error">
            <FiAlertCircle size={48} />
            <p>{error || "Booking not found"}</p>
            <Link href="/bookings" className="back-btn">Back to Bookings</Link>
        </div>
    );

    const eventData = event || (booking.event as any) || {};
    const isCancelled = booking.status === 'Cancelled' || (booking.status as any) === 'cancelled';
    const eventId = eventData._id || eventData.id || booking.eventId;
    const imageUrl = getImageUrl(eventData.image);

    return (
        <ProtectedRoute requiredRole="Standard User">
            <div className="booking-details-container">
                <div className="booking-details-wrapper">
                    <div className="booking-details-card">
                        <div className="booking-header">
                            <div className="header-title">
                                <h2>Booking Details</h2>
                                <span className="booking-id-tag">ID: {booking._id}</span>
                            </div>
                            <span className={`booking-status ${booking.status?.toLowerCase()}`}>
                                {isCancelled ? 'Cancelled' : 'Confirmed'}
                            </span>
                        </div>

                        <div className="event-info-section">
                            <div className="event-image-sm">
                                {eventData.image ? (
                                    <img src={imageUrl} alt={eventData.title} />
                                ) : (
                                    <div className="no-photo-placeholder">
                                        <span>No Photo</span>
                                    </div>
                                )}
                            </div>
                            <div className="event-info-content">
                                <h3>{eventData.title}</h3>
                                <div className="detail-meta">
                                    <p><strong>📍 Location:</strong> {eventData.location}</p>
                                    <p><strong>📅 Date:</strong> {new Date(eventData.date).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="booking-financial-info">
                            <div className="financial-row">
                                <span>Quantity</span>
                                <strong>{booking.numberOfTickets || booking.quantity} ticket(s)</strong>
                            </div>
                            <div className="financial-row">
                                <span>Total Paid</span>
                                <strong className="price-text">${booking.totalPrice?.toFixed(2)}</strong>
                            </div>
                        </div>

                        {booking.hasTheaterSeating && booking.selectedSeats && (
                            <div className="seats-display-section">
                                <h4>🪑 Your Booked Seats</h4>
                                <div className="seat-chips-list">
                                    {booking.selectedSeats.map((s, i) => (
                                        <span key={i} className="seat-chip">
                                            {s.row}{s.seatNumber} <small>({s.seatType})</small>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="booking-actions">
                            <Link href="/bookings" className="back-button">
                                <FiArrowRight style={{ transform: 'rotate(180deg)' }} /> Back to My Bookings
                            </Link>
                            {!isCancelled && (
                                <button onClick={() => setShowCancelConfirm(true)} className="cancel-booking-btn">
                                    <FiTrash2 /> Cancel Booking
                                </button>
                            )}
                        </div>
                    </div>

                    {booking.hasTheaterSeating && eventId && (
                        <div className="theater-view-section">
                            <div className="section-header">
                                <h3>Theater Layout</h3>
                                <p>Your seats are highlighted in purple below</p>
                            </div>
                            <div className="theater-details-container">
                                <SeatSelector
                                    eventId={typeof eventId === 'object' ? (eventId as any)._id : eventId}
                                    readOnly={true}
                                    highlightedSeats={booking.selectedSeats}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <ConfirmationDialog
                    isOpen={showCancelConfirm}
                    title="Cancel Booking"
                    message="Are you sure you want to cancel this booking? This action cannot be undone."
                    onConfirm={handleCancel}
                    onCancel={() => setShowCancelConfirm(false)}
                />
            </div>
        </ProtectedRoute>
    );
};

export default BookingDetailsPage;
