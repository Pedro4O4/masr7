import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import './EventForm.css';
import './EventDetailPage.css';
import { getImageUrl } from '../../utils/imageHelper';

const EventForm = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        category: '',
        ticketPrice: '',
        totalTickets: '',
        imageFile: null,
        imagePreview: null,
        image: '',
        useImageUrl: false,
        imageUrl: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showFullImage, setShowFullImage] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.role !== 'Organizer') {
            navigate('/events');

        }
    }, [user, navigate]);

    useEffect(() => {
        return () => {
            if (formData.imagePreview) {
                URL.revokeObjectURL(formData.imagePreview);
            }
        };
    }, [formData.imagePreview]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'totalTickets' || name === 'ticketPrice' ? parseFloat(value) || '' : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            // Create FormData instance for multipart/form-data
            const eventFormData = new FormData();

            // Add all text fields to FormData
            eventFormData.append('title', formData.title);
            eventFormData.append('description', formData.description);
            eventFormData.append('date', formData.date);
            eventFormData.append('location', formData.location);
            eventFormData.append('category', formData.category);
            eventFormData.append('ticketPrice', parseFloat(formData.ticketPrice));
            eventFormData.append('totalTickets', parseInt(formData.totalTickets));
            eventFormData.append('remainingTickets', parseInt(formData.totalTickets));

            // Handle image based on the selected option
            if (formData.useImageUrl && formData.imageUrl) {
                // When URL option is selected, use the imageUrl field
                eventFormData.append('imageUrl', formData.imageUrl);
            } else if (formData.imageFile) {
                // When file upload option is selected, use the file
                eventFormData.append('image', formData.imageFile);
            } else if (formData.image && !formData.useImageUrl) {
                // Existing image path if no new image is selected
                eventFormData.append('imageUrl', formData.image);
            }

            // Create new event
            const response = await axios.post('http://localhost:3000/api/v1/event', eventFormData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Event created:', response.data);
            navigate('/my-events');
        } catch (err) {
            console.error("Error saving event:", err);
            if (err.response && [401, 403, 405].includes(err.response.status)) {
                navigate('/login');
            } else {
                setError('Failed to save event. ' + (err.response?.data?.message || err.message));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="event-form-container">
            <h2>Create New Event</h2>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="event-form">
                <div className="form-group">
                    <label htmlFor="title">Event Title*</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Enter event title"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description*</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows="4"
                        placeholder="Enter event description"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="date">Date*</label>
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
                    <label htmlFor="location">Location*</label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                        placeholder="Enter event location"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category">Category*</label>
                    <input
                        type="text"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        placeholder="Enter event category"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="totalTickets">Available Tickets*</label>
                    <input
                        type="number"
                        id="totalTickets"
                        name="totalTickets"
                        value={formData.totalTickets}
                        onChange={handleChange}
                        required
                        min="1"
                        placeholder="Enter number of available tickets"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="ticketPrice">Ticket Price ($)*</label>
                    <input
                        type="number"
                        id="ticketPrice"
                        name="ticketPrice"
                        value={formData.ticketPrice}
                        onChange={handleChange}
                        required
                        step="0.01"
                        min="0"
                        placeholder="Enter ticket price"
                    />
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
                    <button type="button" onClick={() => navigate('/my-events')} className="cancel-button">
                        Cancel
                    </button>
                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Event'}
                    </button>
                </div>
            </form>

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

export default EventForm;