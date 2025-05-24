import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BookingTicketForm.css';

const BookTicketForm = ({ event: preSelectedEvent, onBookingComplete }) => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(preSelectedEvent || null);
    const [numberOfTickets, setNumberOfTickets] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isEventLoading, setIsEventLoading] = useState(!preSelectedEvent);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!preSelectedEvent) {
            fetchAvailableEvents();
        } else {
            setSelectedEvent(preSelectedEvent);
        }
    }, [preSelectedEvent]);

    const fetchAvailableEvents = async () => {
        try {
            setIsEventLoading(true);
            const response = await axios.get('http://localhost:3000/api/v1/event', {
                withCredentials: true
            });

            let eventData = [];
            if (response.data && Array.isArray(response.data)) {
                eventData = response.data;
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                eventData = response.data.data;
            } else if (response.data && response.data.events && Array.isArray(response.data.events)) {
                eventData = response.data.events;
            }

            // Filter events with approved status and available tickets
            const availableEvents = eventData.filter(event => {
                const isActive = event.status === 'Active' || event.status === 'active' ||
                    event.status === 'approved' || event.status === 'Approved';
                const hasTickets = event.remainingTickets > 0 || event.tickCount > 0 || event.totalTickets > 0;
                return isActive && hasTickets;
            });

            setEvents(availableEvents);
            if (availableEvents.length > 0 && !selectedEvent) {
                setSelectedEvent(availableEvents[0]);
            }
        } catch (err) {
            console.error("Error fetching events:", err);
            setError("Failed to load available events: " + (err.response?.data?.message || err.message));
        } finally {
            setIsEventLoading(false);
        }
    };

    const handleEventSelect = (e) => {
        const eventId = e.target.value;
        const event = events.find(event => event._id === eventId);
        setSelectedEvent(event);
        setNumberOfTickets(1);
    };

    const handleTicketChange = (e) => {
        const value = parseInt(e.target.value);
        const maxTickets = selectedEvent?.remainingTickets || selectedEvent?.totalTickets || 0;

        if (value <= 0) setNumberOfTickets(1);
        else if (value > maxTickets) setNumberOfTickets(maxTickets);
        else setNumberOfTickets(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedEvent) {
            setError("Please select an event before booking");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Log request payload for debugging
            console.log("Sending booking request:", {
                eventId: selectedEvent._id,
                numberOfTickets,
                status: 'Confirmed'
            });

            const response = await axios.post(
                'http://localhost:3000/api/v1/booking',
                {
                    eventId: selectedEvent._id,
                    numberOfTickets,
                    status: 'confirmed'
                },
                { withCredentials: true }
            );

            if (onBookingComplete) {
                onBookingComplete(response.data);
            } else {
                navigate('/bookings');
            }
        } catch (err) {
            console.error("Booking error details:", err);

            let errorMessage = "Failed to book tickets. Please try again.";
            if (err.response) {
                errorMessage = err.response.data?.message || errorMessage;
                // Log complete error response for debugging
                console.error("Error response:", err.response);
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const getAvailableTickets = (event) => {
        return event?.remainingTickets || event?.totalTickets || 0;
    };

    const maxTickets = getAvailableTickets(selectedEvent);
    const ticketPrice = selectedEvent?.ticketPrice || 0;
    const totalPrice = numberOfTickets * ticketPrice;

    if (isEventLoading) return <div className="loading">Loading events...</div>;

    return (
        <div className="book-ticket-form">
            <h2>{preSelectedEvent ? 'Book Tickets' : 'Create a New Booking'}</h2>

            <form onSubmit={handleSubmit}>
                {!preSelectedEvent && (
                    <div className="form-group">
                        <label htmlFor="event-select">Select an Event:</label>
                        {events.length === 0 ? (
                            <div>
                                <p>No available events found. Check back later!</p>
                                {error && <div className="error-message">{error}</div>}
                                <button
                                    type="button"
                                    className="book-button"
                                    onClick={fetchAvailableEvents}
                                >
                                    Retry
                                </button>
                            </div>
                        ) : (
                            <select
                                id="event-select"
                                onChange={handleEventSelect}
                                value={selectedEvent?._id || ''}
                                className="event-select"
                                required
                            >
                                <option value="">-- Select an event --</option>
                                {events.map(event => (
                                    <option key={event._id} value={event._id}>
                                        {event.title} - ${event.ticketPrice} ({getAvailableTickets(event)} tickets left)
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                )}

                {selectedEvent && (
                    <>
                        <div className="event-summary">
                            <h4>{selectedEvent.title}</h4>
                            <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</p>
                            <p><strong>Location:</strong> {selectedEvent.location}</p>
                            <p><strong>Category:</strong> {selectedEvent.category}</p>
                            {selectedEvent.description && (
                                <p><strong>Description:</strong> {selectedEvent.description}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="numberOfTickets">
                                Number of Tickets:
                                <span className="tickets-remaining">({maxTickets} available)</span>
                            </label>
                            <input
                                type="number"
                                id="numberOfTickets"
                                value={numberOfTickets}
                                onChange={handleTicketChange}
                                min="1"
                                max={maxTickets}
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <div className="price-summary">
                            <p>Price per ticket: ${ticketPrice.toFixed(2)}</p>
                            <p className="total-price">Total: ${totalPrice.toFixed(2)}</p>
                        </div>

                        {error && (
                            <div className="error-message">
                                {error}
                                <p className="error-hint">
                                    Note: There might be an issue with the booking service. Please try again later or contact support.
                                </p>
                            </div>
                        )}

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="book-button"
                                disabled={isLoading || maxTickets === 0 || !selectedEvent}
                            >
                                {isLoading ? 'Processing...' : 'Book Now'}
                            </button>
                        </div>
                    </>
                )}
            </form>
        </div>
    );
};

export default BookTicketForm;