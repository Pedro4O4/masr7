"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import { useEffect, ReactNode } from "react";
import { UserRole } from "../types/auth";

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: UserRole | UserRole[];
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        } else if (!loading && user && requiredRole) {
            const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
            if (!roles.includes(user.role)) {
                router.replace("/events");
            }
        }
    }, [user, loading, requiredRole, router]);

    if (loading || !user) {
        return null; // Or a loader component
    }

    if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!roles.includes(user.role)) return null;
    }

    return <>{children}</>;
};
