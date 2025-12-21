"use client";
import React from 'react';
import ProfilePage from '@/components/UserComponent/ProfilePage';
import { ProtectedRoute } from '@/auth/ProtectedRoute';

export default function Page() {
    return (
        <ProtectedRoute>
            <ProfilePage />
        </ProtectedRoute>
    );
}
