import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import EventCard from './EventCard';
import './MyEventPage.css';

const MyEventsPage = () => {
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpValue, setOtpValue] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [currentEventId, setCurrentEventId] = useState(null);
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.role !== 'Organizer') {
            navigate('/events');
            return;
        }

        fetchMyEvents();
    }, [navigate, user]);

    useEffect(() => {
        // Filter events when search term changes
        if (events.length > 0) {
            const filtered = events.filter(event =>
                (event.title || event.name || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredEvents(filtered);
        }
    }, [searchTerm, events]);

    const fetchMyEvents = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/v1/user/events', {
                withCredentials: true
            });

            if (response.data) {
                const eventsData = Array.isArray(response.data) ? response.data :
                    (response.data.events || response.data.data || []);

                // Debug log to check event structure
                console.log("Event object structure:", eventsData[0]);

                setEvents(eventsData);
                setFilteredEvents(eventsData);
            }
        } catch (err) {
            setError('Failed to fetch your events: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleDelete = async (eventId, isApproved) => {
        if (!window.confirm('Are you sure you want to delete this event?')) {
            return;
        }

        setIsDeleting(true);

        try {
            if (isApproved) {
                // Request OTP for approved events
                const response = await axios.post(
                    `http://localhost:3000/api/v1/event/${eventId}/request-deletion-otp`,
                    {},
                    { withCredentials: true }
                );

                if (response.data.success) {
                    // Show OTP modal
                    setCurrentEventId(eventId);
                    setShowOtpModal(true);
                } else {
                    alert(response.data.message || 'Failed to send OTP');
                }
            } else {
                // Direct deletion for non-approved events
                await axios.delete(`http://localhost:3000/api/v1/event/${eventId}`, {
                    withCredentials: true
                });

                // Update UI after successful deletion
                setFilteredEvents(prev => prev.filter(event => (event.id || event._id) !== eventId));
                setEvents(prev => prev.filter(event => (event.id || event._id) !== eventId));
                alert('Event deleted successfully');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            alert('Failed to delete event: ' + errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    const verifyOtpAndDelete = async () => {
        if (!otpValue || otpValue.length < 6) {
            alert('Please enter a valid 6-digit OTP');
            return;
        }

        setIsVerifying(true);

        try {
            const response = await axios.post(
                'http://localhost:3000/api/v1/event/verify-deletion-otp',
                { eventId: currentEventId, otp: otpValue },
                { withCredentials: true }
            );

            if (response.data.success) {
                // Update UI after successful deletion
                setFilteredEvents(prev => prev.filter(event => (event.id || event._id) !== currentEventId));
                setEvents(prev => prev.filter(event => (event.id || event._id) !== currentEventId));
                alert('Event deleted successfully');
                setShowOtpModal(false);
                setOtpValue('');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            alert('Failed to verify OTP: ' + errorMessage);

            // For invalid OTP, let user try again
            if (errorMessage.includes('Invalid or expired OTP')) {
                setOtpValue(''); // Clear the OTP input
            } else {
                // For other errors, close the modal
                setShowOtpModal(false);
                setOtpValue('');
            }
        } finally {
            setIsVerifying(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading your events...</div>;
    }

    if (error) {
        return (
            <div className="no-events-container">
                <div className="no-events">
                    <h2>Error loading events</h2>
                    <p>{error}</p>
                    <Link to="/my-events/new" className="event-button">
                        Create Your First Event
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="event-list-container">
            <div className="event-header">
                <h1 className="page-title">My Events</h1>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search my events..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                </div>
                <div className="organizer-buttons">
                    <Link to="/events" className="view-events-button">View All Events</Link>
                    <Link to="/my-events/new" className="create-event-button">Create New Event</Link>
                    <Link to="/my-events/analytics" className="analytics-button">Analytics</Link>
                </div>
            </div>

            {filteredEvents && filteredEvents.length > 0 ? (
                <div className="event-grid">
                    {filteredEvents.map((event) => (
                        <div key={event.id || event._id} className="event-card-with-actions">
                            <EventCard event={event} />
                            <div className="event-info">
                            </div>
                            <div className="event-actions">
                                <h3 className="event-title">{event.title || event.name}</h3>
                                <Link to={`/events/${event.id || event._id}`} className="event-button">Details</Link>

                                {/* Edit button with tooltip for approved events */}
                                <div className="button-tooltip-container">
                                    {event.status === 'approved' ? (
                                        <span className="event-button disabled">Edit</span>
                                    ) : (
                                        <Link to={`/my-events/${event.id || event._id}/edit`} className="event-button">Edit</Link>
                                    )}
                                    {event.status === 'approved' &&
                                        <div className="approval-tooltip">Approved events cannot be edited</div>
                                    }
                                </div>

                                {/* Delete button */}
                                <div className="button-tooltip-container">
                                    <button
                                        onClick={() => handleDelete(event.id || event._id, event.status === 'approved')}
                                        className="delete-button"
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>

                                {event.remainingTickets !== undefined && (
                                    <div className="tickets-badge">
                                        <span className="tickets-count">{event.remainingTickets}</span>
                                        <span className="tickets-label">tickets left</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-events-container">
                    <div className="no-events">
                        {searchTerm ? (
                            <>
                                <h2>No events found matching "{searchTerm}"</h2>
                                <p>Try a different search term or create a new event.</p>
                            </>
                        ) : (
                            <>
                                <h2>You haven't created any events yet</h2>
                                <p>Create your first event to start selling tickets and managing registrations.</p>
                            </>
                        )}
                        <Link to="/my-events/new" className="event-button">
                            Create Your First Event
                        </Link>
                    </div>
                </div>
            )}

            {showOtpModal && (
                <div className="modal-container">
                    <div className="modal-content">
                        <div className="modal-header">Verify OTP</div>
                        <div className="modal-message">
                            Please enter the 6-digit OTP sent to your email to confirm event deletion
                        </div>

                        <div className="otp-input-container">
                            {Array(6).fill(0).map((_, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    className="otp-digit"
                                    maxLength={1}
                                    value={otpValue[index] || ''}
                                    onChange={(e) => {
                                        const newOtp = [...otpValue];
                                        newOtp[index] = e.target.value;
                                        setOtpValue(newOtp.join(''));

                                        // Auto focus next input
                                        if (e.target.value && index < 5) {
                                            e.target.nextElementSibling?.focus();
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        // Go to previous input on backspace
                                        if (e.key === 'Backspace' && !otpValue[index] && index > 0) {
                                            e.target.previousElementSibling?.focus();
                                        }
                                    }}
                                />
                            ))}
                        </div>

                        <div>
                            <button
                                className="modal-button confirm"
                                onClick={verifyOtpAndDelete}
                                disabled={isVerifying}
                            >
                                {isVerifying ? 'Verifying...' : 'Verify & Delete'}
                            </button>
                            <button
                                className="modal-button cancel"
                                onClick={() => {
                                    setShowOtpModal(false);
                                    setOtpValue('');
                                }}
                                disabled={isVerifying}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyEventsPage;