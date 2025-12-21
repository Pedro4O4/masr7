"use client";
import React, { useState, useEffect } from 'react';
import api from "@/services/api";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiCalendar, FiUser, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '@/auth/AuthContext';
import EventCard from '@/components/Event Components/EventCard';
import { Event } from '@/types/event';
import '@/components/Event Components/EventList.css';

const EventListPage = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        if (user?.role === "System Admin") {
            router.push('/admin/events');
            return;
        }
        fetchEvents();
    }, [user, router]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await api.get<any>('/event/approved');
            const data = response.data.success ? response.data.data : response.data;
            if (Array.isArray(data)) {
                setEvents(data);
            } else {
                setEvents([]);
            }
        } catch (err: any) {
            console.error("Error fetching events:", err);
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredEvents = events.filter(event =>
        (event.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }
        }
    };

    return (
        <motion.div className="event-list-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="page-background">
                <div className="bg-gradient-orb orb-1"></div>
                <div className="bg-gradient-orb orb-2"></div>
                <div className="bg-gradient-orb orb-3"></div>
            </div>

            <div className="event-list-container">
                <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                    <motion.div className="user-welcome-banner" whileHover={{ scale: 1.01 }} onClick={() => router.push('/profile')}>
                        <div className="welcome-content">
                            <div className="user-avatar">
                                {user?.profilePicture ? <img src={user.profilePicture} alt="Profile" /> : <span>{user?.name?.charAt(0)?.toUpperCase() || '?'}</span>}
                                <div className="avatar-ring"></div>
                            </div>
                            <div className="welcome-text">
                                <h2>Welcome back, <span>{user?.name || 'User'}</span></h2>
                                <p className="user-role">{user?.role}</p>
                            </div>
                        </div>
                        <motion.div className="profile-arrow" whileHover={{ x: 5 }}><FiArrowRight size={20} /></motion.div>
                    </motion.div>

                    <div className="actions-bar">
                        <div className="search-wrapper">
                            <FiSearch className="search-icon" />
                            <input type="text" placeholder="Search events..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
                            {searchTerm && <motion.button className="clear-search" onClick={() => setSearchTerm('')} initial={{ scale: 0 }} animate={{ scale: 1 }} whileTap={{ scale: 0.9 }}>×</motion.button>}
                        </div>

                        <div className="action-buttons">
                            {user?.role === "Organizer" && <Link href="/my-events" className="action-btn primary"><FiCalendar /> <span>My Events</span></Link>}
                            {user?.role === "Standard User" && <Link href="/bookings" className="action-btn secondary"><FiUser /> <span>My Bookings</span></Link>}
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence>
                    {loading && (
                        <motion.div className="loading-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="loading-spinner"><div className="spinner-ring"></div><div className="spinner-ring"></div><div className="spinner-ring"></div></div>
                            <p>Loading amazing events...</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <motion.div className="error-container" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <span className="error-icon">⚠️</span><p>{error}</p><button onClick={fetchEvents} className="retry-btn">Try Again</button>
                    </motion.div>
                )}

                {!loading && !error && (
                    <motion.div className="events-grid" variants={containerVariants} initial="hidden" animate="visible">
                        {filteredEvents.length > 0 ? (
                            filteredEvents.map((event, index) => (
                                <motion.div key={event._id} className="event-card-wrapper" variants={itemVariants}>
                                    <EventCard event={event} index={index} />
                                </motion.div>
                            ))
                        ) : (
                            <motion.div className="no-events" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><span className="no-events-icon">🎭</span><h3>No events found</h3><p>{searchTerm ? `No events matching "${searchTerm}"` : "Check back later for new events"}</p></motion.div>
                        )}
                    </motion.div>
                )}

                {!loading && !error && filteredEvents.length > 0 && (
                    <motion.div className="results-info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}</motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default EventListPage;
