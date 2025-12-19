// AdminUsersPage.jsx - Redesigned with role tabs and modern dark UI
import React, { useEffect, useState, useMemo } from 'react';
import axios from "axios";
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiUsers, FiShield, FiStar, FiUser, FiSearch,
    FiEdit2, FiTrash2, FiX, FiCheck, FiAlertCircle,
    FiGrid, FiCalendar, FiRefreshCw
} from 'react-icons/fi';
import UpdateUserRoleModal from './UpdateUserRoleModal';
import ConfirmationDialog from "./ConfirmationDialog.jsx";
import './AdminUsersPage.css';

const ROLE_CONFIG = {
    'System Admin': {
        icon: FiShield,
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.15)',
        borderColor: 'rgba(239, 68, 68, 0.3)'
    },
    'Organizer': {
        icon: FiStar,
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.15)',
        borderColor: 'rgba(245, 158, 11, 0.3)'
    },
    'Standard User': {
        icon: FiUser,
        color: '#22d3ee',
        bgColor: 'rgba(34, 211, 238, 0.15)',
        borderColor: 'rgba(34, 211, 238, 0.3)'
    }
};

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    // State for edit functionality
    const [editingUser, setEditingUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // State for delete confirmation
    const [deleteUserId, setDeleteUserId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        if (currentUser.role !== 'System Admin') {
            navigate('/');
            return;
        }

        fetchUsers();
    }, [navigate, currentUser]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:3000/api/v1/user', {
                withCredentials: true
            });

            let usersData = [];
            if (response.data && Array.isArray(response.data)) {
                usersData = response.data;
            } else if (response.data?.users && Array.isArray(response.data.users)) {
                usersData = response.data.users;
            } else if (response.data?.data && Array.isArray(response.data.data)) {
                usersData = response.data.data;
            }

            // Filter out the current admin from the list
            const currentUserId = currentUser._id || currentUser.userId || currentUser.id;
            usersData = usersData.filter(u => {
                const userId = u._id || u.userId || u.id;
                return userId !== currentUserId;
            });

            setUsers(usersData);
        } catch (err) {
            console.error("Error fetching users:", err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                navigate('/login');
            } else {
                setError(err.response?.data?.message || err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    // Filter users based on active tab and search query
    const filteredUsers = useMemo(() => {
        let filtered = users;

        // Filter by role tab
        if (activeTab !== 'all') {
            const roleMap = {
                admins: 'System Admin',
                organizers: 'Organizer',
                users: 'Standard User'
            };
            filtered = filtered.filter(u => u.role === roleMap[activeTab]);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(u =>
                u.name?.toLowerCase().includes(query) ||
                u.email?.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [users, activeTab, searchQuery]);

    // Group users by role for stats
    const userStats = useMemo(() => {
        return {
            total: users.length,
            admins: users.filter(u => u.role === 'System Admin').length,
            organizers: users.filter(u => u.role === 'Organizer').length,
            users: users.filter(u => u.role === 'Standard User').length
        };
    }, [users]);

    const handleUpdateRole = (userId, updatedData) => {
        setUsers(users.map(u => {
            const userIdField = u._id || u.userId;
            return userIdField === userId ? { ...u, ...updatedData } : u;
        }));
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setIsEditing(true);
    };

    const handleDeleteClick = (userId) => {
        setDeleteUserId(userId);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`http://localhost:3000/api/v1/user/${deleteUserId}`, {
                withCredentials: true
            });
            setUsers(users.filter(u => (u._id || u.userId) !== deleteUserId));
            setShowDeleteConfirm(false);
        } catch (err) {
            console.error("Error deleting user:", err);
            alert(`Error deleting user: ${err.response?.data?.message || err.message}`);
        }
    };

    const getRoleConfig = (role) => ROLE_CONFIG[role] || ROLE_CONFIG['Standard User'];

    return (
        <div className="admin-users-page">
            {/* Page Header */}
            <motion.div
                className="admin-page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="header-left">
                    <div className="header-icon-wrapper">
                        <FiUsers />
                    </div>
                    <div>
                        <h1>User Management</h1>
                        <p>Manage all users, roles, and permissions</p>
                    </div>
                </div>
                <div className="header-actions">
                    <Link to="/admin/events" className="nav-btn">
                        <FiCalendar /> Events
                    </Link>
                    <Link to="/admin/theaters" className="nav-btn">
                        <FiGrid /> Theaters
                    </Link>
                    <button className="refresh-btn" onClick={fetchUsers} disabled={loading}>
                        <FiRefreshCw className={loading ? 'spinning' : ''} />
                    </button>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                className="stats-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                <div className="stat-card total">
                    <FiUsers className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-value">{userStats.total}</span>
                        <span className="stat-label">Total Users</span>
                    </div>
                </div>
                <div className="stat-card admins">
                    <FiShield className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-value">{userStats.admins}</span>
                        <span className="stat-label">Admins</span>
                    </div>
                </div>
                <div className="stat-card organizers">
                    <FiStar className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-value">{userStats.organizers}</span>
                        <span className="stat-label">Organizers</span>
                    </div>
                </div>
                <div className="stat-card users">
                    <FiUser className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-value">{userStats.users}</span>
                        <span className="stat-label">Standard Users</span>
                    </div>
                </div>
            </motion.div>

            {/* Search and Tabs */}
            <motion.div
                className="controls-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="clear-search" onClick={() => setSearchQuery('')}>
                            <FiX />
                        </button>
                    )}
                </div>

                <div className="role-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All Users
                    </button>
                    <button
                        className={`tab-btn admins ${activeTab === 'admins' ? 'active' : ''}`}
                        onClick={() => setActiveTab('admins')}
                    >
                        <FiShield /> Admins ({userStats.admins})
                    </button>
                    <button
                        className={`tab-btn organizers ${activeTab === 'organizers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('organizers')}
                    >
                        <FiStar /> Organizers ({userStats.organizers})
                    </button>
                    <button
                        className={`tab-btn users ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <FiUser /> Users ({userStats.users})
                    </button>
                </div>
            </motion.div>

            {/* Error State */}
            {error && (
                <motion.div
                    className="error-banner"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                >
                    <FiAlertCircle />
                    <span>{error}</span>
                    <button onClick={() => setError(null)}><FiX /></button>
                </motion.div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="loading-state">
                    <div className="loading-spinner" />
                    <p>Loading users...</p>
                </div>
            )}

            {/* Users Grid */}
            {!loading && !error && filteredUsers.length > 0 && (
                <motion.div
                    className="users-grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <AnimatePresence>
                        {filteredUsers.map((userData, index) => {
                            const roleConfig = getRoleConfig(userData.role);
                            const RoleIcon = roleConfig.icon;
                            const userId = userData._id || userData.userId;

                            return (
                                <motion.div
                                    key={userId}
                                    className="user-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.03 }}
                                    whileHover={{ y: -3 }}
                                >
                                    <div className="user-avatar">
                                        {userData.profilePicture ? (
                                            <img src={userData.profilePicture} alt={userData.name} />
                                        ) : (
                                            <span>{userData.name?.charAt(0)?.toUpperCase() || '?'}</span>
                                        )}
                                    </div>

                                    <div className="user-info">
                                        <h3 className="user-name">{userData.name}</h3>
                                        <p className="user-email">{userData.email}</p>
                                        <div
                                            className="role-badge"
                                            style={{
                                                background: roleConfig.bgColor,
                                                borderColor: roleConfig.borderColor,
                                                color: roleConfig.color
                                            }}
                                        >
                                            <RoleIcon />
                                            <span>{userData.role}</span>
                                        </div>
                                    </div>

                                    <div className="user-actions">
                                        <button
                                            className="action-btn edit"
                                            onClick={() => handleEditClick(userData)}
                                            title="Edit Role"
                                        >
                                            <FiEdit2 />
                                        </button>
                                        <button
                                            className="action-btn delete"
                                            onClick={() => handleDeleteClick(userId)}
                                            title="Delete User"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredUsers.length === 0 && (
                <motion.div
                    className="empty-state"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <FiUsers className="empty-icon" />
                    <h2>No Users Found</h2>
                    <p>
                        {searchQuery
                            ? 'No users match your search criteria'
                            : activeTab !== 'all'
                                ? `No ${activeTab} found in the system`
                                : 'No users found in the system'
                        }
                    </p>
                </motion.div>
            )}

            {/* Edit Modal */}
            <UpdateUserRoleModal
                isOpen={isEditing}
                user={editingUser}
                onClose={() => setIsEditing(false)}
                onUpdate={handleUpdateRole}
            />

            {/* Delete Confirmation */}
            <ConfirmationDialog
                isOpen={showDeleteConfirm}
                title="Confirm Delete"
                message="Are you sure you want to delete this user? This action cannot be undone."
                confirmText="Yes, Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </div>
    );
};

export default AdminUsersPage;