"use client";
import UserBookingsPage from '@/components/Booking component/UserBookingsPage';
import { ProtectedRoute } from '@/auth/ProtectedRoute';

const BookingsPage = () => {
    return (
        <ProtectedRoute requiredRole="Standard User">
            <UserBookingsPage />
        </ProtectedRoute>
    );
};

export default BookingsPage;
