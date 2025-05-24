// frontend/FrontendTheater/src/components/shared/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { currentUser, isAuthenticated, isAdmin, isOrganizer, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <span className="logo-emoji">🎟️</span> Event Tickets
                </Link>

                <div className="nav-menu">
                    <Link to="/" className="nav-item">Home</Link>

                    {isAuthenticated ? (
                        <>
                            {/* Standard user links */}
                            {!isAdmin && !isOrganizer && (
                                <Link to="/bookings" className="nav-item">My Bookings</Link>
                            )}

                            {/* Organizer links */}
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

                            {/* Admin links */}
                            {isAdmin && (
                                <div className="nav-dropdown">
                                    <span className="nav-item">Admin <i className="fas fa-caret-down"></i></span>
                                    <div className="dropdown-content">
                                        <Link to="/admin/events">Manage Events</Link>
                                        <Link to="/admin/users">Manage Users</Link>
                                    </div>
                                </div>
                            )}):(

                            {/* Profile and Logout - Available for all authenticated users */}

                        </>
                    ): (
                        <>



                            <Link to="/login" className="nav-item">Login</Link>
                            <Link to="/register" className="nav-item">Register</Link>
                            <Link to="/profile" className="nav-item">Profile</Link>
                            <button className="logout-btn" onClick={handleLogout}>Logout</button>

                            </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;