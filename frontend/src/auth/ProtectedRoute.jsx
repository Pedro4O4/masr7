import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

export const ProtectedRoute = ({ children, requiredRole }) => {
    const { user } = useAuth();

    // If no user is logged in, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Handle role validation
    if (requiredRole) {
        // If requiredRole is an array, check if the user's role is in the array
        if (Array.isArray(requiredRole)) {
            if (!requiredRole.includes(user.role)) {
                return <Navigate to="/events" replace />;
            }
        }
        // If requiredRole is a string, check if it matches the user's role
        else if (user.role !== requiredRole) {
            return <Navigate to="/events" replace />;
        }
    }

    return children;
};