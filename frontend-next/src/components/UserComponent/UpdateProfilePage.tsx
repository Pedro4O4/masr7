'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/auth/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiCamera, FiCheck, FiX, FiArrowLeft, FiImage } from 'react-icons/fi';
import api from '@/services/api';
import './UpdateProfilePage.css';

interface FormData {
    name: string;
    email: string;
    profilePicture: string;
}

const UpdateProfilePage = () => {
    const { user, updateUser } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        profilePicture: ''
    });

    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    // Initialize form with current user data
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                profilePicture: (user as any).profilePicture || ''
            });

            if ((user as any).profilePicture) {
                setProfileImage((user as any).profilePicture);
            }
        } else {
            // If no user data, redirect to profile
            router.push('/profile');
        }
    }, [user, router]);

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setProfileImage(result);
                setFormData(prev => ({
                    ...prev,
                    profilePicture: result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        try {
            setIsLoading(true);

            await api.put('/user/profile', formData);

            // Update global auth state immediately
            updateUser(formData);

            // Navigate back to profile page
            router.push('/profile');
        } catch (err: any) {
            console.error("Profile update error:", err);
            setError('Failed to update profile: ' +
                (err.response?.data?.message || err.message || 'Unknown error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/profile');
    };

    return (
        <div className="update-profile-container">
            {/* Animated Background */}
            <div className="page-background">
                <div className="bg-gradient-orb orb-1"></div>
                <div className="bg-gradient-orb orb-2"></div>
                <div className="bg-gradient-orb orb-3"></div>
            </div>

            <motion.div
                className="update-profile-wrapper"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
            >
                <div className="update-header">
                    <motion.button
                        className="back-btn"
                        onClick={handleCancel}
                        whileHover={{ x: -3 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FiArrowLeft />
                    </motion.button>
                    <h2>Edit Profile</h2>
                    <div style={{ width: 40 }}></div> {/* Spacer */}
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            className="error-message"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <FiX />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="update-profile-form">
                    {/* Avatar Section */}
                    <motion.div
                        className="avatar-upload-section"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="avatar-preview-wrapper">
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt="Profile Preview"
                                    className="profile-image-preview"
                                />
                            ) : (
                                <div className="profile-image-placeholder">
                                    {formData.name?.charAt(0)?.toUpperCase() || <FiUser />}
                                </div>
                            )}
                            <label htmlFor="image-upload" className="upload-badge">
                                <FiCamera />
                            </label>
                        </div>
                        <input
                            id="image-upload"
                            type="file"
                            onChange={handleImageUpload}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                        <p className="upload-hint">Click the camera icon to change photo</p>
                    </motion.div>

                    <div className="form-fields">
                        <motion.div
                            className="form-group"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <label>
                                <FiUser className="label-icon" />
                                Full Name
                            </label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="your name"
                                    required
                                    minLength={3}
                                    maxLength={30}
                                />
                                <div className="focus-border"></div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="form-group"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <label>
                                <FiMail className="label-icon" />
                                Email Address
                            </label>
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="email@example.com"
                                    required
                                />
                                <div className="focus-border"></div>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        className="form-buttons"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={handleCancel}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="save-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="btn-loading">
                                    <div className="small-spinner"></div>
                                    <span>Saving...</span>
                                </div>
                            ) : (
                                <>
                                    <FiCheck />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </motion.div>
                </form>
            </motion.div>
        </div>
    );
};

export default UpdateProfilePage;
