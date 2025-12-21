"use client";
import React, { useState, useEffect } from 'react';
import api from "@/services/api";
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiCalendar, FiMapPin, FiTag, FiUsers,
    FiInfo, FiArrowLeft, FiX, FiMaximize2, FiShoppingCart, FiCheck, FiGrid, FiDollarSign
} from 'react-icons/fi';
import '@/components/Event Components/EventDetailPage.css';
import { getImageUrl } from '@/utils/imageHelper';
import { useAuth } from '@/auth/AuthContext';
import { Event } from '@/types/event';
import SeatSelector from '@/components/Booking component/SeatSelector';

const EventDetailsPage = () => {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const { user } = useAuth();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const [seatData, setSeatData] = useState<any>(null);
    const [seatLoading, setSeatLoading] = useState(false);

    useEffect(() => {
        if (!id) {
            setError('Event ID is missing.');
            setLoading(false);
            return;
        }

        const fetchEventDetails = async () => {
            try {
                const response = await api.get<any>(`/event/${id}`);
                const data = response.data.success ? response.data.data : response.data;
                if (data) {
                    setEvent(data);
                } else {
                    throw new Error('Failed to load event details');
                }
            } catch (err: any) {
                console.error("Error fetching event:", err);
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [id]);

    useEffect(() => {
        if (event?.hasTheaterSeating && event?._id) {
            const fetchSeatData = async () => {
                try {
                    setSeatLoading(true);
                    const response = await api.get<any>(`/booking/event/${event._id}/seats`);
                    const data = response.data.success ? response.data.data : response.data;
                    if (data) {
                        setSeatData(data);
                    }
                } catch (err) {
                    console.error('Error fetching seat data:', err);
                } finally {
                    setSeatLoading(false);
                }
            };
            fetchSeatData();
        }
    }, [event]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            day: date.toLocaleDateString('en-US', { day: 'numeric' }),
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            year: date.getFullYear(),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            full: date.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };
    };

    const getTicketStatus = () => {
        if (!event) return {};
        const remaining = event.remainingTickets ?? 0;
        if (remaining === 0) return { status: 'sold-out', text: 'Sold Out', color: '#EF4444' };
        if (remaining < 20) return { status: 'limited', text: `Only ${remaining} left!`, color: '#F59E0B' };
        return { status: 'available', text: `${remaining} tickets available`, color: '#10B981' };
    };

    const ticketInfo: any = getTicketStatus();
    const dateInfo = event?.date ? formatDate(event.date) : null;

    if (loading) {
        return <div className="detail-page"><div className="loading-detail"><div className="loading-shimmer"></div><div className="loading-content"><div className="shimmer-line large"></div><div className="shimmer-line medium"></div><div className="shimmer-line small"></div></div></div></div>;
    }

    if (error) {
        return <motion.div className="detail-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div className="error-state"><span className="error-emoji">😕</span><h2>Oops! Something went wrong</h2><p>{error}</p><motion.button className="back-btn" onClick={() => router.push('/events')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}><FiArrowLeft /> Back to Events</motion.button></div></motion.div>;
    }

    if (!event) return null;

    // Check if this is a theater seating event
    const hasTheater = event.hasTheaterSeating;

    return (
        <motion.div className="detail-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="detail-bg-effect"></div>
            <div className="detail-container">
                <motion.button className="floating-back-btn" onClick={() => router.push('/events')} initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} whileHover={{ x: -5 }} whileTap={{ scale: 0.95 }}><FiArrowLeft size={20} /><span>Back</span></motion.button>

                {/* Split layout for theater events */}
                <div className={`detail-split-layout ${hasTheater ? 'with-theater' : ''}`}>
                    {/* Left: Event Details */}
                    <motion.div className="detail-card event-info-panel" initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}>
                        <motion.div className="detail-image-section" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                            <div className="detail-image-wrapper" onClick={() => event.image && setShowImageModal(true)}>
                                {event.image ? (
                                    <>
                                        {!imageLoaded && <div className="image-skeleton-detail"><div className="skeleton-shimmer"></div></div>}
                                        <motion.img src={getImageUrl(event.image)} alt={event.title} className={`detail-image ${imageLoaded ? 'loaded' : ''}`} onLoad={() => setImageLoaded(true)} whileHover={{ scale: 1.03 }} transition={{ duration: 0.6 }} />
                                        <div className="image-expand-hint"><FiMaximize2 /><span>Click to expand</span></div>
                                    </>
                                ) : (
                                    <div className="detail-no-photo-placeholder">
                                        <FiX size={48} />
                                        <span>No Photo Uploaded</span>
                                    </div>
                                )}
                                {dateInfo && <div className="date-badge"><span className="date-day">{dateInfo.day}</span><span className="date-month">{dateInfo.month}</span></div>}
                            </div>
                        </motion.div>

                        <motion.div className="detail-content" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                            <div className="detail-header">
                                <h1 className="event-title-main">{event.title}</h1>
                                <div className={`status-badge ${ticketInfo.status}`}>{ticketInfo.status === 'available' && <FiCheck />}{ticketInfo.text}</div>
                            </div>
                            <div className="info-grid compact">
                                <motion.div className="info-card" whileHover={{ y: -3, scale: 1.02 }}><div className="info-icon"><FiCalendar /></div><div className="info-text"><span className="info-label">Date & Time</span><span className="info-value">{dateInfo?.full || 'TBA'}</span></div></motion.div>
                                <motion.div className="info-card" whileHover={{ y: -3, scale: 1.02 }}><div className="info-icon"><FiMapPin /></div><div className="info-text"><span className="info-label">Location</span><span className="info-value">{event.location || 'TBA'}</span></div></motion.div>
                                <motion.div className="info-card" whileHover={{ y: -3, scale: 1.02 }}><div className="info-icon"><FiTag /></div><div className="info-text"><span className="info-label">Category</span><span className="info-value">{event.category || 'General'}</span></div></motion.div>
                                <motion.div className="info-card" whileHover={{ y: -3, scale: 1.02 }}><div className="info-icon"><FiUsers /></div><div className="info-text"><span className="info-label">Available</span><span className="info-value" style={{ color: ticketInfo.color }}>{event.remainingTickets ?? 'N/A'}</span></div></motion.div>
                            </div>
                            <div className="description-section"><h3><FiInfo /> About This Event</h3><p>{event.description || 'No description available.'}</p></div>

                            {/* Pricing Section */}
                            {event.seatPricing && event.seatPricing.length > 0 && (
                                <div className="pricing-section">
                                    <h3><FiDollarSign /> Pricing</h3>
                                    <div className="pricing-grid">
                                        {event.seatPricing.map((p: any) => (
                                            <div key={p.seatType} className={`pricing-item ${p.seatType}`}>
                                                <span className="seat-type-label">{p.seatType.charAt(0).toUpperCase() + p.seatType.slice(1)}</span>
                                                <span className="seat-price">${p.price?.toFixed(2) || '0.00'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="action-section">
                                {!hasTheater && (
                                    <div className="price-display">
                                        <span className="price-label">Price per ticket</span>
                                        <span className="price-amount">${event.ticketPrice?.toFixed(2) || '0.00'}</span>
                                    </div>
                                )}
                                {user?.role === "Standard User" && (
                                    <motion.button className={`book-now-btn-detail ${ticketInfo.status === 'sold-out' ? 'disabled' : ''}`} onClick={() => router.push(`/bookings/new/${event._id}`)} disabled={ticketInfo.status === 'sold-out'} whileHover={ticketInfo.status !== 'sold-out' ? { scale: 1.03 } : {}} whileTap={ticketInfo.status !== 'sold-out' ? { scale: 0.98 } : {}}>
                                        {event.hasTheaterSeating ? <FiGrid /> : <FiShoppingCart />}
                                        {ticketInfo.status === 'sold-out' ? 'Sold Out' : event.hasTheaterSeating ? 'Select Seats' : 'Book Tickets'}
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right: Theater Seat View */}
                    {hasTheater && (
                        <motion.div
                            className="theater-view-panel"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="theater-panel-header">
                                <h2><FiGrid /> Theater Layout</h2>
                                <div className="seat-stats">
                                    {seatData && (
                                        <>
                                            <div className="stat available">
                                                <span className="stat-number">{seatData.availableCount}</span>
                                                <span className="stat-label">Available</span>
                                            </div>
                                            <div className="stat booked">
                                                <span className="stat-number">{seatData.bookedCount}</span>
                                                <span className="stat-label">Booked</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="theater-seat-container">
                                <SeatSelector
                                    eventId={event._id}
                                    readOnly={true}
                                />
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
            <AnimatePresence>
                {showImageModal && (
                    <motion.div className="detail-image-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowImageModal(false)}>
                        <motion.div className="modal-image-container" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: "spring", damping: 25 }} onClick={(e) => e.stopPropagation()}>
                            <img src={getImageUrl(event.image)} alt={event.title} />
                            <motion.button className="modal-close" onClick={() => setShowImageModal(false)} whileHover={{ scale: 1.1, rotate: 90 }}><FiX size={24} /></motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default EventDetailsPage;
