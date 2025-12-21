"use client";
import React from 'react';
import EventForm from '@/components/Event Components/EventForm';
import { ProtectedRoute } from '@/auth/ProtectedRoute';

const NewEventPage = () => {
    return (
        <ProtectedRoute requiredRole="Organizer">
            <div className="new-event-page">
                <EventForm />
            </div>
        </ProtectedRoute>
    );
};

export default NewEventPage;
