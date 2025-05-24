// Modify your EventCard.jsx component:
import { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './EventCard.css';
import { getImageUrl } from '../../utils/imageHelper';

const EventCard = ({ event }) => {
    const { _id, title, remainingTickets } = event;
    const [isHolding, setIsHolding] = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);

    const handleMouseDown = () => setIsHolding(true);
    const handleMouseUp = () => setIsHolding(false);
    const handleMouseLeave = () => setIsHolding(false);

    return (
        <>
            <div
                className={`event-card ${isHolding ? 'image-enlarged' : ''}`}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                <div className="event-image-container" onClick={() => setShowFullImage(true)}>
                    <img
                        src={getImageUrl(event.image)}
                        alt={event.title}
                        className="event-image"
                    />
                    <div className="image-overlay">
                        <span className="view-full">Click to view full image</span>
                    </div>
                </div>

                <div className="event-info">
                    <h3 className="event-title">{title}</h3>
                    {typeof remainingTickets !== 'undefined' && (
                        <p className="event-tickets">
                            🎟️ {remainingTickets > 0 ? `${remainingTickets} tickets remaining` : 'Sold Out'}
                        </p>
                    )}
                </div>
            </div>

            {showFullImage && (
                <div className="full-image-modal" onClick={() => setShowFullImage(false)}>
                    <div className="modal-content">
                        <img src={getImageUrl(event.image)} alt={event.title} />
                        <button className="close-modal">×</button>
                    </div>
                </div>
            )}
        </>
    );
};
EventCard.propTypes = {
    event: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        date: PropTypes.string,
        location: PropTypes.string,
        description: PropTypes.string,
        ticketPrice: PropTypes.number,
        totalTickets: PropTypes.number,
        remainingTickets: PropTypes.number,
        category: PropTypes.string,
        image: PropTypes.string,
        status: PropTypes.string
    }).isRequired
};

export default EventCard;