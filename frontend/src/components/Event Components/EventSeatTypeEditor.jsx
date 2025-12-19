// EventSeatTypeEditor.jsx - Organizer component to set VIP/Standard seats and pricing
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiGrid, FiMaximize2, FiMinimize2, FiStar, FiDollarSign,
    FiZap, FiCheck, FiChevronsUp, FiChevronsDown, FiInfo
} from 'react-icons/fi';
import './EventSeatTypeEditor.css';

const SEAT_TYPES = {
    standard: { label: 'Standard', color: '#6B7280', hoverColor: '#4B5563' },
    vip: { label: 'VIP', color: '#F59E0B', hoverColor: '#D97706' },
    premium: { label: 'Premium', color: '#8B5CF6', hoverColor: '#7C3AED' }
};

const EventSeatTypeEditor = ({
    theaterId,
    initialSeatPricing = [],
    onPricingChange,
    readOnly = false
}) => {
    const [theater, setTheater] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Seat type assignments - Map of seatKey -> { seatType, price }
    const [seatAssignments, setSeatAssignments] = useState(new Map());

    // Pricing for each seat type
    const [typePricing, setTypePricing] = useState({
        standard: 25,
        vip: 50,
        premium: 75
    });

    // UI state
    const [selectedSeats, setSelectedSeats] = useState(new Set());
    const [currentSeatType, setCurrentSeatType] = useState('vip');
    const [zoomLevel, setZoomLevel] = useState(1);
    const [showPricing, setShowPricing] = useState(true);

    // Fetch theater data
    useEffect(() => {
        if (!theaterId) {
            setLoading(false);
            return;
        }

        const fetchTheater = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `http://localhost:3000/api/v1/theater/${theaterId}`,
                    { withCredentials: true }
                );
                setTheater(response.data.data || response.data);

                // Initialize from initial pricing if provided
                if (initialSeatPricing?.length > 0) {
                    const assignmentMap = new Map();
                    initialSeatPricing.forEach(sp => {
                        const key = `${sp.section}-${sp.row}-${sp.seatNumber}`;
                        assignmentMap.set(key, {
                            seatType: sp.seatType,
                            price: sp.price
                        });
                        // Update type pricing from initial data
                        if (sp.seatType && sp.price) {
                            setTypePricing(prev => ({
                                ...prev,
                                [sp.seatType]: sp.price
                            }));
                        }
                    });
                    setSeatAssignments(assignmentMap);
                }
            } catch (err) {
                console.error('Error fetching theater:', err);
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTheater();
    }, [theaterId, initialSeatPricing]);

    // Generate row labels
    const generateRowLabels = useCallback((count, prefix = '') => {
        return Array.from({ length: count }, (_, i) =>
            prefix + String.fromCharCode(65 + (i % 26)) + (i >= 26 ? Math.floor(i / 26) : '')
        );
    }, []);

    const mainRowLabels = useMemo(() => {
        if (!theater?.layout?.mainFloor) return [];
        return generateRowLabels(theater.layout.mainFloor.rows);
    }, [theater, generateRowLabels]);

    const balconyRowLabels = useMemo(() => {
        if (!theater?.layout?.balcony) return [];
        return generateRowLabels(theater.layout.balcony.rows, 'BALC-');
    }, [theater, generateRowLabels]);

    // Handle seat click
    const handleSeatClick = useCallback((row, seatNum, section, e) => {
        if (readOnly) return;

        const seatKey = `${section}-${row}-${seatNum}`;

        if (e.ctrlKey || e.metaKey) {
            setSelectedSeats(prev => {
                const next = new Set(prev);
                if (next.has(seatKey)) {
                    next.delete(seatKey);
                } else {
                    next.add(seatKey);
                }
                return next;
            });
        } else {
            setSelectedSeats(new Set([seatKey]));
        }
    }, [readOnly]);

    // Apply seat type to selected seats
    const applyTypeToSelected = useCallback(() => {
        const price = typePricing[currentSeatType];

        setSeatAssignments(prev => {
            const next = new Map(prev);
            selectedSeats.forEach(seatKey => {
                next.set(seatKey, { seatType: currentSeatType, price });
            });
            return next;
        });
        setSelectedSeats(new Set());
    }, [selectedSeats, currentSeatType, typePricing]);

    // Clear type from selected seats (make standard)
    const clearSelectedType = useCallback(() => {
        setSeatAssignments(prev => {
            const next = new Map(prev);
            selectedSeats.forEach(seatKey => {
                next.set(seatKey, { seatType: 'standard', price: typePricing.standard });
            });
            return next;
        });
        setSelectedSeats(new Set());
    }, [selectedSeats, typePricing]);

    // Get seat type for a specific seat
    const getSeatInfo = useCallback((row, seatNum, section) => {
        const seatKey = `${section}-${row}-${seatNum}`;
        return seatAssignments.get(seatKey) || { seatType: 'standard', price: typePricing.standard };
    }, [seatAssignments, typePricing]);

    // Calculate summary
    const summary = useMemo(() => {
        const counts = { standard: 0, vip: 0, premium: 0 };
        const totalRevenue = { standard: 0, vip: 0, premium: 0 };

        seatAssignments.forEach(({ seatType, price }) => {
            counts[seatType] = (counts[seatType] || 0) + 1;
            totalRevenue[seatType] = (totalRevenue[seatType] || 0) + price;
        });

        // Count remaining as standard
        if (theater?.seatConfig) {
            const configuredCount = theater.seatConfig.length;
            const assignedCount = seatAssignments.size;
            counts.standard += configuredCount - assignedCount;
            totalRevenue.standard += (configuredCount - assignedCount) * typePricing.standard;
        }

        return { counts, totalRevenue };
    }, [seatAssignments, theater, typePricing]);

    // Notify parent of changes
    useEffect(() => {
        if (!onPricingChange) return;

        const seatPricing = Array.from(seatAssignments.entries()).map(([key, info]) => {
            const [section, row, seatNumber] = key.split('-');
            return {
                section,
                row,
                seatNumber: parseInt(seatNumber),
                seatType: info.seatType,
                price: info.price
            };
        });

        onPricingChange({
            seatPricing,
            typePricing,
            summary
        });
    }, [seatAssignments, typePricing, summary, onPricingChange]);

    // Render single seat
    const renderSeat = (row, seatNum, section, isAisle, isRemoved) => {
        const seatKey = `${section}-${row}-${seatNum}`;

        if (isAisle) {
            return <div key={`${seatKey}-aisle`} className="seat-aisle" />;
        }

        if (isRemoved) {
            return <div key={seatKey} className="seat-slot empty" />;
        }

        const { seatType, price } = getSeatInfo(row, seatNum, section);
        const isSelected = selectedSeats.has(seatKey);
        const typeInfo = SEAT_TYPES[seatType];

        return (
            <motion.div
                key={seatKey}
                className={`seat ${seatType} ${isSelected ? 'selected' : ''}`}
                style={{
                    '--seat-color': typeInfo.color,
                    '--seat-hover': typeInfo.hoverColor
                }}
                onClick={(e) => handleSeatClick(row, seatNum, section, e)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title={`${row}${seatNum} - ${typeInfo.label} ($${price})`}
            >
                <span className="seat-number">{seatNum}</span>
            </motion.div>
        );
    };

    // Render row
    const renderRow = (rowLabel, seatsPerRow, aislePositions, section, removedSeats = new Set()) => {
        const seats = [];
        for (let s = 1; s <= seatsPerRow; s++) {
            const seatKey = `${section}-${rowLabel}-${s}`;
            const isAisle = aislePositions?.includes(s);
            const isRemoved = removedSeats.has(seatKey);
            seats.push(renderSeat(rowLabel, s, section, isAisle, isRemoved));
        }

        return (
            <div key={`${section}-${rowLabel}`} className="seat-row">
                <div className="row-label">{rowLabel}</div>
                <div className="seats-container">{seats}</div>
                <div className="row-label">{rowLabel}</div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="seat-editor loading">
                <div className="spinner">⏳</div>
                <p>Loading theater layout...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="seat-editor error">
                <FiInfo size={40} />
                <p>Error: {error}</p>
            </div>
        );
    }

    if (!theater) {
        return (
            <div className="seat-editor empty">
                <FiGrid size={40} />
                <p>Select a theater to configure seat pricing</p>
            </div>
        );
    }

    // Build removed seats set from theater data
    const removedSeatsSet = new Set(theater.removedSeats || []);

    return (
        <div className="seat-type-editor">
            {/* Toolbar */}
            {!readOnly && (
                <motion.div
                    className="editor-toolbar"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    <div className="toolbar-section">
                        <span className="toolbar-label">Assign as:</span>
                        {Object.entries(SEAT_TYPES).map(([type, info]) => (
                            <button
                                key={type}
                                className={`type-btn ${currentSeatType === type ? 'active' : ''}`}
                                style={{ '--type-color': info.color }}
                                onClick={() => setCurrentSeatType(type)}
                            >
                                {type === 'vip' && <FiStar />}
                                {info.label}
                            </button>
                        ))}
                    </div>

                    <div className="toolbar-section">
                        {selectedSeats.size > 0 && (
                            <>
                                <button className="apply-btn" onClick={applyTypeToSelected}>
                                    <FiZap />
                                    Apply to {selectedSeats.size} seats
                                </button>
                                <button className="clear-btn" onClick={clearSelectedType}>
                                    Reset to Standard
                                </button>
                            </>
                        )}
                    </div>

                    <div className="toolbar-section zoom-controls">
                        <button onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.1))}>
                            <FiMinimize2 />
                        </button>
                        <span>{Math.round(zoomLevel * 100)}%</span>
                        <button onClick={() => setZoomLevel(z => Math.min(1.5, z + 0.1))}>
                            <FiMaximize2 />
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Pricing Panel */}
            {!readOnly && showPricing && (
                <motion.div
                    className="pricing-panel"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <h4><FiDollarSign /> Set Prices</h4>
                    <div className="price-inputs">
                        {Object.entries(SEAT_TYPES).map(([type, info]) => (
                            <div key={type} className="price-input-group">
                                <label style={{ color: info.color }}>{info.label}</label>
                                <div className="price-input">
                                    <span>$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={typePricing[type]}
                                        onChange={(e) => setTypePricing(prev => ({
                                            ...prev,
                                            [type]: parseFloat(e.target.value) || 0
                                        }))}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Seat Map */}
            <div
                className="seat-map-container"
                style={{ transform: `scale(${zoomLevel})` }}
            >
                {/* Stage */}
                {theater.layout?.stage?.position === 'top' && (
                    <div className="stage stage-top">
                        <FiChevronsUp className="stage-icon" />
                        <span>STAGE</span>
                    </div>
                )}

                {/* Balcony */}
                {theater.layout?.hasBalcony && (
                    <div className="section balcony-section">
                        <div className="section-label">
                            <FiChevronsUp />
                            BALCONY
                        </div>
                        <div className="seats-grid">
                            {balconyRowLabels.map(rowLabel =>
                                renderRow(
                                    rowLabel,
                                    theater.layout.balcony.seatsPerRow,
                                    theater.layout.balcony.aislePositions,
                                    'balcony',
                                    removedSeatsSet
                                )
                            )}
                        </div>
                    </div>
                )}

                {/* Main Floor */}
                <div className="section main-section">
                    <div className="section-label">
                        <FiGrid />
                        MAIN FLOOR
                    </div>
                    <div className="seats-grid">
                        {mainRowLabels.map(rowLabel =>
                            renderRow(
                                rowLabel,
                                theater.layout.mainFloor.seatsPerRow,
                                theater.layout.mainFloor.aislePositions,
                                'main',
                                removedSeatsSet
                            )
                        )}
                    </div>
                </div>

                {/* Stage at bottom */}
                {theater.layout?.stage?.position === 'bottom' && (
                    <div className="stage stage-bottom">
                        <span>STAGE</span>
                        <FiChevronsDown className="stage-icon" />
                    </div>
                )}
            </div>

            {/* Legend & Summary */}
            <div className="editor-footer">
                <div className="legend">
                    {Object.entries(SEAT_TYPES).map(([type, info]) => (
                        <div key={type} className="legend-item">
                            <div className="legend-color" style={{ background: info.color }} />
                            <span>{info.label}</span>
                            <span className="legend-count">({summary.counts[type] || 0})</span>
                            <span className="legend-price">${typePricing[type]}</span>
                        </div>
                    ))}
                </div>

                <div className="summary">
                    <span className="total-seats">
                        Total: {Object.values(summary.counts).reduce((a, b) => a + b, 0)} seats
                    </span>
                    <span className="total-revenue">
                        Max Revenue: ${Object.values(summary.totalRevenue).reduce((a, b) => a + b, 0).toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Instructions */}
            {!readOnly && (
                <div className="editor-instructions">
                    <p>
                        <strong>Tip:</strong> Click seats to select, Ctrl/Cmd+Click for multi-select.
                        Choose a seat type and click "Apply" to assign.
                    </p>
                </div>
            )}
        </div>
    );
};

export default EventSeatTypeEditor;
