import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Homepage.css';
import Countdown from './countdown.jsx';
import SearchBar from './SearchBar.jsx';
import SocialMedia from './SocialMedia.jsx';

const Homepage = () => {
    const [featuredEvents, setFeaturedEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    // Function to handle search
    const handleSearch = (query) => {
        console.log('Search query:', query);
        // You could redirect to search results page
        // window.location.href = `/search?q=${encodeURIComponent(query)}`;
    };

    useEffect(() => {
        // Fetch featured events from your API
        fetch('/api/v1/events/all ', )
            .then(response => response.json())
            .then(data => {
                setFeaturedEvents(data.length ? data : mockFeaturedEvents);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching events:', error);
                setFeaturedEvents(mockFeaturedEvents);
                setLoading(false);
            });

        // Set categories using mock data (you can replace with API call when available)
        setCategories(mockCategories);

        // Set testimonials using mock data (you can replace with API call when available)
        setTestimonials(mockTestimonials);
    }, []);

    if (loading && !featuredEvents.length) {
        return <div className="loading-indicator">Loading...</div>;
    }

    return (
        <div className="homepage-container">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Experience the Magic of Live Performance</h1>
                    <p className="hero-subtitle">Discover extraordinary events that will leave you breathless</p>
                    <Link to="/events" className="hero-button">Explore Events</Link>
                </div>
            </div>

            {/* Countdown */}
            <Countdown eventDate="2023-12-31T23:59:59" />

            {/* Search Bar */}
            <SearchBar onSearch={handleSearch} />

            {/* Featured Events Section */}
            <section className="featured-section">
                <h2 className="section-title">Featured Shows</h2>
                <div className="featured-events">
                    {featuredEvents.map(event => (
                        <div key={event.id} className="featured-event-card">
                            <div className="event-image">
                                <img src={event.image} alt={event.title} />
                            </div>
                            <div className="event-info">
                                <h3 className="event-title">{event.title}</h3>
                                <p className="event-date">{event.date}</p>
                                <p className="event-location">{event.location}</p>
                                <Link to={`/events/${event.id}`} className="details-button">View Details</Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Categories Section */}
            <section className="categories-section">
                <h2 className="section-title">Discover by Category</h2>
                <div className="categories-grid">
                    {categories.map(category => (
                        <div key={category.id} className="category-card">
                            <img src={category.image} alt={category.name} />
                            <div className="category-overlay">
                                <h3>{category.name}</h3>
                                <Link to={`/category/${category.id}`} className="category-button">Browse</Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Social Media Section */}
            <SocialMedia />

            {/* Newsletter Section */}
            <section className="newsletter-section">
                <div className="newsletter-content">
                    <h2>Stay Updated</h2>
                    <p>Subscribe to our newsletter for the latest shows and exclusive offers</p>
                    <div className="newsletter-form">
                        <input type="email" placeholder="Your email address" className="creative-form-input" />
                        <button className="creative-form-submit">Subscribe</button>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section">
                <h2 className="section-title">What Our Visitors Say</h2>
                <div className="testimonials-slider">
                    {testimonials.map(testimonial => (
                        <div key={testimonial.id} className="testimonial-card">
                            <p className="testimonial-text">"{testimonial.text}"</p>
                            <div className="testimonial-author">
                                <div className="avatar-circle-nav">{testimonial.author[0]}</div>
                                <span>{testimonial.author}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

// Fallback mock data
const mockFeaturedEvents = [
    {
        id: 1,
        title: "Hamilton: An American Musical",
        date: "June 15, 2023 • 7:30 PM",
        location: "Main Stage Theatre",
        image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
    },
    {
        id: 2,
        title: "The Phantom of the Opera",
        date: "June 18, 2023 • 8:00 PM",
        location: "Grand Opera House",
        image: "https://images.unsplash.com/photo-1503095396549-807759245b35?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
    },
    {
        id: 3,
        title: "An Evening with Jazz Masters",
        date: "June 20, 2023 • 6:30 PM",
        location: "Blue Note Lounge",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
    }
];

const mockCategories = [
    {
        id: 1,
        name: "Music",
        image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
    },
    {
        id: 2,
        name: "Theatre",
        image: "https://images.unsplash.com/photo-1503095396549-807759245b35?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
    },
    {
        id: 3,
        name: "Comedy",
        image: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
    },
    {
        id: 4,
        name: "Dance",
        image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
    }
];

const mockTestimonials = [
    {
        id: 1,
        text: "The performance was absolutely breathtaking. The venue is stunning and the staff was extremely helpful.",
        author: "Emma Thompson"
    },
    {
        id: 2,
        text: "Best theater experience I've had in years. Will definitely be coming back for more shows!",
        author: "Michael Brown"
    },
    {
        id: 3,
        text: "From booking tickets to the final curtain call, everything was perfect. Highly recommended!",
        author: "Sarah Johnson"
    }
];

export default Homepage;