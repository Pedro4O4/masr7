"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
    FiTrendingUp, FiUsers, FiDollarSign, FiCalendar,
    FiArrowLeft, FiBarChart2, FiPieChart, FiActivity
} from 'react-icons/fi';
import api from '@/services/api';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import '@/components/Organizer/OrganizerAnalytics.css';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="tooltip-label">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="tooltip-item" style={{ color: entry.color }}>
                        {entry.name}: {entry.name === 'Revenue' ? `$${entry.value.toFixed(2)}` : entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const EventAnalytics = () => {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchAnalyticsData();
    }, []);

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);
            const response = await api.get<any>(`/user/events/analytics`);
            const data = response.data.success ? response.data.data : response.data;
            setAnalytics(data);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const preparePieData = () => {
        if (!analytics?.events) return [];
        return analytics.events
            .filter((e: any) => e.ticketsSold > 0)
            .map((e: any) => ({ name: e.eventTitle, value: e.ticketsSold }));
    };

    const COLORS = ['#8b5cf6', '#6366f1', '#22d3ee', '#f43f5e', '#fbbf24', '#10b981', '#ec4899'];

    if (loading) {
        return (
            <div className="analytics-page">
                <div className="loading-screen">
                    <div className="loader"></div>
                    <p>Calculating your success...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="analytics-page">
                <div className="error-screen">
                    <FiActivity size={48} color="#ef4444" />
                    <h2>Oops! Something went wrong</h2>
                    <p>{error}</p>
                    <button onClick={fetchAnalyticsData} className="back-button">Try Again</button>
                </div>
            </div>
        );
    }

    const pieData = preparePieData();

    return (
        <ProtectedRoute requiredRole="Organizer">
            <div className="analytics-page">
                {/* Animated Background */}
                <div className="page-background">
                    <div className="bg-gradient-orb orb-1"></div>
                    <div className="bg-gradient-orb orb-2"></div>
                    <div className="bg-gradient-orb orb-3"></div>
                </div>

                <div className="analytics-container">
                    <motion.div
                        className="analytics-header"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1>Event Analytics</h1>
                        <motion.button
                            onClick={() => router.push('/my-events')}
                            className="back-button"
                            whileHover={{ x: -5 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FiArrowLeft /> Back to Dashboard
                        </motion.button>
                    </motion.div>

                    {/* Stats Summary Area */}
                    <div className="stats-summary">
                        <StatCard
                            title="Total Events"
                            value={analytics?.totalEvents || 0}
                            icon={<FiCalendar />}
                            color="#8b5cf6"
                            delay={0.1}
                        />
                        <StatCard
                            title="Total Revenue"
                            value={`$${analytics?.totalRevenue?.toLocaleString() || '0'}`}
                            icon={<FiDollarSign />}
                            color="#10b981"
                            delay={0.2}
                        />
                        <StatCard
                            title="Sales Performance"
                            value={`${analytics?.averageSoldPercentage || 0}%`}
                            icon={<FiTrendingUp />}
                            color="#22d3ee"
                            delay={0.3}
                        />
                    </div>

                    {analytics?.events?.length > 0 ? (
                        <div className="charts-grid">
                            <motion.div
                                className="chart-card"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <h2><FiBarChart2 className="chart-icon" /> Ticket Sales Distribution</h2>
                                <div className="chart-wrapper">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analytics.events}>
                                            <defs>
                                                <linearGradient id="colorSold" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                                </linearGradient>
                                                <linearGradient id="colorAvail" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.1} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis
                                                dataKey="eventTitle"
                                                stroke="#94a3b8"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                stroke="#94a3b8"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(val) => `${val}`}
                                            />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                                            <Bar dataKey="ticketsSold" fill="url(#colorSold)" name="Sold" radius={[6, 6, 0, 0]} />
                                            <Bar dataKey="ticketsAvailable" fill="url(#colorAvail)" name="Available" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            <AnimatePresence>
                                {pieData.length > 0 && (
                                    <motion.div
                                        className="chart-card"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <h2><FiPieChart className="chart-icon" /> Event Popularity</h2>
                                        <div className="chart-wrapper">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={pieData}
                                                        dataKey="value"
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={100}
                                                        paddingAngle={5}
                                                        stroke="none"
                                                    >
                                                        {pieData.map((_: any, i: number) => (
                                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip content={<CustomTooltip />} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <motion.div
                            className="chart-card no-data"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="no-data-content">
                                <FiBarChart2 size={64} color="rgba(148, 163, 184, 0.2)" />
                                <h3>No Data Available Yet</h3>
                                <p>Start creating events and selling tickets to see your analytics grow!</p>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
};

const StatCard = ({ title, value, icon, color, delay }: any) => (
    <motion.div
        className="stat-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
    >
        <div className="stat-icon-wrapper" style={{ background: `${color}15`, color }}>
            {icon}
        </div>
        <div className="stat-info">
            <h3>{title}</h3>
            <p>{value}</p>
        </div>
    </motion.div>
);

export default EventAnalytics;
