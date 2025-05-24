import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import axios from 'axios';
import './UpdateProfilePage.css';

const UpdateProfilePage = () => {
    const { user, updateUser } = useAuth(); // Change to use updateUser instead of setUser
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        profilePicture: ''
    });

    const [profileImage, setProfileImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Initialize form with current user data
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                profilePicture: user.profilePicture || ''
            });

            if (user.profilePicture) {
                setProfileImage(user.profilePicture);
            }
        } else {
            // If no user data, redirect to profile
            navigate('/profile');
        }
    }, [user, navigate]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
                setFormData(prev => ({
                    ...prev,
                    profilePicture: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            setIsLoading(true);

            const response = await axios.put(
                'http://localhost:3000/api/v1/user/profile',
                formData,
                { withCredentials: true }
            );

            // Get the updated user data from response
            const updatedUserData = response.data.data || response.data;

            // Update the auth context, if updateUser function exists
            if (typeof updateUser === 'function') {
                updateUser(updatedUserData);
            }

            // Navigate back to profile page
            navigate('/profile');
        } catch (err) {
            console.error("Profile update error:", err);
            setError('Failed to update profile: ' +
                (err.response?.data?.message || err.message || 'Unknown error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/profile');
    };

    // Rest of the component remains the same
    return (
        <div className="update-profile-container">
            <h2>Update Your Profile</h2>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="update-profile-form">
                <div className="form-group">
                    <label>Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        minLength="3"
                        maxLength="30"
                    />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Profile Picture</label>
                    <input
                        type="file"
                        onChange={handleImageUpload}
                        accept="image/*"
                    />
                    {profileImage && (
                        <img
                            src={profileImage}
                            alt="Profile Preview"
                            style={{width: '100px', height: '100px', objectFit: 'cover', marginTop: '10px'}}
                        />
                    )}
                </div>

                <div className="form-buttons">
                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="save-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateProfilePage;