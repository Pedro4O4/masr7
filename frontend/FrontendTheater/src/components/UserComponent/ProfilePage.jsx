import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user } = useAuth(); // Only destructure user, not setUser
    const [profileImage, setProfileImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [userData, setUserData] = useState(null); // Store user data locally
    const navigate = useNavigate();

    // Fetch current user profile
    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('http://localhost:3000/api/v1/user/profile', {
                withCredentials: true
            });

            const fetchedUserData = response.data.data || response.data;
            setUserData(fetchedUserData); // Store user data in local state instead

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

    // Use local userData state or context user
    const displayUser = userData || user;

    if (isLoading && !displayUser) {
        return <div className="profile-loading">Loading your profile...</div>;
    }

    // Profile view
    return (
        <div className="profile-container">
            {error && <div className="error-message">{error}</div>}

            <div className="profile-header">
                {profileImage ? (
                    <img
                        src={profileImage}
                        alt="Profile"
                        className="profile-avatar"
                        style={{ objectFit: 'cover' }}
                    />
                ) : (
                    <div className="profile-avatar">
                        {displayUser?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                )}
                <h2>{displayUser?.name || "User"}</h2>
                <div className="profile-role">
                    {displayUser?.role || "Standard User"}
                </div>
            </div>

            <div className="profile-details">
                <div className="profile-field email-field">
                    <label>Email:</label>
                    <span>{displayUser?.email || "No email available"}</span>
                </div>
                <div className="profile-field">
                    <label>Role:</label>
                    <span>{displayUser?.role || "Standard User"}</span>
                </div>
                <div className="profile-field">
                    <label>Member Since:</label>
                    <span>{displayUser?.createdAt ? new Date(displayUser.createdAt).toLocaleDateString() : "Unknown"}</span>
                </div>
            </div>

            {displayUser?.role === "System Admin" && (
                <div className="admin-section">
                    <h3>Administration Quick Access</h3>
                    <div className="quick-links">
                        <Link to="/admin/events">Manage Events</Link>
                        <Link to="/admin/users">Manage Users</Link>
                    </div>
                </div>
            )}

            {displayUser?.role === "Organizer" && (
                <div className="organizer-section">
                    <h3>Organizer Tools</h3>
                    <div className="quick-links">
                        <Link to="/my-events">My Events</Link>
                        <Link to="/my-events/new">Create Event</Link>
                        <Link to="/my-events/analytics">Event Analytics</Link>
                    </div>
                </div>
            )}
            {displayUser?.role === "Standard User" && (
                <div className="user-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3 style={{ textAlign: 'center', width: '100%' }}>User Quick Access</h3>
                    <div className="quick-links" style={{ width: '100%', maxWidth: 400 }}>
                        <Link to="/events">Explore Events</Link>
                        <Link to="/bookings">My bookings</Link>
                    </div>
                </div>
            )}
            <button
                className="edit-profile-btn"
                onClick={() => navigate('/profile/edit')}
                style={{ marginTop: '1rem' }}
            >
                Edit Profile
            </button>
            <button
                className="edit-profile-btn"
                onClick={() => navigate('/events') && (user.role === "Organizer"|| user.role === "Standard User")}
                style={{ marginTop: '1rem' }}
            >
               back to events
            </button>
        </div>
    );
};

export default ProfilePage;

