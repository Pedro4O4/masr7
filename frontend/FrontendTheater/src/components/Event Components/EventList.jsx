import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import EventCard from './EventCard';
import './EventList.css';
import './EventCard.css'

const EventList = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            console.log("No user found in auth context");
            navigate('/login');
            return;
        }

        fetchEvents();
    }, [navigate, user]);

    const fetchEvents = async () => {
        try {
            // Redirect System Admin to admin events page
            if (user?.role === "System Admin") {
                navigate('/admin/events');
                return; // Stop execution to prevent unnecessary API call
            }

            // For non-admin users, continue with normal event fetching
            let endpoint = 'http://localhost:3000/api/v1/event';
            console.log(`Fetching events from ${endpoint} as ${user.role}...`);

            const response = await axios.get(endpoint, {
                withCredentials: true
            });

            console.log("API Response:", response);

            if (response.data && Array.isArray(response.data)) {
                setEvents(response.data);
            } else if (response.data && response.data.events && Array.isArray(response.data.events)) {
                setEvents(response.data.events);
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                setEvents(response.data.data);
            } else {
                console.error("Unexpected API response format:", response.data);
                setError("Unexpected data format from API");
            }
        } catch (err) {
            console.error("Error fetching events:", err);
            if (err.response && (err.response.status === 401 || err.response.status === 403 || err.response.status === 405)) {
                navigate('/login');
            } else {
                const errorMessage = err.response?.data?.message || err.message;
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="event-list-container">
            <div className="event-header">
                <h1 className="page-title">Events</h1>
                {user?.role === "Organizer" && (
                    <div className="organizer-buttons">
                        <Link to="/my-events" className="create-event-button" style={{ marginLeft: '10px' }}>
                            My Events
                        </Link>
                    </div>
                )}
                {user?.role === "Standard User" && (
                    <div className="organizer-buttons">
                        <Link to="/bookings" className="event-button">
                            My bookings
                        </Link>
                        <Link to="/bookings/new" className="create-event-button">
                            Create booking
                        </Link>
                    </div>
                )}
            </div>

            {loading && <p className="loading-state">Loading events...</p>}
            {error && <p className="error-message">Error: {error}</p>}

            {!loading && !error && (
                <div className="event-grid">
                    {events.length > 0 ? (
                        events.map((event) => (
                            <div key={event._id} className="event-card-with-actions">
                                <EventCard event={event} />
                                <div className="event-actions">
                                    <Link to={`/events/${event._id}`} className="event-button">Details</Link>


                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-events">No events found</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default EventList;