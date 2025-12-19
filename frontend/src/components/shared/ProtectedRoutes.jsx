// src/components/shared/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({
                            allowedRoles = [], // Array of roles allowed to access this route
                            redirectPath = '/login' // Default redirect path
                        }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    // Show loader while checking authentication
    if (loading) {
        return <Loader message="Checking authentication..." />;
    }

    // If user is not authenticated, redirect to login with return URL
    if (!isAuthenticated) {
        return <Navigate to={redirectPath} state={{ from: location.pathname }} replace />;
    }

    // If roles are specified and user's role is not in the allowed roles, redirect
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        // Redirect to homepage or unauthorized page
        return <Navigate to="/" replace />;
    }

    // If authenticated and authorized, render the child routes
    return <Outlet />;
};

export default ProtectedRoute;