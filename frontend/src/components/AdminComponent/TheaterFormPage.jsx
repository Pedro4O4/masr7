// TheaterFormPage.jsx - Create/Edit theater page
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSave, FiGrid, FiAlertCircle } from 'react-icons/fi';
import TheaterDesigner from '../Theater/TheaterDesigner';
import './TheaterFormPage.css';

const TheaterFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [initialLayout, setInitialLayout] = useState(null);
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Fetch theater if editing
    useEffect(() => {
        if (isEditMode) {
            fetchTheater();
        }
    }, [id]);

    const fetchTheater = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:3000/api/v1/theater/${id}`, {
                withCredentials: true
            });
            if (response.data.success) {
                const theater = response.data.data;
                setName(theater.name);
                setDescription(theater.description || '');
                setInitialLayout(theater.layout);
            }
        } catch (err) {
            console.error('Error fetching theater:', err);
            setError('Failed to load theater');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (designerData) => {
        if (!name.trim()) {
            setError('Theater name is required');
            return;
        }

        try {
            setSaving(true);
            setError(null);

            const payload = {
                name: name.trim(),
                description: description.trim(),
                layout: {
                    ...designerData.layout,
                    removedSeats: designerData.removedSeats,
                    disabledSeats: designerData.disabledSeats,
                    hCorridors: designerData.hCorridors,
                    vCorridors: designerData.vCorridors,
                    labels: designerData.labels
                },
                seatConfig: designerData.seatConfig
            };

            if (isEditMode) {
                await axios.put(`http://localhost:3000/api/v1/theater/${id}`, payload, {
                    withCredentials: true
                });
            } else {
                await axios.post('http://localhost:3000/api/v1/theater', payload, {
                    withCredentials: true
                });
            }

            navigate('/admin/theaters');
        } catch (err) {
            console.error('Error saving theater:', err);
            setError(err.response?.data?.message || 'Failed to save theater');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="theater-form-page">
                <div className="loading-state">
                    <div className="loading-spinner" />
                    <p>Loading theater...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="theater-form-page">
            {/* Header */}
            <motion.div
                className="form-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <button
                    className="back-btn"
                    onClick={() => navigate('/admin/theaters')}
                >
                    <FiArrowLeft />
                    <span>Back</span>
                </button>

                <div className="header-center">
                    <FiGrid className="header-icon" />
                    <h1>{isEditMode ? 'Edit Theater' : 'Create New Theater'}</h1>
                </div>

                <div className="header-actions">
                    {saving && <span className="saving-indicator">Saving...</span>}
                </div>
            </motion.div>

            {/* Error Message */}
            {error && (
                <motion.div
                    className="error-banner"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                >
                    <FiAlertCircle />
                    <span>{error}</span>
                    <button onClick={() => setError(null)}>×</button>
                </motion.div>
            )}

            {/* Name and Description */}
            <motion.div
                className="form-info-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                <div className="form-group">
                    <label htmlFor="theater-name">Theater Name *</label>
                    <input
                        id="theater-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Grand Theater, Main Hall"
                        maxLength={100}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="theater-description">Description</label>
                    <textarea
                        id="theater-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optional description of the theater..."
                        maxLength={500}
                        rows={2}
                    />
                </div>
            </motion.div>

            {/* Theater Designer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <TheaterDesigner
                    initialLayout={initialLayout}
                    onSave={handleSave}
                />
            </motion.div>
        </div>
    );
};

export default TheaterFormPage;
