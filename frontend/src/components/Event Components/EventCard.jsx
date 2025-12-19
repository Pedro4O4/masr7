// EventCard.jsx - Enhanced with Framer Motion & Modern Design
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { FiCalendar, FiMapPin, FiTag, FiX, FiMaximize2 } from 'react-icons/fi';
import './EventCard.css';
import { getImageUrl } from '../../utils/imageHelper';

const EventCard = ({ event, index = 0 }) => {
    const [showFullImage, setShowFullImage] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return 'TBA';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getTicketStatus = () => {
        const remaining = event.remainingTickets ?? event.totalTickets ?? 0;
        if (remaining === 0) return { text: 'Sold Out', class: 'sold-out' };
        if (remaining < 20) return { text: `${remaining} left!`, class: 'limited' };
        return { text: `${remaining} available`, class: 'available' };
    };

    const ticketStatus = getTicketStatus();

    return (
        <>
            <motion.div
                className="event-card-modern"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: [0.25, 0.46, 0.45, 0.94]
                }}
                whileHover={{
                    y: -8,
                    transition: { duration: 0.3, ease: "easeOut" }
                }}
                whileTap={{ scale: 0.98 }}
            >
                {/* Image Container */}
                <div
                    className="card-image-wrapper"
                    onClick={() => setShowFullImage(true)}
                >
                    {/* Skeleton Loader */}
                    {!imageLoaded && (
                        <div className="image-skeleton">
                            <div className="skeleton-shimmer"></div>
                        </div>
                    )}

                    <motion.img
                        src={getImageUrl(event.image)}
                        alt={event.title}
                        className={`card-image ${imageLoaded ? 'loaded' : ''}`}
                        onLoad={() => setImageLoaded(true)}
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    />

                    {/* Gradient Overlay */}
                    <div className="image-gradient-overlay"></div>

                    {/* Ticket Status Badge */}
                    <div className={`ticket-badge ${ticketStatus.class}`}>
                        {ticketStatus.text}
                    </div>

                    {/* Expand Icon */}
                    <motion.div
                        className="expand-icon"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1, scale: 1.1 }}
                    >
                        <FiMaximize2 size={20} />
                    </motion.div>
                </div>

                {/* Card Content */}
                <div className="card-content">
                    <h3 className="card-title">{event.title || event.name}</h3>

                    <div className="card-meta">
                        {event.date && (
                            <div className="meta-item">
                                <FiCalendar className="meta-icon" />
                                <span>{formatDate(event.date)}</span>
                            </div>
                        )}

                        {event.location && (
                            <div className="meta-item">
                                <FiMapPin className="meta-icon" />
                                <span>{event.location}</span>
                            </div>
                        )}

                        {event.category && (
                            <div className="meta-item category-tag">
                                <FiTag className="meta-icon" />
                                <span>{event.category}</span>
                            </div>
                        )}
                    </div>

                    {/* Price Tag */}
                    {event.ticketPrice !== undefined && (
                        <div className="price-section">
                            <span className="price-label">From</span>
                            <span className="price-value">
                                ${event.ticketPrice?.toFixed(2) || '0.00'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Glow Effect */}
                <div className="card-glow"></div>
            </motion.div>

            {/* Full Image Modal */}
            <AnimatePresence>
                {showFullImage && (
                    <motion.div
                        className="image-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowFullImage(false)}
                    >
                        <motion.div
                            className="image-modal-content"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={getImageUrl(event.image)}
                                alt={event.title}
                                className="modal-image"
                            />
                            <motion.button
                                className="modal-close-btn"
                                onClick={() => setShowFullImage(false)}
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <FiX size={24} />
                            </motion.button>
                            <div className="modal-title">{event.title}</div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

EventCard.propTypes = {
    event: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        name: PropTypes.string,
        date: PropTypes.string,
        location: PropTypes.string,
        description: PropTypes.string,
        ticketPrice: PropTypes.number,
        totalTickets: PropTypes.number,
        remainingTickets: PropTypes.number,
        category: PropTypes.string,
        image: PropTypes.string,
        status: PropTypes.string
    }).isRequired,
    index: PropTypes.number
};

export default EventCard;