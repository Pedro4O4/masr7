'use client';

import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { useAuth } from '@/auth/AuthContext';
import Loader from './Loader';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: string[];
    redirectPath?: string;
}

const ProtectedRoute = ({
    children,
    allowedRoles = [],
    redirectPath = '/login'
}: ProtectedRouteProps) => {
    const { isAuthenticated, user, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                // Store the current path to redirect back after login
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('redirectAfterLogin', pathname);
                }
                router.push(redirectPath);
            } else if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
                // User is authenticated but doesn't have the required role
                router.push('/');
            }
        }
    }, [isAuthenticated, user, loading, allowedRoles, redirectPath, pathname, router]);

    // Show loader while checking authentication
    if (loading) {
        return <Loader message="Checking authentication..." />;
    }

    // If not authenticated or not authorized, show loader while redirecting
    if (!isAuthenticated) {
        return <Loader message="Redirecting to login..." />;
    }

    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        return <Loader message="Redirecting..." />;
    }

    // If authenticated and authorized, render the children
    return <>{children}</>;
};

export default ProtectedRoute;
