"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiGrid, FiEye, FiUsers, FiLayers, FiSearch, FiX, FiChevronRight } from 'react-icons/fi';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { Theater } from '@/types/theater';
import '@/components/AdminComponent/TheaterListPage.css';

const TheaterListPage = () => {
    const [theaters, setTheaters] = useState<Theater[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => { fetchTheaters(); }, []);

    const fetchTheaters = async () => {
        try {
            setLoading(true);
            const response = await api.get<any>('/theater');
            const data = response.data.success ? response.data.data : response.data;
            setTheaters(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load theaters');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (theaterId: string) => {
        try {
            await api.delete(`/theater/${theaterId}`);
            setTheaters(prev => prev.filter(t => t._id !== theaterId));
            setDeleteConfirm(null);
        } catch (err: any) {
            alert('Failed to delete: ' + (err.response?.data?.message || err.message));
        }
    };

    const filtered = theaters.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading) return <div className="loading">Loading theaters...</div>;

    return (
        <ProtectedRoute requiredRole="System Admin">
            <div className="theater-list-page">
                <div className="page-header">
                    <div className="header-content"><FiGrid /><div><h1>Theaters</h1><p>Manage layouts</p></div></div>
                    <Link href="/admin/theaters/new" className="create-btn"><FiPlus /><span>New Theater</span></Link>
                </div>
                <div className="search-bar"><FiSearch /><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                <div className="theaters-grid">
                    {filtered.map(theater => (
                        <div key={theater._id} className="theater-card">
                            <div className="card-header">
                                <div className="theater-icon">
                                    <FiLayers />
                                </div>
                                <div className="theater-info">
                                    <h3>{theater.name}</h3>
                                    {theater.isActive === false && (
                                        <span className="inactive-badge">Inactive</span>
                                    )}
                                </div>
                            </div>

                            <div className="theater-card-preview">
                                <div className="mini-layout">
                                    <div className="mini-stage">STAGE</div>
                                    <div className="mini-grid" style={{
                                        gridTemplateRows: `repeat(${theater.layout?.mainFloor?.rows || 0}, 1fr)`,
                                        gridTemplateColumns: `repeat(${theater.layout?.mainFloor?.seatsPerRow || 0}, 1fr)`
                                    }}>
                                        {Array.from({ length: (theater.layout?.mainFloor?.rows || 0) * (theater.layout?.mainFloor?.seatsPerRow || 0) }).map((_, i) => {
                                            const rowIdx = Math.floor(i / (theater.layout?.mainFloor?.seatsPerRow || 1));
                                            const seatIdx = i % (theater.layout?.mainFloor?.seatsPerRow || 1);
                                            const row = String.fromCharCode(65 + rowIdx);
                                            const seatNum = seatIdx + 1;
                                            const seatKey = `${row}${seatNum}`;
                                            const isRemoved = theater.layout?.removedSeats?.includes(seatKey);

                                            return (
                                                <div
                                                    key={i}
                                                    className={`mini-seat-dot ${isRemoved ? 'removed' : ''}`}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="card-body">
                                <p className="description">{theater.description}</p>
                                <div className="stats-grid">
                                    <div className="stat"><FiUsers /> <span>{theater.totalSeats || 0} seats</span></div>
                                    <div className="stat"><FiGrid /> <span>{theater.layout?.mainFloor?.rows || 0} rows</span></div>
                                    {theater.layout?.hasBalcony && (
                                        <div className="stat balcony"><FiLayers /> <span>Balcony</span></div>
                                    )}
                                </div>
                            </div>
                            <div className="card-actions">
                                <button className="action-btn preview" onClick={() => router.push(`/admin/theaters/${theater._id}/view`)} title="View Theater"><FiEye /></button>
                                <button className="action-btn edit" onClick={() => router.push(`/admin/theaters/${theater._id}/edit`)}><FiEdit2 /></button>
                                <button className="action-btn delete" onClick={() => setDeleteConfirm(theater._id)}><FiTrash2 /></button>
                            </div>
                        </div>
                    ))}
                </div>
                <AnimatePresence>
                    {deleteConfirm && (
                        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                            <div className="confirm-modal" onClick={e => e.stopPropagation()}>
                                <h3>Delete Theater?</h3>
                                <div className="modal-actions">
                                    <button onClick={() => setDeleteConfirm(null)}>Cancel</button>
                                    <button onClick={() => handleDelete(deleteConfirm)}>Delete</button>
                                </div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </ProtectedRoute>
    );
};

export default TheaterListPage;
