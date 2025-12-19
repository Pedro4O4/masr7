import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import './UpdateUserRoleModal.css';

const UpdateUserRoleModal = ({ isOpen, user, onClose, onUpdate }) => {
    const [role, setRole] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            setRole(user.role || 'Standard User');
        }
        // Reset error state when modal opens/closes
        setError(null);
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        const userId = user._id || user.userId;
        setIsSubmitting(true);
        setError(null);

        try {
            await axios.put(`http://localhost:3000/api/v1/user/${userId}`,
                { role },
                { withCredentials: true }
            );

            // Notify parent component of successful update
            onUpdate(userId, { role });
            onClose();
        } catch (err) {
            console.error("Error updating user role:", err);
            setError(err.response?.data?.message || "Failed to update user role");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal">
                <h2>Update User Role</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <p>User: {user?.name} ({user?.email})</p>
                        <label htmlFor="role">Role</label>
                        <select
                            id="role"
                            name="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="System Admin">System Admin</option>
                            <option value="Organizer">Organizer</option>
                            <option value="Standard User">Standard User</option>
                        </select>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="button-container">
                        <button
                            type="submit"
                            className="admin-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Updating...' : 'Update Role'}
                        </button>
                        <button
                            type="button"
                            className="admin-button"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

UpdateUserRoleModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    user: PropTypes.shape({
        _id: PropTypes.string,
        userId: PropTypes.string,
        name: PropTypes.string,
        email: PropTypes.string,
        role: PropTypes.string
    }),
    onClose: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired
};

export default UpdateUserRoleModal;