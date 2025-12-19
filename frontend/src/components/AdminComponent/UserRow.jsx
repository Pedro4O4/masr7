import React from 'react';
import PropTypes from 'prop-types';
import './UserRow.css';
import './ConfirmationDialog.css'
import './UpdateUserRoleModal.css'

const UserRow = ({ user, onEdit, onDelete }) => {
    const userId = user._id || user.userId;

    // Convert role to class-friendly format
    const getRoleClass = (role) => {
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

UserRow.propTypes = {
    user: PropTypes.shape({
        _id: PropTypes.string,
        userId: PropTypes.string,
        email: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        role: PropTypes.string.isRequired
    }).isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

export default UserRow;