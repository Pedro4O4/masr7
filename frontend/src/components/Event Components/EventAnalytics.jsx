import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './EventAnalytics.css';

const EventAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.role !== 'Organizer') {
            navigate('/events');
            return;
        }

        fetchAnalyticsData();
    }, [navigate, user]);

    const fetchAnalyticsData = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/v1/user/events/analytics`, {
                withCredentials: true
            });

            setAnalytics(response.data);
        } catch (err) {
            setError('Failed to fetch analytics: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    // Prepare data for event comparison chart - ensure we have valid data
    const prepareEventComparisonData = () => {
        if (!analytics?.events || !analytics.events.length) return [];

        return analytics.events
            .filter(event => event.ticketsSold > 0) // Only include events with sales
            .map(event => ({
                name: event.eventTitle,
                value: event.ticketsSold
            }));
    };

    // Get performance class based on percentage
    const getPerformanceClass = (percentage) => {
        if (percentage >= 80) return 'performance-high';
        if (percentage >= 50) return 'performance-medium';
        return 'performance-low';
    };

    // Get revenue class based on value
    const getRevenueClass = (revenue) => {
        if (revenue >= 1000) return 'revenue-high';
        if (revenue >= 500) return 'revenue-medium';
        return 'revenue-low';
    };

    // COLORS for pie chart - enhanced color palette
    const COLORS = ['#4C51BF', '#22D3EE', '#FBBF24', '#DB2777', '#8B5CF6', '#10B981', '#F472B6'];

    if (loading) {
        return <div className="loading">Loading analytics data...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    // Check if we have valid data for the pie chart
    const pieChartData = prepareEventComparisonData();
    const hasPieData = pieChartData.length > 0;

    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <h2 className="analytics-title">Event Analytics Dashboard</h2>
            </div>

            <div className="stats-summary">
                <div className="stat-card">
                    <h3>Total Events</h3>
                    <p>{analytics?.totalEvents || 0}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Revenue</h3>
                    <p>${analytics?.totalRevenue?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="stat-card">
                    <h3>Average Sales Rate</h3>
                    <p>{analytics?.averageSoldPercentage || 0}%</p>
                </div>
            </div>

            {analytics?.events && analytics.events.length > 0 ? (
                <>
                    <div className="chart-container">
                        <h2>Ticket Sales by Event</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={analytics.events}
                                margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="eventTitle"
                                    tick={{ fontSize: 12 }}
                                    interval={0}
                                    angle={-45}
                                    textAnchor="end"
                                />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="ticketsSold" name="Tickets Sold" fill="#8884d8" />
                                <Bar dataKey="ticketsAvailable" name="Tickets Available" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {hasPieData && (
                        <div className="chart-container">
                            <h2>Sales Distribution</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={true}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        animationBegin={0}
                                        animationDuration={1500}
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                                stroke="#ffffff"
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value} tickets`, 'Sold']} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    <div className="chart-container">
                        <h2>Events Performance</h2>
                        <div className="events-table enhanced-table">
                            <table>
                                <thead>
                                <tr>
                                    <th>Event</th>
                                    <th>Tickets Sold</th>
                                    <th>Available</th>
                                    <th>Sales %</th>
                                    <th>Revenue</th>
                                </tr>
                                </thead>
                                <tbody>
                                {analytics.events.map(event => (
                                    <tr key={event.eventId}>
                                        <td className="event-title-cell">{event.eventTitle}</td>
                                        <td>{event.ticketsSold}</td>
                                        <td>{event.ticketsAvailable}</td>
                                        <td className={getPerformanceClass(event.percentageSold)}>
                                            <div className="progress-container">
                                                <div
                                                    className="progress-bar"
                                                    style={{width: `${Math.min(100, event.percentageSold)}%`}}
                                                ></div>
                                                <span>{event.percentageSold}%</span>
                                            </div>
                                        </td>
                                        <td className={getRevenueClass(event.revenue)}>
                                            ${event.revenue?.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="no-events-message">
                    <p>No event data available. Create events to start seeing analytics.</p>
                </div>
            )}

            <div className="event-actions">
                <button onClick={() => navigate('/my-events')} className="back-button">
                    Back to My Events
                </button>
            </div>
        </div>
    );
};

export default EventAnalytics;