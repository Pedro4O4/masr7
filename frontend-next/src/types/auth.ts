export type UserRole = 'System Admin' | 'Organizer' | 'Standard User';

export interface User {
    _id: string;
    userId?: string; // Alias for _id
    id?: string; // Another alias
    name: string;
    email: string;
    role: UserRole;
    profilePicture?: string;
    isVerified?: boolean;
    createdAt?: string;
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    data?: {
        token: string;
        user: User;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}
