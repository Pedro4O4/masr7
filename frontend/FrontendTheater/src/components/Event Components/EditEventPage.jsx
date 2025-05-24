import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import './EventForm.css';
import './EditEventPage.css';
import { getImageUrl } from "../../utils/imageHelper.jsx";

const EditEventPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showFullImage, setShowFullImage] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        venue: '',
        category: '',
        ticketPrice: 0,
        totalTickets: 0,
        image: '',
        useImageUrl: false,
        imageUrl: '',
        imagePreview: null,
        imageFile: null
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.role !== 'Organizer') {
            navigate('/events');
            return;
        }

        // Validate that ID exists before fetching
        if (!id) {
            setError('Event ID is missing. Please go back and try again.');
            setLoading(false);
            return;
        }

        fetchEvent();
    }, [id, navigate, user]);

    const fetchEvent = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/v1/event/${id}`, {
                withCredentials: true
            });

            if (!response.data || !response.data.data) {
                throw new Error('Invalid response format');
            }

            const eventData = response.data.data;

            // Format date for input field (YYYY-MM-DD)
            const eventDate = new Date(eventData.date);
            const formattedDate = eventDate.toISOString().split('T')[0];

            // Extract time from the date
            const hours = eventDate.getHours().toString().padStart(2, '0');
            const minutes = eventDate.getMinutes().toString().padStart(2, '0');
            const formattedTime = `${hours}:${minutes}`;

            setFormData({
                title: eventData.title || '',
                description: eventData.description || '',
                date: formattedDate,
                time: formattedTime,
                venue: eventData.venue || '',
                category: eventData.category || '',
                ticketPrice: eventData.ticketPrice || 0,
                totalTickets: eventData.totalTickets || 0,
                image: eventData.image || '',
                useImageUrl: false,
                imageUrl: '',
                imagePreview: null,
                imageFile: null
            });
        } catch (err) {
            console.error("Error fetching event:", err);
            setError('Failed to fetch event details: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'ticketPrice' || name === 'totalTickets' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setSubmitting(true);

        try {
            // Combine date and time
            const dateTime = new Date(`${formData.date}T${formData.time}`);

            // Use FormData for file uploads
            const eventFormData = new FormData();
            eventFormData.append('title', formData.title);
            eventFormData.append('description', formData.description);
            eventFormData.append('date', dateTime.toISOString());
            eventFormData.append('venue', formData.venue);
            eventFormData.append('category', formData.category);
            eventFormData.append('ticketPrice', formData.ticketPrice);
            eventFormData.append('totalTickets', formData.totalTickets);

            // Handle image upload
            if (formData.useImageUrl && formData.imageUrl) {
                eventFormData.append('imageUrl', formData.imageUrl);
            } else if (formData.imageFile) {
                eventFormData.append('image', formData.imageFile);
            } else if (formData.image && !formData.useImageUrl) {
                // Keep existing image URL if no new file
                eventFormData.append('imageUrl', formData.image);
            }

            await axios.put(`http://localhost:3000/api/v1/event/${id}`, eventFormData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess('Event updated successfully!');

            // Navigate back to my events page after a short delay
            setTimeout(() => {
                navigate('/my-events');
            }, 1500);

        } catch (err) {
            console.error("Error updating event:", err);
            setError('Failed to update event: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading event data...</div>;
    }

    if (error && !loading) {
        return (
            <div className="event-form-container">
                <div className="error-message">{error}</div>
                <button
                    className="submit-button"
                    onClick={() => navigate('/my-events')}
                    style={{ marginTop: '20px' }}
                >
                    Back to My Events
                </button>
            </div>
        );
    }

    return (
        <div className="event-form-container">
            <h2>Edit Event</h2>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit} className="event-form">
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows="5"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="date">Date</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="time">Time</label>
                        <input
                            type="time"
                            id="time"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <input
                        type="text"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="ticketPrice">Ticket Price ($)</label>
                        <input
                            type="number"
                            id="ticketPrice"
                            name="ticketPrice"
                            min="0"
                            step="0.01"
                            value={formData.ticketPrice}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="totalTickets">Total Tickets</label>
                        <input
                            type="number"
                            id="totalTickets"
                            name="totalTickets"
                            min="1"
                            value={formData.totalTickets}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="image">Event Image</label>

                    {/* Image preview */}
                    {(formData.imagePreview || formData.image) && (
                        <div className="image-preview">
                            <img
                                src={formData.imagePreview || getImageUrl(formData.image)}
                                alt="Event preview"
                                onClick={() => setShowFullImage(true)}
                            />
                        </div>
                    )}

                    {/* Image source selection buttons */}
                    <div className="image-source-buttons">
                        <button
                            type="button"
                            className={`source-select-btn ${!formData.useImageUrl ? 'active' : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, useImageUrl: false }))}
                        >
                            Upload Image
                        </button>
                        <button
                            type="button"
                            className={`source-select-btn ${formData.useImageUrl ? 'active' : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, useImageUrl: true }))}
                        >
                            Image URL
                        </button>
                    </div>

                    {/* Conditional rendering based on selection */}
                    <div className="image-input-container">
                        {formData.useImageUrl ? (
                            <input
                                type="url"
                                id="imageUrl"
                                name="imageUrl"
                                value={formData.imageUrl || ''}
                                placeholder="Enter image URL"
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    imageUrl: e.target.value,
                                    image: e.target.value,
                                    imageFile: null,
                                    imagePreview: null
                                }))}
                            />
                        ) : (
                            <>
                                <input
                                    type="file"
                                    id="image"
                                    name="image"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const previewUrl = URL.createObjectURL(file);
                                            setFormData(prev => ({
                                                ...prev,
                                                imageFile: file,
                                                imagePreview: previewUrl,
                                                imageUrl: ''
                                            }));
                                        }
                                    }}
                                />
                                {formData.image && !formData.imagePreview && !formData.useImageUrl && (
                                    <div className="current-image-info">
                                        Current image: {formData.image.split('/').pop()}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="cancel-button"
                        onClick={() => navigate('/my-events')}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="submit-button"
                        disabled={submitting}
                    >
                        {submitting ? 'Updating...' : 'Update Event'}
                    </button>
                </div>
            </form>

            {/* Full Image Modal */}
            {showFullImage && (
                <div className="full-image-modal" onClick={() => setShowFullImage(false)}>
                    <div className="modal-content">
                        <img
                            src={formData.imagePreview || getImageUrl(formData.image)}
                            alt="Preview"
                        />
                        <button className="close-modal" onClick={(e) => {
                            e.stopPropagation();
                            setShowFullImage(false);
                        }}>×</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditEventPage;