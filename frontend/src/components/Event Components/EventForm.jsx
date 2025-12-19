import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import './EventForm.css';
import { getImageUrl } from '../../utils/imageHelper';
import EventSeatConfigurator from './EventSeatConfigurator';
import { FiLayout } from 'react-icons/fi';

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
        imageUrl: '',
        hasTheaterSeating: false,
        theaterId: '',
        seatPricing: {} // { type: price }
    });

    const [theaters, setTheaters] = useState([]);
    const [selectedTheaterLayout, setSelectedTheaterLayout] = useState(null);
    const [showSeatConfigurator, setShowSeatConfigurator] = useState(false);
    const [eventSeatConfig, setEventSeatConfig] = useState([]); // Array of overrides

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

        // Fetch available theaters
        const fetchTheaters = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/v1/theater?active=true', { withCredentials: true });
                if (response.data.success) {
                    setTheaters(response.data.data);
                }
            } catch (err) {
                console.error("Error fetching theaters:", err);
            }
        };

        fetchTheaters();
    }, [user, navigate]);

    useEffect(() => {
        return () => {
            if (formData.imagePreview) {
                URL.revokeObjectURL(formData.imagePreview);
            }
        };
    }, [formData.imagePreview]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (name === 'totalTickets' || name === 'ticketPrice' ? parseFloat(value) || '' : value)
        }));

        if (name === 'theaterId' && value) {
            handleTheaterChange(value);
        }
    };

    const handleTheaterChange = async (theaterId) => {
        try {
            const response = await axios.get(`http://localhost:3000/api/v1/theater/${theaterId}`, { withCredentials: true });
            if (response.data.success) {
                const theater = response.data.data;
                setSelectedTheaterLayout(theater.layout);
                updatePricingCategories(theater.layout, []);

                // Auto-set totalTickets from theater capacity
                if (theater.totalSeats) {
                    setFormData(prev => ({
                        ...prev,
                        totalTickets: theater.totalSeats
                    }));
                }
            }
        } catch (err) {
            console.error("Error fetching theater layout:", err);
        }
    };

    const updatePricingCategories = (layout, currentOverrides) => {
        // Extract unique seat categories from layout AND overrides
        const categories = new Set(['standard']);

        // 1. From base theater layout
        if (layout.seatCategories) {
            Object.values(layout.seatCategories).forEach(cat => categories.add(cat));
        }

        // 2. From event-specific overrides
        if (currentOverrides) {
            currentOverrides.forEach(cfg => categories.add(cfg.seatType));
        }

        // Initialize seat pricing for these categories (preserve existing values)
        setFormData(prev => {
            const newPricing = { ...prev.seatPricing };
            categories.forEach(cat => {
                if (newPricing[cat] === undefined) {
                    newPricing[cat] = prev.ticketPrice || 0;
                }
            });
            return { ...prev, seatPricing: newPricing };
        });
    };

    const handleSeatConfigSave = (newConfig, newPricing) => {
        setEventSeatConfig(newConfig);

        // Convert pricing array to object format
        if (newPricing && newPricing.length > 0) {
            const pricingObj = {};
            newPricing.forEach(p => {
                pricingObj[p.seatType] = p.price;
            });
            setFormData(prev => ({ ...prev, seatPricing: pricingObj }));
        }

        setShowSeatConfigurator(false);
    };

    const handlePriceChange = (category, price) => {
        setFormData(prev => ({
            ...prev,
            seatPricing: {
                ...prev.seatPricing,
                [category]: parseFloat(price) || 0
            }
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

            // Ticket price: use 0 for theater seating (prices are per-seat), otherwise use form value
            const ticketPrice = formData.hasTheaterSeating ? 0 : (parseFloat(formData.ticketPrice) || 0);
            eventFormData.append('ticketPrice', ticketPrice);

            eventFormData.append('totalTickets', parseInt(formData.totalTickets) || 0);
            eventFormData.append('remainingTickets', parseInt(formData.totalTickets) || 0);

            // Add theater-based fields
            eventFormData.append('hasTheaterSeating', formData.hasTheaterSeating);
            if (formData.hasTheaterSeating && formData.theaterId) {
                eventFormData.append('theater', formData.theaterId);

                // Format seat pricing as array for backend
                const seatPricingArray = Object.entries(formData.seatPricing).map(([type, price]) => ({
                    seatType: type,
                    price: price
                }));
                eventFormData.append('seatPricing', JSON.stringify(seatPricingArray));

                // Add seat config if any
                if (eventSeatConfig && eventSeatConfig.length > 0) {
                    eventFormData.append('seatConfig', JSON.stringify(eventSeatConfig));
                }
            }

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

    // Full Page Configurator View
    if (showSeatConfigurator && selectedTheaterLayout) {
        return (
            <EventSeatConfigurator
                theaterLayout={selectedTheaterLayout}
                initialSeatConfig={eventSeatConfig}
                initialPricing={formData.seatPricing}
                onSave={handleSeatConfigSave}
                onCancel={() => setShowSeatConfigurator(false)}
            />
        );
    }

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

                <div className="form-group checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            name="hasTheaterSeating"
                            checked={formData.hasTheaterSeating}
                            onChange={handleChange}
                        />
                        Use Theater Seating
                    </label>
                </div>

                {formData.hasTheaterSeating && (
                    <>
                        <div className="form-group animate-in">
                            <label htmlFor="theaterId">Select Theater*</label>
                            <select
                                id="theaterId"
                                name="theaterId"
                                value={formData.theaterId}
                                onChange={handleChange}
                                required={formData.hasTheaterSeating}
                            >
                                <option value="">-- Choose a Theater --</option>
                                {theaters.map(theater => (
                                    <option key={theater._id} value={theater._id}>
                                        {theater.name} ({theater.totalSeats} seats)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedTheaterLayout && (
                            <div className="form-group pricing-group animate-in">
                                <div className="pricing-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ marginBottom: 0 }}>Seat Tier Pricing*</label>
                                        <p className="help-text" style={{ marginBottom: 0 }}>Set prices for each category.</p>
                                    </div>
                                    <button
                                        type="button"
                                        className="edit-seats-btn"
                                        onClick={() => setShowSeatConfigurator(true)}
                                        style={{
                                            background: 'rgba(139, 92, 246, 0.2)',
                                            color: '#c4b5fd',
                                            border: '1px solid rgba(139, 92, 246, 0.4)',
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        <FiLayout /> Configure Layout
                                    </button>
                                </div>
                                <div className="pricing-grid">
                                    {Object.keys(formData.seatPricing).map(type => (
                                        <div key={type} className={`pricing-item type-${type}`}>
                                            <span className="type-label">{type.toUpperCase()}</span>
                                            <div className="price-input-wrapper">
                                                <span className="currency">$</span>
                                                <input
                                                    type="number"
                                                    value={formData.seatPricing[type]}
                                                    onChange={(e) => handlePriceChange(type, e.target.value)}
                                                    placeholder="Price"
                                                    min="0"
                                                    step="0.01"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                <div className="form-group">
                    <label htmlFor="totalTickets">{formData.hasTheaterSeating ? 'Capacity (Auto-set from Theater)' : 'Available Tickets*'}</label>
                    <input
                        type="number"
                        id="totalTickets"
                        name="totalTickets"
                        value={formData.totalTickets}
                        onChange={handleChange}
                        required
                        min="1"
                        placeholder="Enter number of available tickets"
                        disabled={formData.hasTheaterSeating}
                    />
                </div>

                {/* Only show ticket price when NOT using theater seating */}
                {!formData.hasTheaterSeating && (
                    <div className="form-group">
                        <label htmlFor="ticketPrice">Ticket Price ($)*</label>
                        <input
                            type="number"
                            id="ticketPrice"
                            name="ticketPrice"
                            value={formData.ticketPrice}
                            onChange={handleChange}
                            required={!formData.hasTheaterSeating}
                            step="0.01"
                            min="0"
                            placeholder="Enter ticket price"
                        />
                    </div>
                )}
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

            {
                showFullImage && (
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
                )
            }

            {/* Configurator now handled as full page return above */}
        </div >
    );
};

export default EventForm;