"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import { User, ApiResponse, AuthResponse } from "../types/auth";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    authenticated: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isOrganizer: boolean;
    login: (credentials: any) => Promise<{ success: boolean; user?: User; error?: string; requiresVerification?: boolean }>;
    logout: () => Promise<{ success: boolean; error?: string }>;
    updateUser: (userData: Partial<User>) => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get<ApiResponse<User>>("/user/profile");
                if (res.data.success) {
                    setUser(res.data.data);
                    setAuthenticated(true);
                } else {
                    setUser(null);
                    setAuthenticated(false);
                }
            } catch (e) {
                setUser(null);
                setAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        const isStoredAuth = typeof window !== 'undefined' && localStorage.getItem('isAuthenticated') === 'true';
        if (isStoredAuth) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (credentials: any) => {
        try {
            const response = await api.post<AuthResponse>("/auth/login", credentials);

            if (response.data && response.data.success && response.data.data) {
                const { user } = response.data.data;
                setUser(user);
                setAuthenticated(true);
                localStorage.setItem('isAuthenticated', 'true');
                return { success: true, user };
            }

            return { success: false, error: "Login failed" };
        } catch (err: any) {
            // Handle admin-created users needing password change
            // NestJS wraps the error response - check both message object and direct properties
            const errorData = err.response?.data;
            const messageData = typeof errorData?.message === 'object' ? errorData.message : errorData;

            if (err.response?.status === 403 && messageData?.requiresPasswordChange) {
                return {
                    success: false,
                    requiresPasswordChange: true,
                    email: messageData.email,
                    error: messageData.message || 'Please set your own password.'
                };
            }
            // Handle verification required
            const errorMsg = typeof errorData?.message === 'string' ? errorData.message : messageData?.message;
            if (err.response?.status === 403 && errorMsg?.includes("verification")) {
                return { success: false, requiresVerification: true, error: errorMsg };
            }
            return { success: false, error: errorMsg || "Login failed" };
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setUser(null);
            setAuthenticated(false);
            localStorage.removeItem('isAuthenticated');
            toast.success("Logged out successfully");
            return { success: true };
        } catch (error: any) {
            toast.error("Logout failed. Please try again.");
            return { success: false, error: error.response?.data?.message || "Error logging out" };
        }
    };

    const updateUser = (userData: Partial<User>) => {
        setUser(prev => prev ? { ...prev, ...userData } : null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            authenticated,
            isAuthenticated: authenticated,
            isAdmin: user?.role === 'System Admin',
            isOrganizer: user?.role === 'Organizer',
            login,
            logout,
            updateUser,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
