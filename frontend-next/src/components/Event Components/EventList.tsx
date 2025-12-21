'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiCalendar, FiUser, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '@/auth/AuthContext';
import api from '@/services/api';
import EventCard from './EventCard';
import { Event } from '@/types/event';
import './EventList.css';

const EventList = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (user?.role === "System Admin") {
            router.push('/admin/events');
            return;
        }

        fetchEvents();
    }, [router, user]);

    useEffect(() => {
        if (events.length > 0) {
            const filtered = events.filter(event =>
                (event.title || event.name || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredEvents(filtered);
        }
    }, [searchTerm, events]);

    const fetchEvents = async () => {
        try {
            const response = await api.get('/event/approved');

            const data = response.data;
            let eventsData: Event[] = [];

            if (Array.isArray(data)) {
                eventsData = data;
            } else if (data?.events && Array.isArray(data.events)) {
                eventsData = data.events;
            } else if (data?.data && Array.isArray(data.data)) {
                eventsData = data.data;
            }

            setEvents(eventsData);
            setFilteredEvents(eventsData);
        } catch (err: any) {
            console.error("Error fetching events:", err);
            if (err.response && [401, 403, 405].includes(err.response.status)) {
                router.push('/login');
            } else {
                setError(err.response?.data?.message || err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <motion.div
            className="event-list-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Animated Background */}
            <div className="page-background">
                <div className="bg-gradient-orb orb-1"></div>
                <div className="bg-gradient-orb orb-2"></div>
                <div className="bg-gradient-orb orb-3"></div>
            </div>

            <div className="event-list-container">
                {/* Header Section */}
                <motion.div
                    className="page-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    {/* User Welcome Banner */}
                    <motion.div
                        className="user-welcome-banner"
                        whileHover={{ scale: 1.01 }}
                        onClick={() => router.push('/profile')}
                    >
                        <div className="welcome-content">
                            <div className="user-avatar">
                                {(user as any)?.profilePicture ? (
                                    <img src={(user as any).profilePicture} alt="Profile" />
                                ) : (
                                    <span>{user?.name?.charAt(0)?.toUpperCase() || '?'}</span>
                                )}
                                <div className="avatar-ring"></div>
                            </div>
                            <div className="welcome-text">
                                <h2>Welcome back, <span>{user?.name || 'User'}</span></h2>
                                <p className="user-role">{user?.role}</p>
                            </div>
                        </div>
                        <motion.div
                            className="profile-arrow"
                            whileHover={{ x: 5 }}
                        >
                            <FiArrowRight size={20} />
                        </motion.div>
                    </motion.div>

                    {/* Search & Actions Bar */}
                    <div className="actions-bar">
                        <div className="search-wrapper">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search events..."
                                value={searchTerm}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            {searchTerm && (
                                <motion.button
                                    className="clear-search"
                                    onClick={() => setSearchTerm('')}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    ×
                                </motion.button>
                            )}
                        </div>

                        <div className="action-buttons">
                            {user?.role === "Organizer" && (
                                <Link href="/my-events" className="action-btn primary">
                                    <FiCalendar />
                                    <span>My Events</span>
                                </Link>
                            )}
                            {user?.role === "Standard User" && (
                                <Link href="/bookings" className="action-btn secondary">
                                    <FiUser />
                                    <span>My Bookings</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Loading State */}
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            className="loading-container"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="loading-spinner">
                                <div className="spinner-ring"></div>
                                <div className="spinner-ring"></div>
                                <div className="spinner-ring"></div>
                            </div>
                            <p>Loading amazing events...</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error State */}
                {error && (
                    <motion.div
                        className="error-container"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <span className="error-icon">⚠️</span>
                        <p>{error}</p>
                        <button onClick={fetchEvents} className="retry-btn">
                            Try Again
                        </button>
                    </motion.div>
                )}

                {/* Events Grid */}
                {!loading && !error && (
                    <motion.div
                        className="events-grid"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {filteredEvents.length > 0 ? (
                            filteredEvents.map((event, index) => (
                                <motion.div
                                    key={event._id}
                                    className="event-card-wrapper"
                                    variants={itemVariants}
                                >
                                    <EventCard event={event} index={index} />
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                className="no-events"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <span className="no-events-icon">🎭</span>
                                <h3>No events found</h3>
                                <p>
                                    {searchTerm
                                        ? `No events matching "${searchTerm}"`
                                        : "Check back later for new events"
                                    }
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* Results Count */}
                {!loading && !error && filteredEvents.length > 0 && (
                    <motion.div
                        className="results-info"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default EventList;
