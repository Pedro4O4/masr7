import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import './EventDetailPage.css';
import { getImageUrl } from '../../utils/imageHelper';

const EventDetailsPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);

    useEffect(() => {
        if (!id) {
            setError('Event ID is missing. Please select a valid event.');
            setLoading(false);
            return;
        }

        const fetchEventDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/v1/event/${id}`, {
                    withCredentials: true
                });

                if (response.data.success && response.data.data) {
                    setEvent(response.data.data);
                } else {
                    throw new Error('Failed to load event details');
                }
            } catch (err) {
                console.error("Error fetching event:", err);
                setError('Failed to load event details: ' + (err.response?.data?.message || err.message));
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [id]);

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

    const canEdit = user && (user.role === 'Organizer' || user.role === 'System Admin');

    const openImageModal = () => {
        if (event?.image) {
            setShowImageModal(true);
        }
    };
// Rest of your code remains the same...

    if (loading) {
        return (
            <div className="event-details-container">
                <div className="event-details-header">
                    <h1>Loading...</h1>
                </div>
                <div className="event-details-content" style={{justifyContent: 'center', alignItems: 'center'}}>
                    Loading event details...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="event-details-container">
                <div className="event-details-header">
                    <h1>Error</h1>
                </div>
                <div className="event-details-content">
                    <div className="event-info-item full-width">
                        <h3>⚠️ Error</h3>
                        <p>{error}</p>
                    </div>
                </div>
                <div className="event-actions">
                    <button className="back-button" onClick={() => navigate('/events')}>
                        Back to Events
                    </button>
                </div>
            </div>
        );
    }
    if (!event) {
        return (
            <div className="event-details-container">
                <div className="error-message">Event not found</div>
                <button className="back-button" onClick={() => navigate('/events')}>
                    Back to Events
                </button>
            </div>
        );
    }

    return (
        <div className="event-details-container">
            <div className="event-details-header">
                <h1>{event.title}</h1>
            </div>

            <div className="event-details-content">
                <div className="event-image-container" onClick={openImageModal}>
                    {event.image ? (
                        <>
                            <img
                                src={getImageUrl(event.image)}
                                alt={event.title}
                                className="event-image"
                            />
                            <div className="image-overlay">Click to enlarge</div>
                        </>
                    ) : (
                        <div className="event-no-image">No image available</div>
                    )}
                </div>

                <div className="event-info">
                    <div className="event-info-item">
                        <h3>📅 Date & Time</h3>
                        <p>{formatDate(event.date)}</p>
                    </div>

                    <div className="event-info-item">
                        <h3>📍 Location</h3>
                        <p>{event.location || 'Location not specified'}</p>
                    </div>

                    <div className="event-info-item">
                        <h3>🏷️ Category</h3>
                        <p>{event.category || 'Uncategorized'}</p>
                    </div>

                    <div className="event-info-item">
                        <h3>💰 Ticket Price</h3>
                        <p>${event.ticketPrice.toFixed(2)}</p>
                    </div>

                    <div className="event-info-item">
                        <h3>🎟️ Available Tickets</h3>
                        <p>{event.remainingTickets || event.totalTickets}</p>
                    </div>

                    <div className="event-info-item">
                        <h3>📊 Status</h3>
                        <p>{event.status || 'Not specified'}</p>
                    </div>

                    <div className="event-info-item full-width">
                        <h3>📝 Description</h3>
                        <p className="event-description">{event.description}</p>
                    </div>
                </div>
            </div>

            <div className="event-actions">
                <button className="back-button" onClick={() => navigate('/events')}>
                    Back to Events
                </button>

                {canEdit && (
                    <Link to={`/my-events/${id}/edit`} className="edit-button">
                        Edit Event
                    </Link>
                )}
            </div>

            {/* Image Modal */}
            {showImageModal && (
                <div className="full-image-modal" onClick={() => setShowImageModal(false)}>
                    <div className="modal-content">
                        <img src={getImageUrl(event.image)} alt={event.title} />
                        <button className="close-modal" onClick={(e) => {
                            e.stopPropagation();
                            setShowImageModal(false);
                        }}>×</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventDetailsPage;