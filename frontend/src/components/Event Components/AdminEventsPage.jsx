// AdminEventsPage.jsx - Redesigned with consistent dark theme
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiCalendar, FiUsers, FiGrid, FiSearch, FiX,
    FiCheck, FiXCircle, FiClock, FiEye, FiRefreshCw,
    FiAlertCircle, FiTrendingUp
} from 'react-icons/fi';
import EventCard from './EventCard';
import './AdminEventsPage.css';

const AdminEventsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.role !== 'System Admin') {
            navigate('/');
            return;
        }

        fetchEvents();
    }, [navigate, user]);

    const fetchEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`http://localhost:3000/api/v1/event/all`, {
                withCredentials: true
            });

            if (response.data) {
                const eventsData = Array.isArray(response.data) ? response.data :
                    (response.data.events || response.data.data || []);
                setEvents(eventsData);
            }
        } catch (err) {
            setError('Failed to fetch events: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    // Filter events based on status and search
    const filteredEvents = useMemo(() => {
        let filtered = events.filter(event => event.status === activeFilter);

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(event =>
                (event.title?.toLowerCase().includes(query)) ||
                (event.description?.toLowerCase().includes(query)) ||
                (event.location?.toLowerCase().includes(query)) ||
                (event.organizer?.name?.toLowerCase().includes(query))
            );
        }

        return filtered;
    }, [events, activeFilter, searchQuery]);

    // Stats counts
    const stats = useMemo(() => ({
        pending: events.filter(e => e.status === 'pending').length,
        approved: events.filter(e => e.status === 'approved').length,
        declined: events.filter(e => e.status === 'declined').length,
        total: events.length
    }), [events]);

    const handleStatusChange = async (eventId, newStatus) => {
        try {
            await axios.put(`http://localhost:3000/api/v1/event/${eventId}/`, {
                status: newStatus
            }, {
                withCredentials: true
            });

            setEvents(events.map(event => {
                if ((event.id || event._id) === eventId) {
                    return { ...event, status: newStatus };
                }
                return event;
            }));
        } catch (err) {
            setError('Failed to update event status: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="admin-events-page">
            {/* Page Header */}
            <motion.div
                className="admin-page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="header-left">
                    <div className="header-icon-wrapper">
                        <FiCalendar />
                    </div>
                    <div>
                        <h1>Event Administration</h1>
                        <p>Review and manage all event submissions</p>
                    </div>
                </div>
                <div className="header-actions">
                    <Link to="/admin/users" className="nav-btn">
                        <FiUsers /> Users
                    </Link>
                    <Link to="/admin/theaters" className="nav-btn">
                        <FiGrid /> Theaters
                    </Link>
                    <Link to="/events" className="nav-btn primary">
                        <FiEye /> View Site
                    </Link>
                    <button className="refresh-btn" onClick={fetchEvents} disabled={loading}>
                        <FiRefreshCw className={loading ? 'spinning' : ''} />
                    </button>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                className="stats-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                <div className="stat-card total">
                    <FiTrendingUp className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Total Events</span>
                    </div>
                </div>
                <div
                    className={`stat-card pending ${activeFilter === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('pending')}
                >
                    <FiClock className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-value">{stats.pending}</span>
                        <span className="stat-label">Pending</span>
                    </div>
                </div>
                <div
                    className={`stat-card approved ${activeFilter === 'approved' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('approved')}
                >
                    <FiCheck className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-value">{stats.approved}</span>
                        <span className="stat-label">Approved</span>
                    </div>
                </div>
                <div
                    className={`stat-card declined ${activeFilter === 'declined' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('declined')}
                >
                    <FiXCircle className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-value">{stats.declined}</span>
                        <span className="stat-label">Declined</span>
                    </div>
                </div>
            </motion.div>

            {/* Search and Filter */}
            <motion.div
                className="controls-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search events by title, description, location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="clear-search" onClick={() => setSearchQuery('')}>
                            <FiX />
                        </button>
                    )}
                </div>

                <div className="filter-tabs">
                    <button
                        className={`tab-btn pending ${activeFilter === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('pending')}
                    >
                        <FiClock /> Pending ({stats.pending})
                    </button>
                    <button
                        className={`tab-btn approved ${activeFilter === 'approved' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('approved')}
                    >
                        <FiCheck /> Approved ({stats.approved})
                    </button>
                    <button
                        className={`tab-btn declined ${activeFilter === 'declined' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('declined')}
                    >
                        <FiXCircle /> Declined ({stats.declined})
                    </button>
                </div>
            </motion.div>

            {/* Error Banner */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        className="error-banner"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <FiAlertCircle />
                        <span>{error}</span>
                        <button onClick={() => setError(null)}><FiX /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading State */}
            {loading && (
                <div className="loading-state">
                    <div className="loading-spinner" />
                    <p>Loading events...</p>
                </div>
            )}

            {/* Events Grid */}
            {!loading && filteredEvents.length > 0 && (
                <motion.div
                    className="events-grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <AnimatePresence>
                        {filteredEvents.map((event, index) => (
                            <motion.div
                                key={event.id || event._id}
                                className="event-admin-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.03 }}
                                whileHover={{ y: -5 }}
                            >
                                <EventCard event={event} />

                                {/* Action Buttons */}
                                <div className="event-admin-actions">
                                    <Link
                                        to={`/events/${event.id || event._id}`}
                                        className="action-btn view"
                                    >
                                        <FiEye /> Details
                                    </Link>

                                    {activeFilter === 'pending' && (
                                        <>
                                            <button
                                                className="action-btn approve"
                                                onClick={() => handleStatusChange(event.id || event._id, 'approved')}
                                            >
                                                <FiCheck /> Approve
                                            </button>
                                            <button
                                                className="action-btn decline"
                                                onClick={() => handleStatusChange(event.id || event._id, 'declined')}
                                            >
                                                <FiXCircle /> Decline
                                            </button>
                                        </>
                                    )}

                                    {activeFilter === 'approved' && (
                                        <button
                                            className="action-btn decline"
                                            onClick={() => handleStatusChange(event.id || event._id, 'declined')}
                                        >
                                            <FiXCircle /> Revoke
                                        </button>
                                    )}

                                    {activeFilter === 'declined' && (
                                        <button
                                            className="action-btn approve"
                                            onClick={() => handleStatusChange(event.id || event._id, 'approved')}
                                        >
                                            <FiCheck /> Approve
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Empty State */}
            {!loading && filteredEvents.length === 0 && (
                <motion.div
                    className="empty-state"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <FiCalendar className="empty-icon" />
                    <h2>No {activeFilter} Events</h2>
                    <p>
                        {searchQuery
                            ? 'No events match your search criteria'
                            : `There are currently no events with ${activeFilter} status.`
                        }
                    </p>
                </motion.div>
            )}
        </div>
    );
};

export default AdminEventsPage;