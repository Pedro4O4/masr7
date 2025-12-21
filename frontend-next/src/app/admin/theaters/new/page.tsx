"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSave, FiGrid, FiAlertCircle } from 'react-icons/fi';
import TheaterDesigner from '@/components/Theater/TheaterDesigner';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { toast } from 'react-toastify';
import '@/components/AdminComponent/TheaterFormPage.css';

const TheaterFormPage = () => {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const isEditMode = Boolean(id);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [initialLayout, setInitialLayout] = useState(null);
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isEditMode) {
            const fetchTheater = async () => {
                try {
                    setLoading(true);
                    const response = await api.get<any>(`/theater/${id}`);
                    const data = response.data.success ? response.data.data : response.data;
                    setName(data.name);
                    setDescription(data.description || '');
                    setInitialLayout(data.layout);
                } catch (err: any) {
                    setError('Failed to load theater');
                } finally {
                    setLoading(false);
                }
            };
            fetchTheater();
        }
    }, [id, isEditMode]);

    const handleSave = async (designerData: any) => {
        if (!name.trim()) { toast.error('Theater name is required'); return; }
        try {
            setSaving(true);

            // Include all layout data from the designer
            const payload = {
                name: name.trim(),
                description: description.trim(),
                layout: {
                    ...designerData.layout,
                    removedSeats: designerData.removedSeats,
                    disabledSeats: designerData.disabledSeats,
                    hCorridors: designerData.hCorridors,
                    vCorridors: designerData.vCorridors,
                    labels: designerData.labels,
                },
                seatConfig: designerData.seatConfig
            };

            console.log('Saving theater with payload:', payload);

            if (isEditMode) await api.put(`/theater/${id}`, payload);
            else await api.post('/theater', payload);

            toast.success('Theater saved successfully!');
            router.push('/admin/theaters');
        } catch (err: any) {
            console.error('Error saving theater:', err);
            toast.error(err.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <ProtectedRoute requiredRole="System Admin">
            <div className="theater-form-page">
                <div className="form-header">
                    <button onClick={() => router.back()} className="back-btn"><FiArrowLeft /> Back</button>
                    <h1>{isEditMode ? 'Edit Theater' : 'New Theater'}</h1>
                </div>
                <div className="form-info-section">
                    <div className="form-group"><label>Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} /></div>
                    <div className="form-group"><label>Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} /></div>
                </div>
                <TheaterDesigner initialLayout={initialLayout} onSave={handleSave} />
            </div>
        </ProtectedRoute>
    );
};

export default TheaterFormPage;
