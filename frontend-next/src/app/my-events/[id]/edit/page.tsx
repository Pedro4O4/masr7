"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import EventForm from '@/components/Event Components/EventForm';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { Event } from '@/types/event';

const EditEventPage = () => {
    const params = useParams();
    const id = params.id as string;
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        const fetchEvent = async () => {
            try {
                const response = await api.get<any>(`/event/${id}`);
                const data = response.data.success ? response.data.data : response.data;
                setEvent(data);
            } catch (err: any) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    if (loading) return <div className="loading">Loading event data...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!event) return <div className="error-message">Event not found</div>;

    return (
        <ProtectedRoute requiredRole="Organizer">
            <div className="edit-event-page">
                <EventForm initialData={event} isEdit={true} eventId={id} />
            </div>
        </ProtectedRoute>
    );
};

export default EditEventPage;
