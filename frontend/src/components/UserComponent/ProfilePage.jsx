import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiUser, FiMail, FiCalendar, FiEdit, FiArrowLeft,
    FiActivity, FiAward, FiTrendingUp, FiDollarSign,
    FiUsers, FiCheckCircle, FiClock, FiBarChart2,
    FiGrid, FiPlus, FiPieChart, FiSettings
} from 'react-icons/fi';
import axios from 'axios';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user } = useAuth();
    const [profileImage, setProfileImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserProfile();
        fetchStats();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('http://localhost:3000/api/v1/user/profile', {
                withCredentials: true
            });

            const fetchedUserData = response.data.data || response.data;
            setUserData(fetchedUserData);

            if (fetchedUserData.profilePicture) {
                setProfileImage(fetchedUserData.profilePicture);
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
            setError("Failed to load profile data");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        // Stats would come from API - using placeholder data for now
        try {
            // These would be real API calls based on role
        } catch (err) {
            console.log("Stats not available");
        }
    };

    const displayUser = userData || user;

    // Role-specific stats data
    const getStatsForRole = () => {
        const role = displayUser?.role;

        if (role === "Standard User") {
            return [
                { label: "Events Attended", value: "12", icon: FiCalendar, color: "#8B5CF6" },
                { label: "Upcoming", value: "3", icon: FiClock, color: "#22D3EE" },
                { label: "Total Bookings", value: "15", icon: FiCheckCircle, color: "#10B981" }
            ];
        } else if (role === "Organizer") {
            return [
                { label: "My Events", value: "8", icon: FiCalendar, color: "#8B5CF6" },
                { label: "Tickets Sold", value: "342", icon: FiUsers, color: "#22D3EE" },
                { label: "Revenue", value: "$4.2K", icon: FiDollarSign, color: "#10B981" },
                { label: "Pending", value: "2", icon: FiClock, color: "#F59E0B" }
            ];
        } else if (role === "System Admin") {
            return [
                { label: "Total Users", value: "156", icon: FiUsers, color: "#8B5CF6" },
                { label: "Pending Approvals", value: "5", icon: FiClock, color: "#F59E0B" },
                { label: "Active Events", value: "24", icon: FiCalendar, color: "#22D3EE" },
                { label: "Total Revenue", value: "$12.8K", icon: FiDollarSign, color: "#10B981" }
            ];
        }
        return [];
    };

    // Role-specific quick actions
    const getQuickActions = () => {
        const role = displayUser?.role;

        if (role === "Standard User") {
            return [
                { label: "Explore Events", icon: FiGrid, path: "/events", variant: "primary" },
                { label: "My Bookings", icon: FiCalendar, path: "/bookings", variant: "secondary" }
            ];
        } else if (role === "Organizer") {
            return [
                { label: "My Events", icon: FiCalendar, path: "/my-events", variant: "primary" },
                { label: "Create Event", icon: FiPlus, path: "/my-events/new", variant: "success" },
                { label: "Analytics", icon: FiPieChart, path: "/my-events/analytics", variant: "secondary" }
            ];
        } else if (role === "System Admin") {
            return [
                { label: "Manage Events", icon: FiCalendar, path: "/admin/events", variant: "primary" },
                { label: "Manage Users", icon: FiUsers, path: "/admin/users", variant: "secondary" },
                { label: "Theaters", icon: FiSettings, path: "/admin/theaters", variant: "tertiary" }
            ];
        }
        return [];
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
        }
    };

    if (isLoading && !displayUser) {
        return (
            <div className="profile-page">
                <div className="profile-loading">
                    <div className="loading-spinner">
                        <div className="spinner-ring"></div>
                        <div className="spinner-ring"></div>
                        <div className="spinner-ring"></div>
                    </div>
                    <p>Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="profile-page"
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

            <motion.div
                className="profile-container"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {error && <div className="error-message">{error}</div>}

                {/* Profile Header Card */}
                <motion.div className="profile-card profile-header-card" variants={itemVariants}>
                    <div className="profile-header">
                        <motion.div
                            className="avatar-container"
                            whileHover={{ scale: 1.05 }}
                        >
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt="Profile"
                                    className="profile-avatar"
                                />
                            ) : (
                                <div className="profile-avatar">
                                    {displayUser?.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                            )}
                            <div className="avatar-ring"></div>
                            <div className="avatar-status online"></div>
                        </motion.div>

                        <div className="profile-info">
                            <h1 className="profile-name">{displayUser?.name || "User"}</h1>
                            <span className={`role-badge role-${displayUser?.role?.toLowerCase().replace(' ', '-')}`}>
                                {displayUser?.role || "Standard User"}
                            </span>
                        </div>
                    </div>

                    <div className="profile-details">
                        <div className="detail-item">
                            <FiMail className="detail-icon" />
                            <span>{displayUser?.email || "No email"}</span>
                        </div>
                        <div className="detail-item">
                            <FiCalendar className="detail-icon" />
                            <span>Joined {displayUser?.createdAt ? new Date(displayUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Unknown"}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions Section */}
                <motion.div className="actions-section" variants={itemVariants}>
                    <h2 className="section-title">
                        <FiActivity className="section-icon" />
                        Quick Actions
                    </h2>
                    <div className="actions-grid">
                        {getQuickActions().map((action, index) => (
                            <motion.div
                                key={action.label}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Link
                                    to={action.path}
                                    className={`action-card action-${action.variant}`}
                                >
                                    <action.icon className="action-icon" />
                                    <span>{action.label}</span>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Profile Buttons */}
                <motion.div className="profile-buttons" variants={itemVariants}>
                    <motion.button
                        className="profile-btn primary"
                        onClick={() => navigate('/profile/edit')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <FiEdit />
                        Edit Profile
                    </motion.button>
                    <motion.button
                        className="profile-btn secondary"
                        onClick={() => navigate('/events')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <FiArrowLeft />
                        Back to Events
                    </motion.button>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default ProfilePage;
