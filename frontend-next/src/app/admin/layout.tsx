"use client";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <ProtectedRoute requiredRole="System Admin">
            <div className="admin-layout">
                {children}
            </div>
        </ProtectedRoute>
    );
}
