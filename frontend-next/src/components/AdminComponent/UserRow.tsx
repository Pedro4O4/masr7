'use client';

import './UserRow.css';

interface User {
    _id?: string;
    userId?: string;
    email: string;
    name: string;
    role: string;
}

interface UserRowProps {
    user: User;
    onEdit: (user: User) => void;
    onDelete: (userId: string) => void;
}

const UserRow = ({ user, onEdit, onDelete }: UserRowProps) => {
    const userId = user._id || user.userId || '';

    const getRoleClass = (role: string): string => {
        return role.toLowerCase().replace(/\s+/g, '-');
    };

    return (
        <tr className="user-row">
            <td className="user-id">{userId}</td>
            <td className="user-email">{user.email}</td>
            <td className="user-name">{user.name}</td>
            <td>
                <span className={`role-badge ${getRoleClass(user.role)}`}>
                    {user.role}
                </span>
            </td>
            <td className="action-cell">
                <button
                    className="action-button edit-button"
                    onClick={() => onEdit(user)}
                >
                    Edit Role
                </button>
                <button
                    className="action-button delete-button"
                    onClick={() => onDelete(userId)}
                >
                    Delete
                </button>
            </td>
        </tr>
    );
};

export default UserRow;
