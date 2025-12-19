import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

import './Navbar.css';
const Navbar = () => {
    const { isAuthenticated, isAdmin, isOrganizer, logout } = useAuth();
    const navigate = useNavigate();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Track scroll position
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogoutClick = () => {
        setShowLogoutDialog(true);
    };

    const confirmLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            setShowLogoutDialog(false);
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const cancelLogout = () => {
        setShowLogoutDialog(false);
    };

    return (
        <>
            <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
                <div className="navbar-container">
                    <Link to="/" className="navbar-logo">
                        <span className="logo-emoji">🎟️</span> Event Tickets
                    </Link>

                    <div className="nav-menu">
                        <Link to="/" className="nav-item">Home</Link>

                        {isAuthenticated ? (
                            <>
                                {!isAdmin && !isOrganizer && (
                                    <Link to="/bookings" className="nav-item">My Bookings</Link>
                                )}

                                {isOrganizer && (
                                    <div className="nav-dropdown">
                                        <span className="nav-item">Organizer <i className="fas fa-caret-down"></i></span>
                                        <div className="dropdown-content">
                                            <Link to="/my-events">My Events</Link>
                                            <Link to="/my-events/new">Create Event</Link>
                                            <Link to="/my-events/analytics">Analytics</Link>
                                        </div>
                                    </div>
                                )}

                                {isAdmin && (
                                    <div className="nav-dropdown">
                                        <span className="nav-item">Admin <i className="fas fa-caret-down"></i></span>
                                        <div className="dropdown-content">
                                            <Link to="/admin/events">Manage Events</Link>
                                            <Link to="/admin/users">Manage Users</Link>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <Link to="/profile" className="nav-item">Profile</Link>
                                <Link to="/login" className="nav-item">Login</Link>
                                <Link to="/register" className="nav-item">Register</Link>
                                <button className="logout-btn" onClick={handleLogoutClick}>Logout</button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {showLogoutDialog && (
                <div className="logout-dialog-overlay">
                    <div className="logout-dialog">
                        <h3>Logout Confirmation</h3>
                        <p>Are you sure you want to logout?</p>
                        <div className="logout-dialog-buttons">
                            <button
                                className="logout-confirm-btn"
                                onClick={confirmLogout}
                                disabled={isLoggingOut}
                            >
                                {isLoggingOut ? 'Logging out...' : 'Yes'}
                            </button>
                            <button
                                className="logout-cancel-btn"
                                onClick={cancelLogout}
                                disabled={isLoggingOut}
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;