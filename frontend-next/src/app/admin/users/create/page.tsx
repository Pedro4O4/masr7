"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    FiArrowLeft, FiUserPlus, FiMail, FiLock, FiUser,
    FiShield, FiStar, FiCheck, FiAlertCircle
} from 'react-icons/fi';
import api from '@/services/api';
import { toast } from 'react-toastify';
import '@/components/AdminComponent/AdminUsersPage.css';

const ROLES = [
    { value: 'Organizer', label: 'Organizer', icon: FiStar, color: '#f59e0b' },
    { value: 'System Admin', label: 'System Admin', icon: FiShield, color: '#ef4444' },
];

const CreateUserPage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Organizer'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleRoleSelect = (role: string) => {
        setFormData({ ...formData, role });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.name.trim()) {
            setError('Name is required');
            return;
        }
        if (!formData.email.trim()) {
            setError('Email is required');
            return;
        }
        if (!formData.password) {
            setError('Password is required');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/user/create', {
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
                role: formData.role
            });

            if (response.data.success) {
                toast.success(`User "${formData.name}" created successfully as ${formData.role}`);
                router.push('/admin/users');
            }
        } catch (err: any) {
            console.error('Error creating user:', err);
            setError(err.response?.data?.message || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-users-page">
            <motion.div
                className="admin-page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="header-left">
                    <Link href="/admin/users" className="back-link">
                        <FiArrowLeft />
                    </Link>
                    <div className="header-icon-wrapper" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                        <FiUserPlus />
                    </div>
                    <div>
                        <h1>Create New User</h1>
                        <p>Add a new user with a specific role</p>
                    </div>
                </div>
            </motion.div>

            <motion.div
                className="create-user-form-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                    maxWidth: '600px',
                    margin: '2rem auto',
                    padding: '2rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
            >
                {error && (
                    <motion.div
                        className="error-banner"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={{ marginBottom: '1.5rem' }}
                    >
                        <FiAlertCircle />
                        <span>{error}</span>
                        <button onClick={() => setError(null)}>×</button>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Name Field */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            <FiUser style={{ marginRight: '0.5rem' }} />
                            Full Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter full name"
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    {/* Email Field */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            <FiMail style={{ marginRight: '0.5rem' }} />
                            Email Address *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email address"
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    {/* Password Field */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            <FiLock style={{ marginRight: '0.5rem' }} />
                            Password *
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password (min 6 characters)"
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    {/* Confirm Password Field */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            <FiLock style={{ marginRight: '0.5rem' }} />
                            Confirm Password *
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm password"
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    {/* Role Selection */}
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                            Select Role *
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            {ROLES.map(role => {
                                const RoleIcon = role.icon;
                                const isSelected = formData.role === role.value;
                                return (
                                    <motion.button
                                        key={role.value}
                                        type="button"
                                        onClick={() => handleRoleSelect(role.value)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: '12px',
                                            border: isSelected ? `2px solid ${role.color}` : '2px solid rgba(255, 255, 255, 0.1)',
                                            background: isSelected ? `${role.color}20` : 'rgba(255, 255, 255, 0.03)',
                                            color: isSelected ? role.color : 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <RoleIcon size={24} />
                                        <span style={{ fontSize: '0.85rem', fontWeight: isSelected ? 600 : 400 }}>
                                            {role.label}
                                        </span>
                                        {isSelected && <FiCheck size={16} />}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Info Box */}
                    <div style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        background: 'rgba(102, 126, 234, 0.1)',
                        border: '1px solid rgba(102, 126, 234, 0.2)',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)'
                    }}>
                        <strong style={{ color: '#667eea' }}>Note:</strong> The password you enter is temporary. When the user logs in, they will be prompted to set their own password and verify via OTP.
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '12px',
                            border: 'none',
                            background: loading ? 'rgba(102, 126, 234, 0.5)' : 'linear-gradient(135deg, #667eea, #764ba2)',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {loading ? (
                            <>
                                <div className="loading-spinner" style={{ width: '20px', height: '20px' }} />
                                Creating User...
                            </>
                        ) : (
                            <>
                                <FiUserPlus />
                                Create User
                            </>
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default CreateUserPage;
