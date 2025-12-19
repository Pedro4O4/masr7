// TheaterListPage.jsx - Admin theater management page
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPlus, FiEdit2, FiTrash2, FiGrid, FiEye, FiUsers,
    FiLayers, FiSearch, FiX, FiChevronRight
} from 'react-icons/fi';
import './TheaterListPage.css';

const TheaterListPage = () => {
    const [theaters, setTheaters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [previewTheater, setPreviewTheater] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTheaters();
    }, []);

    const fetchTheaters = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:3000/api/v1/theater', {
                withCredentials: true
            });
            if (response.data.success) {
                setTheaters(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching theaters:', err);
            setError(err.response?.data?.message || 'Failed to load theaters');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (theaterId) => {
        try {
            await axios.delete(`http://localhost:3000/api/v1/theater/${theaterId}`, {
                withCredentials: true
            });
            setTheaters(prev => prev.filter(t => t._id !== theaterId));
            setDeleteConfirm(null);
        } catch (err) {
            console.error('Error deleting theater:', err);
            alert('Failed to delete theater: ' + (err.response?.data?.message || err.message));
        }
    };

    const filteredTheaters = theaters.filter(theater =>
        theater.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        theater.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="theater-list-page">
                <div className="loading-state">
                    <div className="loading-spinner" />
                    <p>Loading theaters...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="theater-list-page">
            {/* Header */}
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="header-content">
                    <div className="header-icon">
                        <FiGrid />
                    </div>
                    <div>
                        <h1>Theater Management</h1>
                        <p>Create and manage theater layouts for events</p>
                    </div>
                </div>
                <Link to="/admin/theaters/new" className="create-btn">
                    <FiPlus />
                    <span>Create Theater</span>
                </Link>
            </motion.div>

            {/* Search Bar */}
            <motion.div
                className="search-bar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                <FiSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Search theaters..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button className="clear-search" onClick={() => setSearchTerm('')}>
                        <FiX />
                    </button>
                )}
            </motion.div>

            {/* Error State */}
            {error && (
                <div className="error-state">
                    <p>{error}</p>
                    <button onClick={fetchTheaters}>Retry</button>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredTheaters.length === 0 && (
                <motion.div
                    className="empty-state"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <FiGrid className="empty-icon" />
                    <h2>No Theaters Found</h2>
                    <p>
                        {searchTerm
                            ? 'No theaters match your search criteria'
                            : 'Get started by creating your first theater layout'
                        }
                    </p>
                    {!searchTerm && (
                        <Link to="/admin/theaters/new" className="create-btn">
                            <FiPlus /> Create Your First Theater
                        </Link>
                    )}
                </motion.div>
            )}

            {/* Theater Grid */}
            <div className="theaters-grid">
                <AnimatePresence>
                    {filteredTheaters.map((theater, index) => (
                        <motion.div
                            key={theater._id}
                            className={`theater-card ${!theater.isActive ? 'inactive' : ''}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -5 }}
                        >
                            {/* Card Header */}
                            <div className="card-header">
                                <div className="theater-icon">
                                    <FiLayers />
                                </div>
                                <div className="theater-info">
                                    <h3>{theater.name}</h3>
                                    {!theater.isActive && (
                                        <span className="inactive-badge">Inactive</span>
                                    )}
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="card-body">
                                {theater.description && (
                                    <p className="description">{theater.description}</p>
                                )}

                                <div className="stats-grid">
                                    <div className="stat">
                                        <FiUsers />
                                        <span>{theater.totalSeats || 0} seats</span>
                                    </div>
                                    <div className="stat">
                                        <FiGrid />
                                        <span>{theater.layout?.mainFloor?.rows || 0} rows</span>
                                    </div>
                                    {theater.layout?.hasBalcony && (
                                        <div className="stat balcony">
                                            <FiLayers />
                                            <span>Balcony</span>
                                        </div>
                                    )}
                                    {theater.vipSeats > 0 && (
                                        <div className="stat vip">
                                            <span>⭐ {theater.vipSeats} VIP</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card Actions */}
                            <div className="card-actions">
                                <button
                                    className="action-btn preview"
                                    onClick={() => setPreviewTheater(theater)}
                                    title="Preview"
                                >
                                    <FiEye />
                                </button>
                                <button
                                    className="action-btn edit"
                                    onClick={() => navigate(`/admin/theaters/${theater._id}/edit`)}
                                    title="Edit"
                                >
                                    <FiEdit2 />
                                </button>
                                <button
                                    className="action-btn delete"
                                    onClick={() => setDeleteConfirm(theater._id)}
                                    title="Delete"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>

                            {/* Navigate Arrow */}
                            <div
                                className="navigate-arrow"
                                onClick={() => navigate(`/admin/theaters/${theater._id}/edit`)}
                            >
                                <FiChevronRight />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setDeleteConfirm(null)}
                    >
                        <motion.div
                            className="confirm-modal"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3>Delete Theater?</h3>
                            <p>This action will deactivate the theater. It can be restored later.</p>
                            <div className="modal-actions">
                                <button
                                    className="modal-btn cancel"
                                    onClick={() => setDeleteConfirm(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="modal-btn delete"
                                    onClick={() => handleDelete(deleteConfirm)}
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Preview Modal */}
            <AnimatePresence>
                {previewTheater && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setPreviewTheater(null)}
                    >
                        <motion.div
                            className="preview-modal"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="close-modal-btn"
                                onClick={() => setPreviewTheater(null)}
                            >
                                <FiX />
                            </button>
                            <h2>{previewTheater.name}</h2>
                            <div className="preview-content">
                                {/* Mini seat map preview */}
                                <div className="mini-stage">STAGE</div>
                                <div className="mini-seats">
                                    {Array.from({ length: previewTheater.layout?.mainFloor?.rows || 5 }).map((_, row) => (
                                        <div key={row} className="mini-row">
                                            {Array.from({ length: previewTheater.layout?.mainFloor?.seatsPerRow || 10 }).map((_, seat) => (
                                                <div
                                                    key={seat}
                                                    className={`mini-seat ${previewTheater.seatConfig?.find(
                                                        s => s.row === String.fromCharCode(65 + row) && s.seatNumber === seat + 1
                                                    )?.seatType || 'standard'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                {previewTheater.layout?.hasBalcony && (
                                    <div className="balcony-label">+ Balcony ({previewTheater.layout.balcony.rows} rows)</div>
                                )}
                            </div>
                            <div className="preview-stats">
                                <span>Total: {previewTheater.totalSeats} seats</span>
                                {previewTheater.vipSeats > 0 && <span>VIP: {previewTheater.vipSeats}</span>}
                                {previewTheater.premiumSeats > 0 && <span>Premium: {previewTheater.premiumSeats}</span>}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TheaterListPage;
