"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/auth/AuthContext';

import './Navbar.css';

const Navbar: React.FC = () => {
    const { user, isAuthenticated, isAdmin, isOrganizer, logout } = useAuth();
    const router = useRouter();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [scrolled, setScrolled] = useState(false);

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
            router.push('/login');
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
                    <Link href="/" className="navbar-logo">
                        <span className="logo-emoji">🎟️</span> Event Tickets
                    </Link>

                    <div className="nav-menu">
                        <Link href="/" className="nav-item">Home</Link>

                        {isAuthenticated ? (
                            <>
                                {!isAdmin && !isOrganizer && (
                                    <div className="nav-dropdown">
                                        <span className="nav-item">User <i className="fas fa-caret-down"></i></span>
                                        <div className="dropdown-content">
                                            <Link href="/events">Explore Events</Link>
                                            <Link href="/bookings">My Bookings</Link>
                                        </div>
                                    </div>
                                )}

                                {isOrganizer && (
                                    <div className="nav-dropdown">
                                        <span className="nav-item">Organizer <i className="fas fa-caret-down"></i></span>
                                        <div className="dropdown-content">
                                            <Link href="/my-events">My Events</Link>
                                            <Link href="/my-events/new">Create Event</Link>
                                            <Link href="/my-events/analytics">Analytics</Link>
                                        </div>
                                    </div>
                                )}

                                {isAdmin && (
                                    <div className="nav-dropdown">
                                        <span className="nav-item">Admin <i className="fas fa-caret-down"></i></span>
                                        <div className="dropdown-content">
                                            <Link href="/admin/events">Manage Events</Link>
                                            <Link href="/admin/users">Manage Users</Link>
                                            <Link href="/admin/theaters">Manage Theaters</Link>
                                        </div>
                                    </div>
                                )}

                                <Link href="/profile" className="nav-item profile-nav">
                                    {(user as any)?.profilePicture ? (
                                        <img src={(user as any).profilePicture} alt="Profile" className="nav-avatar" />
                                    ) : (
                                        <div className="nav-avatar-placeholder">
                                            {user?.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                    <span>Profile</span>
                                </Link>
                                <button className="logout-btn" onClick={handleLogoutClick}>Logout</button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="nav-item">Login</Link>
                                <Link href="/register" className="nav-item">Register</Link>
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
