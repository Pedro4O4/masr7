'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiEdit2, FiGrid, FiUsers, FiLayers } from 'react-icons/fi';
import api from '@/services/api';
import TheaterDesigner from '@/components/Theater/TheaterDesigner';

interface TheaterLayout {
    mainFloor?: {
        rows: number;
        seatsPerRow: number;
        aislePositions?: number[];
    };
    balcony?: {
        rows: number;
        seatsPerRow: number;
        aislePositions?: number[];
    };
    hasBalcony?: boolean;
    stage?: {
        position: 'top' | 'bottom';
        width?: number;
        height?: number;
    };
    removedSeats?: string[];
    disabledSeats?: string[];
    hCorridors?: Record<string, number>;
    vCorridors?: Record<string, number>;
    seatCategories?: Record<string, string>;
    labels?: any[];
}

interface Theater {
    _id: string;
    name: string;
    description?: string;
    isActive?: boolean;
    totalSeats?: number;
    vipSeats?: number;
    premiumSeats?: number;
    layout?: TheaterLayout;
    seatConfig?: any[];
    createdBy?: {
        name: string;
        email: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function TheaterViewPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [theater, setTheater] = useState<Theater | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchTheater();
        }
    }, [id]);

    const fetchTheater = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/theater/${id}`);
            if (response.data.success) {
                setTheater(response.data.data);
            }
        } catch (err: any) {
            console.error('Error fetching theater:', err);
            setError(err.response?.data?.message || 'Failed to load theater');
        } finally {
            setLoading(false);
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

    if (error || !theater) {
        return (
            <div className="theater-form-page">
                <div className="error-state">
                    <p>{error || 'Theater not found'}</p>
                    <button onClick={() => router.push('/admin/theaters')}>Back to Theaters</button>
                </div>
            </div>
        );
    }

    return (
        <div className="theater-form-page">
            <motion.div
                className="form-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <button
                    className="back-btn"
                    onClick={() => router.push('/admin/theaters')}
                >
                    <FiArrowLeft />
                    <span>Back</span>
                </button>

                <div className="header-center">
                    <FiGrid className="header-icon" />
                    <h1>{theater.name}</h1>
                </div>

                <div className="header-actions">
                    <button
                        className="back-btn"
                        onClick={() => router.push(`/admin/theaters/${id}/edit`)}
                        style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
                    >
                        <FiEdit2 />
                        <span>Edit</span>
                    </button>
                </div>
            </motion.div>

            {/* Theater Info Section */}
            <motion.div
                className="form-info-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={{ marginBottom: '1rem' }}
            >
                {theater.description && (
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        {theater.description}
                    </p>
                )}
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiUsers style={{ color: 'var(--accent-color)' }} />
                        <span><strong>{theater.totalSeats || 0}</strong> Total Seats</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiGrid style={{ color: 'var(--accent-color)' }} />
                        <span><strong>{theater.layout?.mainFloor?.rows || 0}</strong> Rows</span>
                    </div>
                    {theater.layout?.hasBalcony && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiLayers style={{ color: 'var(--accent-color)' }} />
                            <span>Balcony ({theater.layout.balcony?.rows || 0} rows)</span>
                        </div>
                    )}
                    {theater.vipSeats && theater.vipSeats > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>⭐</span>
                            <span><strong>{theater.vipSeats}</strong> VIP Seats</span>
                        </div>
                    )}
                    {theater.premiumSeats && theater.premiumSeats > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>💎</span>
                            <span><strong>{theater.premiumSeats}</strong> Premium Seats</span>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Theater Designer in Preview Mode */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <TheaterDesigner
                    initialLayout={theater.layout as any}
                    isPreviewMode={true}
                />
            </motion.div>
        </div>
    );
}
